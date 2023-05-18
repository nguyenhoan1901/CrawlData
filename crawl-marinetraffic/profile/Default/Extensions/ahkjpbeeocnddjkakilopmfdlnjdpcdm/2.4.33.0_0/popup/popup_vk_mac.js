KasperskyLab.AddRunner("popup_vk_mac", (ns, session) =>
{
    function PopupVkMac()
    {
        let m_callFunction = ns.EmptyFunc;

        function OnPing()
        {
            return ns.MaxRequestDelay;
        }

        function OnError()
        {
            ns.ApplyStyle("vk", []);
        }

        function Run()
        {
            SetClickHandler("PopupVkMacOpenButtonText", OnOpenVkClick);

            session.InitializePlugin((activatePlugin, registerMethod, callFunction) =>
                {
                    m_callFunction = callFunction;
                    activatePlugin("popup_vk_mac", OnPing, OnError);
                });
        }

        function OnOpenVkClick()
        {
            browsersApi.tabs.query({ active: true, windowType: "normal", currentWindow: true }, tabs =>
                {
                    if (tabs.length > 0)
                    {
                        browsersApi.tabs.sendMessage(tabs[0].id, { command: "vk_mac.getHref" }, response => 
                            {
                                if (browsersApi.runtime.lastError)
                                {
                                    KasperskyLab.SessionError(`Error on OnOpenVkClick: ${browsersApi.runtime.lastError.message}`, "popup_vk_mac");
                                    return;
                                }
                                m_callFunction("popup_vk_mac.show", { url: response.url, fromPopup: true });
                            });
                    }
                });
        }

        Run();
    }

    let instance = null;
    ns.RunModule(() =>
    {
         if (!instance)
             instance = new PopupVkMac();
    });
});
