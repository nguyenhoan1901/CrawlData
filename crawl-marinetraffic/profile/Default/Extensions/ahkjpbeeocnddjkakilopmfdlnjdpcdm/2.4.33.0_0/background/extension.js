function ButtonControl()
{
    function getIconPath(iconId)
    {
        const paths = {};
        const sizes = ["19", "38"];
        for (const size of sizes)
        {
            const path = `/images/button/${iconId}_${size}.png`;
            paths[size] = browsersApi.extension.getURL(path);
        }
        return paths;
    }

    this.resetToFactory = () =>
    {
        const manifest = browsersApi.runtime.getManifest();
        const title = manifest.browser_action ? manifest.browser_action.default_title : manifest.action.default_title;
        const factoryState = {
            badgeBackgroundColor: "000000", 
            label: title,
            iconId: "inactive"
        };
        this.setDefaultState(factoryState);
    };

    this.setDefaultState = state =>
    {
        this.setState(null, state);
        browsersApi.browserAction.setTitle({
            title: state.label
        });
    };

    this.setState = (tabId, state) =>
    {
        browsersApi.browserAction.setBadgeText({
            tabId: tabId,
            text: state.badgeText || ""
        });
        if (state.badgeBackgroundColor)
        {
            browsersApi.browserAction.setBadgeBackgroundColor({
                tabId: tabId,
                color: `#${state.badgeBackgroundColor}`
            });
        }
        browsersApi.browserAction.setIcon({
            tabId: tabId,
            path: getIconPath(state.iconId)
        });
    };

    this.resetToFactory();
}

KasperskyLab.AddRunner("light_ext", (ns, session, settings) =>
{
function OnSessionConnected(result)
{
    try
    {
        ns.SessionLog("Start light_ext session connection");
        if (result !== 0)
            throw new Error(`Connect returned result=${result}`);

        KasperskyLab.Log("Connection with the product is discovered.");
        KasperskyLab.IsConnectedToProduct = true;

        ns.SessionLog(`${browsersApi.runtime.id}/${browsersApi.runtime.getManifest().version}/${navigator.userAgent.toString()} is online.`);

        browsersApi.runtime.onMessage.addListener(HandleRuntimeMessages);
        browsersApi.runtime.onMessage.removeListener(QueueRuntimeMessages);

        ProcessQueuedRuntimeMessages();

        ns.SessionLog("Finish light_ext session connection");
    }
    catch (e)
    {
        ns.SessionLog(e, "light_ext");
        OnError(e);
    }
}

function OnPing()
{
    return ns.MaxRequestDelay;
}

function OnError()
{
    OnDisconnect();
}

function SplitTabId(encodedTabId)
{
    const result = encodedTabId.match(/(\w*).tab.(\d*):(\d*).(\d*)/);
    const browser = result[1];
    const windowId = parseInt(result[2], 10);
    const tabId = parseInt(result[3], 10);
    const frameId = parseInt(result[4], 10);
    return { browser: browser, windowId: windowId, tabId: tabId, frameId: frameId };
}

function ValidateTabId(encodedTabId)
{
    const parts = SplitTabId(encodedTabId);
    return parts.browser === KasperskyLab.BrowserName;
}

function HandleRuntimeMessages(request, sender, sendResponse)
{
    try
    {
        if (browsersApi.runtime.lastError)
        {
            KasperskyLab.SessionError(`Error on HandleRuntimeMessages: ${browsersApi.runtime.lastError.message}`, "light_ext");
            return;
        }
        if (request.command === "reloadActiveTab")
        {
            if (KasperskyLab.IsSenderPopup(sender))
                browsersApi.tabs.reload();
        }
        else if (request.command === "getContentStartupParameters")
        {
            if (!sender.tab)
            {
                KasperskyLab.SessionLog(`sender.tab is undefined, wait for retry. Sender is: ${KasperskyLab.JSONStringify(sender)}`, "light_ext");
                return;
            }

            KasperskyLab.TrySendResponse(sendResponse, {
                tabId: KasperskyLab.EncodeTabId(sender.tab.windowId, sender.tab.id, sender.frameId),
                isConnectedToProduct: KasperskyLab.IsConnectedToProduct,
                pluginId: browsersApi.runtime.id
            });
        }
    }
    catch (e)
    {
        KasperskyLab.SessionError(e, "light_ext");
    }
}

function ProcessQueuedRuntimeMessages()
{
    for (const msg of m_queuedRequests)
        HandleRuntimeMessages(msg.request, msg.sender, msg.sendResponse);
    m_queuedRequests = [];
}

function OnDisconnect()
{
    try
    {
        KasperskyLab.Log("Connection with the product is lost.");
        KasperskyLab.IsConnectedToProduct = false;

        browsersApi.runtime.onMessage.removeListener(HandleRuntimeMessages);
        browsersApi.runtime.onMessage.addListener(QueueRuntimeMessages);

        m_buttonControl.resetToFactory();
    }
    catch (e)
    {
        ns.SessionError(e, "light_ext");
    }
}

function QueueRuntimeMessages(request, sender, sendResponse)
{
    if (browsersApi.runtime.lastError)
    {
        KasperskyLab.SessionError(`Error on QueueRuntimeMessages for light ext with error: ${browsersApi.runtime.lastError.message}`, "light_ext");
        return false;
    }

    m_queuedRequests.push({
        request: request,
        sender: sender,
        sendResponse: sendResponse
    });
    return true;
}

browsersApi.runtime.onMessage.addListener(QueueRuntimeMessages);
ns.SessionLog("Start light_ext");
KasperskyLab.IsConnectedToProduct = false;
const m_buttonControl = new ButtonControl();
let m_queuedRequests = [];
session.InitializePlugin((activatePlugin, registerMethod, callFunction) =>
    {
        activatePlugin("light_ext", OnPing, OnError);
        registerMethod("light_ext.setDefaultButtonState", state =>
            {
                m_buttonControl.setDefaultState(state);
            });
        registerMethod("light_ext.setButtonStateForTab", args =>
            {
                if (!ValidateTabId(args.tabId))
                    return;
                const tabIdParts = SplitTabId(args.tabId);
                const state = args.buttonState ? args.buttonState : ns.JSONParse(args.state); 
                m_buttonControl.setState(tabIdParts.tabId, state);
            });
        registerMethod("light_ext.openNewTab", args =>
            {
                browsersApi.tabs.create({ url: args.url }); 
            });
        registerMethod("light_ext.reload", args =>
            {
                if (!ValidateTabId(args.tabId))
                    return;
                const tabIdParts = SplitTabId(args.tabId);
                if (tabIdParts.frameId === 0)
                {
                    browsersApi.tabs.reload(tabIdParts.tabId, { bypassCache: true });
                }
                else
                {
                    browsersApi.tabs.executeScript(tabIdParts.tabId,
                    {
                        frameId: tabIdParts.frameId,
                        code: "document.location.reload(true)"
                    });
                }
            });

        if (!settings.productVersion)
        {
            callFunction("light_ext.connect", [], OnSessionConnected, OnError); 
        }
        else
        {
            if (ns.IsDefined(settings.defaultButtonState))
                m_buttonControl.setDefaultState(settings.defaultButtonState);
            OnSessionConnected(0);
        }
    });
});
