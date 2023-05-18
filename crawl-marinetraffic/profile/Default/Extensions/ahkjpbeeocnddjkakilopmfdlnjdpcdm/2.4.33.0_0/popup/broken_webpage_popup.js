KasperskyLab.AddRunner("bwfb_popup", (ns, session, settings, locales) =>
{
    function BrokenWebpageFeedbackPopup()
    {
        let m_settings = null;

        function InitializePlugin()
        {
            LocalizeElement("PopupBwfbTitle", locales);
            SetClickHandler("OpenBwfbWindowButton", OnOpenBwfbWindowClick);

            SetSettings(settings);
            session.InitializePlugin((activatePlugin, registerMethod) =>
                {
                    activatePlugin("bwfb_popup", OnPing, OnError);
                    registerMethod("bwfb_popup.updateSettings", SetSettings);
                });
        }

        function OnPing()
        {
            return ns.MaxRequestDelay;
        }

        function OnError()
        {
            ns.ApplyStyle("bwfb", []);
        }

        function OnOpenBwfbWindowClick()
        {
            browsersApi.runtime.sendMessage({
                command: "bwfb.openWindow",
                settings: m_settings,
                locales: locales,
                screen: { width: screen.width, height: screen.height }
            }, () =>
            {
                if (browsersApi.runtime.lastError)
                    ns.Log(`bwfb.openWindow failed with error ${browsersApi.runtime.lastError.message}`);
            });
        }

        function SetSettings(bwpSettings)
        {   
            m_settings = bwpSettings;
            KasperskyLab.ApplyStyle("bwfb", ["bwfb"]);
        }

        InitializePlugin();
    }

    let instance = null;
    ns.RunModule(() =>
    {
        if (!instance)
            instance = new BrokenWebpageFeedbackPopup();
    });
});
