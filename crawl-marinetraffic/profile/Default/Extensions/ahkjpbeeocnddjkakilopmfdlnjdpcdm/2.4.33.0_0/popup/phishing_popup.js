KasperskyLab.AddRunner("phfb_popup", (ns, session, startSettings, locales) =>
{
    function PhishingFeedbackPopup()
    {
        let m_settings = null;

        function InitializePlugin()
        {
            LocalizeElement("PopupPhfbTitle", locales);
            SetClickHandler("OpenPhfbWindowButton", OnOpenPhfbWindowClick);

            SetSettings(startSettings);
            session.InitializePlugin((activatePlugin, registerMethod) =>
                {
                    activatePlugin("phfb_popup", OnPing, OnError);
                    registerMethod("phfb_popup.updateSettings", SetSettings);
                });
        }

        function OnPing()
        {
            return ns.MaxRequestDelay;
        }

        function OnError()
        {
            ns.ApplyStyle("phfb", []);
        }

        function OnOpenPhfbWindowClick()
        {
            browsersApi.runtime.sendMessage({
                command: "phfb.openWindow",
                settings: m_settings,
                locales: locales,
                screen: { width: screen.width, height: screen.height }
            }, () =>
            {
                if (browsersApi.runtime.lastError)
                    ns.Log(`phfb.openWindow failed with error ${browsersApi.runtime.lastError.message}`);
            });
        }

        function SetSettings(settings)
        {
            m_settings = settings;
            KasperskyLab.ApplyStyle("phfb", ["phfb"]);
        }

        InitializePlugin();
    }

    let instance = null;
    ns.RunModule(() =>
    {
        if (!instance)
            instance = new PhishingFeedbackPopup();
    });
});
