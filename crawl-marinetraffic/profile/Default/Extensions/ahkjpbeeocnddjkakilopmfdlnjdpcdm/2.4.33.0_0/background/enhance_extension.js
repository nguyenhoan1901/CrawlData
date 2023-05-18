
let m_spMode = false;
let m_requestErrorCallback = () => {};

function CheckSsl()
{
    try
    {
        const testPath = "https://kis.v2.scr.kaspersky-labs.com/EA197A76-0239-4421-A1EB-1042723EEF3A";
        fetch(testPath)
            .catch(() =>
            {
                m_spMode = true;
                m_requestErrorCallback();
            });
    }
    catch (e)
    {
    }
}

CheckSsl();

KasperskyLab.AddRunner("ee", (ns, session, startSettings) =>
{
let m_callFunction = () => {};
const m_redirectIdList = {};
const m_redirectUrlList = {};

const DomainFilteringModeSkipAll = 0; 
const DomainFilteringModeProcessAll = 1;

let m_isDomainFilteringSupported = typeof startSettings.queueLimit !== "undefined";
let m_operationMode = startSettings.mode;
let m_queueLimit = startSettings.queueLimit;
let m_cacheLimit = startSettings.domainsCacheLimit;
let m_requestsCacheLimit = startSettings.requestsCacheLimit;

let m_isControledByProduct = typeof startSettings.isInterceptionEnabled !== "undefined";
let m_isInterceptionEnabled = m_isControledByProduct && startSettings.isInterceptionEnabled;
let m_isTabRedirectByBlockedResourceDisabled = typeof startSettings.isTabRedirectByBlockedResourceDisabled !== "undefined"
    && startSettings.isTabRedirectByBlockedResourceDisabled;

const m_domainsQueue = [];
let m_domains = new Set();
const m_pendingRequests = new Map();
const m_pendingRedirects = new Set();

let m_interceptMode = CalculateInterceptMode();
let m_noFilteringMode = CalculateNoFilteringMode();

function CalculateInterceptMode()
{
    return m_isInterceptionEnabled && (!m_isDomainFilteringSupported || (m_isDomainFilteringSupported && m_operationMode !== DomainFilteringModeSkipAll));
}

function CalculateNoFilteringMode()
{
    return !m_isDomainFilteringSupported || m_operationMode === DomainFilteringModeProcessAll;
}

function onPing()
{
    return ns.MaxRequestDelay;
}

function AddOrUpdate(cache, key, redirectUrl, whiteUrl)
{
    const redirectInfo = { redirectUrl: redirectUrl };
    if (whiteUrl)
        redirectInfo.whiteUrl = whiteUrl;
    const oldInfo = cache[key];
    if (oldInfo && oldInfo.cleanupTimer)
        clearTimeout(oldInfo.cleanupTimer);

    cache[key] = redirectInfo;
    redirectInfo["cleanupTimer"] = ns.SetTimeout(() => { delete cache[key]; }, 1000 * 60 * 60);
}

function GetRedirectInfo(requestId, requestUrl)
{
    let redirectInfo = m_redirectIdList[requestId];

    if (redirectInfo)
    {
        AddOrUpdate(m_redirectIdList, requestId, redirectInfo.redirectUrl);
    }
    else
    {
        redirectInfo = m_redirectUrlList[requestUrl];
        if (redirectInfo)
            AddOrUpdate(m_redirectUrlList, requestUrl, redirectInfo.redirectUrl, redirectInfo.whiteUrl);
        else
            return null;
    }

    return redirectInfo;
}

function GetBlockingResponseObject(requestId, requestUrl, type, canBeCanceled)
{
    const blockingResponseObject = {};
    const redirectInfo = GetRedirectInfo(requestId, requestUrl);
    if (!redirectInfo)
        return blockingResponseObject;
    if (type !== "main_frame")
    {
        if (canBeCanceled)
            blockingResponseObject.cancel = true;
    }
    else
    {
        blockingResponseObject.redirectUrl = redirectInfo.redirectUrl;
        callToService("redirectHandled", { redirected: true, requestId: requestId });
    }
    return blockingResponseObject;
}

function onBeforeRequestHandler(details)
{
    return GetBlockingResponseObject(details.requestId, details.url, details.type, true);
}


function onAuthRequired(details)
{
    return GetBlockingResponseObject(details.requestId, details.url, details.type);
}

function ProcessRedirectObject(details)
{
    const redirectInfo = GetRedirectInfo(details.requestId, details.url);
    if (!redirectInfo)
        return;

    const redirectCallback = () =>
    {
        try
        {
            const redirected = !browsersApi.runtime.lastError;
            callToService("redirectHandled", { redirected: redirected, requestId: details.requestId });
        }
        catch (e)
        {
            KasperskyLab.SessionError(e);
        }
    };

    if (details.type !== "main_frame")
    {
        if (m_isTabRedirectByBlockedResourceDisabled)
            callToService("redirectHandled", { redirected: false, requestId: details.requestId });
        else
            browsersApi.tabs.reload(details.tabId, { bypassCache: true }, redirectCallback);
    }
    else
    {
        browsersApi.tabs.update(details.tabId, { url: redirectInfo.redirectUrl }, redirectCallback);
    }
}

function onBeforeNavigate(details)
{
    const keys = Object.keys(m_redirectUrlList);
    for (const key of keys)
    {
        const item = m_redirectUrlList[key];
        if (!item.whiteUrl || item.whiteUrl !== details.url)
            continue;

        if (item.cleanupTimer)
            clearTimeout(item.cleanupTimer);

        delete m_redirectUrlList[key];
    }
}

function onBeforeSendHeaders(details)
{
    const eventInfo =
    {
        requestId: details.requestId,
        url: details.url,
        method: details.method,
        resourceType: details.type,
        tabId: details.tabId,
        frameId: details.frameId,
        requestHeaders: details.requestHeaders || [],
        isRedirect: m_pendingRedirects.delete(details.requestId)
    };
    if (!eventInfo.requestHeaders.find(header => header.name === "referer") && details.initiator)
        eventInfo.requestHeaders.push({ name: "referer", value: details.initiator });

    ProcessEvent(details, "sendHeaders", eventInfo);
    return GetBlockingResponseObject(details.requestId, details.url, details.type, true);
}

function onHeadersReceived(details)
{
    const eventInfo =
    {
        requestId: details.requestId,
        statusLine: details.statusLine,
        statusCode: details.statusCode,
        responseHeaders: details.responseHeaders
    };

    ProcessEvent(details, "headersReceived", eventInfo);
    return GetBlockingResponseObject(details.requestId, details.url, details.type, true);
}

function onBeforeRedirect(details)
{
    m_pendingRedirects.add(details.requestId);
}

function SendNotificationByIndex(list, index)
{
    while (list[index].notifications.length)
    {
        const notification = list[index].notifications.shift();
        callToService(notification.methodName, notification.methodParam);
    }
    list.splice(index, 1);
}

function ProcessRequestComplete(details)
{
    if (m_spMode || m_interceptMode || m_noFilteringMode)
        return true;
    const domain = new URL(details.url).hostname.toLowerCase();
    if (m_domains.has(domain))
        return true;

    const domainRequestsSlot = m_pendingRequests.get(domain);
    if (domainRequestsSlot)
    {
        const index = domainRequestsSlot.findIndex(element => element.requestId === details.requestId);
        if (index !== -1)
            domainRequestsSlot.splice(index, 1);
        if (domainRequestsSlot.length === 0)
            m_pendingRequests.delete(domain);
    }
    return false;
}

function onCompleted(details)
{
    if (ProcessRequestComplete(details))
        callToService("requestComplete", { requestId: details.requestId });
    ProcessRedirectObject(details);
}

function onRequestError(details)
{
    if (ProcessRequestComplete(details))
        callToService("requestError", { requestId: details.requestId, error: details.error });
}

function callToService(commandPostfix, args)
{
    m_callFunction(`ee.${commandPostfix}`, args);
}

function ProcessEvent(details, method, methodData)
{
    if (m_spMode || m_interceptMode || m_noFilteringMode)
    {
        callToService(method, methodData);
        return;
    }

    const domain = new URL(details.url).hostname.toLowerCase();
    if (m_domains.has(domain))
    {
        callToService(method, methodData);
        return;
    }
    let domainRequestsSlot = m_pendingRequests.get(domain);
    if (!domainRequestsSlot)
    {
        domainRequestsSlot = [];
        m_pendingRequests.set(domain, domainRequestsSlot);
    }
    let index = domainRequestsSlot.findIndex(element => element.requestId === details.requestId);
    if (index === -1)
    {
        domainRequestsSlot.push({ requestId: details.requestId, notifications: [] });
        index = domainRequestsSlot.length - 1;
    }

    domainRequestsSlot[index].notifications.push({ methodName: method, methodParam: methodData });
    if (domainRequestsSlot[index].notifications.length > m_requestsCacheLimit)
        domainRequestsSlot[index].notifications.shift();
}

function OnRedirectCall(redirectDetails)
{
    if (redirectDetails.requestUrl)
        AddOrUpdate(m_redirectUrlList, redirectDetails.requestUrl, redirectDetails.url, redirectDetails.whiteUrl);
    else
        AddOrUpdate(m_redirectIdList, redirectDetails.requestId, redirectDetails.url);

    ns.SetTimeout(() =>
    {
    const details = { requestId: redirectDetails.requestId, url: redirectDetails.requestUrl, type: redirectDetails.type, tabId: redirectDetails.tabId };
    ProcessRedirectObject(details);
    }, 500);
}

function SubscribeToRequestEvents()
{
    var filter = { urls: ["https://*/*"] };

    browsersApi.webRequest.onBeforeRedirect.addListener(onBeforeRedirect, filter, []);
    const blockingOption = ["blocking"];
    browsersApi.webRequest.onBeforeRequest.addListener(onBeforeRequestHandler, filter, blockingOption);
    browsersApi.webRequest.onBeforeSendHeaders.addListener(onBeforeSendHeaders, filter, blockingOption);
    browsersApi.webRequest.onHeadersReceived.addListener(onHeadersReceived, filter, blockingOption);
    browsersApi.webRequest.onAuthRequired.addListener(onAuthRequired, filter, blockingOption);
    browsersApi.webRequest.onCompleted.addListener(onCompleted, filter, []);
    browsersApi.webRequest.onErrorOccurred.addListener(onRequestError, filter);
}

function OnSetSettings(settings)
{
    m_isDomainFilteringSupported = settings && typeof settings.queueLimit !== "undefined";
    m_operationMode = settings.mode;
    m_queueLimit = settings.queueLimit;
    m_cacheLimit = settings.domainsCacheLimit;
    m_requestsCacheLimit = settings.requestsCacheLimit;
    m_isControledByProduct = settings && typeof settings.isInterceptionEnabled !== "undefined";
    m_isInterceptionEnabled = m_isControledByProduct && settings.isInterceptionEnabled;
    m_isTabRedirectByBlockedResourceDisabled = settings && typeof settings.isTabRedirectByBlockedResourceDisabled !== "undefined"
        && settings.isTabRedirectByBlockedResourceDisabled;

    m_interceptMode = CalculateInterceptMode();
    m_noFilteringMode = CalculateNoFilteringMode();
}

function SendCachedNotifications(domain)
{
    const domainRequestsSlot = m_pendingRequests.get(domain);
    if (!domainRequestsSlot)
        return;

    while (domainRequestsSlot.length)
        SendNotificationByIndex(domainRequestsSlot, 0);

    m_pendingRequests.delete(domain);
}

function OnDomainFilteringRequested(connectionInfo)
{
    const domain = connectionInfo.domain.toLowerCase();
    if (m_domainsQueue.length >= m_queueLimit)
        m_domainsQueue.shift();
    m_domainsQueue.push(domain);
    if (m_domains.size < m_cacheLimit)
        m_domains.add(domain);
    else
        m_domains = new Set(m_domainsQueue);
    SendCachedNotifications(domain);
}

function onPluginInitialized(activatePlugin, registerMethod, callFunction)
{
    m_callFunction = callFunction;

    activatePlugin("ee", onPing);
    registerMethod("ee.redirect", OnRedirectCall);
    registerMethod("ee.setSettings", OnSetSettings);
    registerMethod("ee.onDomainFilteringRequested", OnDomainFilteringRequested);

    ns.SessionLog(`Subscribe with modes: sp = ${m_spMode}, intercept = ${m_interceptMode}, noFilter = ${m_noFilteringMode}.`);
    SubscribeToRequestEvents();
    browsersApi.webNavigation.onBeforeNavigate.addListener(onBeforeNavigate);
}

function InitializePlugin()
{
    const initFunction = () => { session.InitializePlugin(onPluginInitialized); };
    if (m_spMode || m_isControledByProduct)
        initFunction();
    else
        m_requestErrorCallback = initFunction;
}

InitializePlugin();
});

