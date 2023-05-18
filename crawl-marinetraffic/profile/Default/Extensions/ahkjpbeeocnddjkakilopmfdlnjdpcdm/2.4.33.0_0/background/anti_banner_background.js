KasperskyLab.AddRunner("ab_background", (ns, session, startSettings, locales) =>
{
    let m_callFunction = () => {};
    let m_isTaskEnabled = false;

    function OnPing()
    {
        return ns.MaxRequestDelay;
    }
    function AddContextMenu()
    {
        Cleanup();
        browsersApi.contextMenus.create({
            id: "AddToBlockList",
            title: locales["AntiBannerContextMenuPrompt"],
            contexts: ["image"],
            targetUrlPatterns: ["http://*/*", "https://*/*"]
        });
        chrome.contextMenus.onClicked.addListener(HandleAddToBlockList);
    }

    function Cleanup()
    {
        browsersApi.contextMenus.removeAll();
    }

    function HandleAddToBlockList(args)
    {
        m_callFunction("ab_background.AddToBlockList", { src: args.srcUrl });
    }
    function SetTaskEnabled(isTaskEnabled)
    {
        if (isTaskEnabled === m_isTaskEnabled)
            return;
        m_isTaskEnabled = isTaskEnabled;
        if (m_isTaskEnabled)
            AddContextMenu();
        else
            Cleanup();
    }
    function OnSetTaskEnabled(settings)
    {
        SetTaskEnabled(settings.isTaskEnabled);
    }

    function Init()
    {
        session.InitializePlugin((activatePlugin, registerMethod, callFunction) =>
            {
                m_callFunction = callFunction;
                activatePlugin("ab_background", OnPing, Cleanup);
                registerMethod("ab_background.setTaskEnabled", OnSetTaskEnabled);
            });
        SetTaskEnabled(startSettings.isTaskEnabled);
    }

    Init();
});
