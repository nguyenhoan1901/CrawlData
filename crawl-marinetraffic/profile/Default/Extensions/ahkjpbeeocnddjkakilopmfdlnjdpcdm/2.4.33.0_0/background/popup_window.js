(function PopupWindowMain(ns) 
{
    ns.PopupWindow = function PopupWindow(pluginName, session, windowSrc, windowCssPostfix)
    {
        let m_cssData = "";
        let m_settings = null;
        let m_locales = null;
        let m_report = null;
        const m_windowResourceUrl = GetResourceUrl();

        function GetResourceUrl()
        {
            return browsersApi.extension.getURL(`snapshot_resources${windowSrc}`); 
        }

        function CreateWindow(screen)
        {
            const popupUrl = GetResourceUrl();
            browsersApi.windows.create({
                    url: popupUrl,
                    type: "popup",
                    height: 1,
                    width: 1,
                    left: screen.width,
                    top: screen.height
                });
        }

        function OnCssLoad(data)
        {
            m_cssData = data;
        }

        function OnCssLoadError(errorMessage)
        {
            ns.SessionError({ message: `Failed load ufb css resource. Error message: ${errorMessage}`, details: `windowCssPostfix: ${windowCssPostfix}` });
        }

        function OnInitReceived()
        {
            browsersApi.runtime.sendMessage({
                receiver: m_windowResourceUrl,
                command: "init", 
                initData: { pluginName: pluginName, report: m_report, locales: m_locales, settings: m_settings, cssData: m_cssData }
            }, () =>
            {
                if (browsersApi.runtime.lastError)
                    console.log(`init user feedback window failed with error ${browsersApi.runtime.lastError.message}`); 
            });
        }

        function OnMessage(message)
        {
            if (browsersApi.runtime.lastError)
                console.log(`init user feedback window failed with error ${browsersApi.runtime.lastError.message}`); 

            if (message.sender === GetResourceUrl())
            {
                if (message.command === "init")
                    OnInitReceived();
            }
        }

        function Init()
        {
            if (windowCssPostfix)
                session.GetResource(windowCssPostfix, OnCssLoad, OnCssLoadError);

            browsersApi.runtime.onMessage.addListener(OnMessage);
        }

        this.Open = function Open(request, report)
        {
            m_report = report;
            m_settings = request.settings;
            m_locales = request.locales;
            CreateWindow(request.screen);
        };

        Init();
    };
})(KasperskyLab || {});
