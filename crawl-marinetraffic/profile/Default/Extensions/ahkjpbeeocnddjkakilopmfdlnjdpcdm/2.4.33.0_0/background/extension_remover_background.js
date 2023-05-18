KasperskyLab.AddRunner("erb", (ns, session) =>
{
    let m_callFunction = () => {};
    const m_interestingDomain = "http://touch.kaspersky.com";

    function Initialize()
    {
        session.InitializePlugin((activatePlugin, registerMethod, callFunction) => { m_callFunction = callFunction; });
        browsersApi.tabs.onCreated.addListener(OnCreatedTab);
        browsersApi.tabs.onUpdated.addListener(OnUpdatedTab);
        browsersApi.tabs.query({ url: `${m_interestingDomain}/*` }, ProcessExistTabs);
    }

    function GetRemoverHtmlBase()
    {
        return browsersApi.runtime.getURL("additional/extension_remover.html?id=");
    }

    function OnCreatedTab(tab)
    {
        if (chrome.runtime.lastError)
        {
            ns.SessionLog(`Error occured on remover OnCreatedTab: ${chrome.runtime.lastError.message}`);
            return;
        }
        ProcessTabSafe(tab);
    }

    function OnUpdatedTab(tabId, changeInfo, tab)
    {
        if (chrome.runtime.lastError)
        {
            ns.SessionLog(`Error occured on remover OnUpdatedTab: ${chrome.runtime.lastError.message}`);
            return;
        }
        if (changeInfo.url)
            ProcessTabSafe(tab);
    }

    function ProcessExistTabs(tabs)
    {
        if (browsersApi.runtime.lastError)
        {
            ns.SessionLog(`Query tabs failed with error ${browsersApi.runtime.lastError.message}`);
            return;
        }
        if (!tabs)
            return;

        for (const tab of tabs)
            ProcessTabSafe(tab);
    }

    function ProcessRedirectResponse(tab, res, args)
    {
        if (res === 0)
            browsersApi.tabs.update(tab.tabId, { url: `${GetRemoverHtmlBase()}${args.id}` });
    }

    function RequestRedirectTarget(tab)
    {
        m_callFunction("erb.requestRedirect", { url: tab.url }, (res, args) => { ProcessRedirectResponse(tab, res, args); });
    }

    function ProcessTabSafe(tab)
    {
        try
        {
            if (!tab.url)
                return;

            if (tab.url.indexOf(m_interestingDomain) === 0)
            {
                RequestRedirectTarget(tab);
                ns.SessionLog(`Found internal url: ${tab.url}`);
            }
        }
        catch (e)
        {
            ns.SessionLog(e);
        }
    }

    Initialize();
});
