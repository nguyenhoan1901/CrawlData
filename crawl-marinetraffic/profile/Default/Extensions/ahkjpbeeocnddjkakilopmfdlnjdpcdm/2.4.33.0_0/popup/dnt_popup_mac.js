KasperskyLab.AddRunner("dnt_popup_mac", (ns, session) =>
{
    function DntPopupMac()
    {
        let m_callFunction = ns.EmptyFunc;

        function OnPing()
        {
            return ns.MaxRequestDelay;
        }

        function OnError() {}

        function SetBlockCounters(blocked, notBlocked)
        {
            document.getElementById("totalAttemptsBlockedCounter").innerText = blocked;
            document.getElementById("totalAttemptsNotBlockedCounter").innerText = notBlocked;
        }

        function OnFullReportClick()
        {
            m_callFunction("dnt_popup.reports");
        }

        function GetCounters()
        {
            browsersApi.tabs.query({ active: true, windowType: "normal", currentWindow: true }, tabs =>
                {
                    if (tabs.length > 0)
                        m_callFunction("dnt_popup_mac.get_counters", { url: tabs[0].url });
                });
        }

        function OnUpdateBlockCounters(counters)
        {
            SetBlockCounters(counters.blockedCount, counters.notBlockedCount);
        }

        function InitializePlugin()
        {
            SetClickHandler("PopupFullReportLabel", OnFullReportClick);
            SetClickHandler("PopupFullReportArrow", OnFullReportClick);

            session.InitializePlugin((activatePlugin, registerMethod, callFunction) =>
                {
                    m_callFunction = callFunction;
                    activatePlugin("dnt_popup_mac", OnPing, OnError);
                    registerMethod("dnt_popup_mac.updateBlockedCounters", OnUpdateBlockCounters);

                    GetCounters();
                });
        }

        InitializePlugin();
    }

    let instance = null;
    ns.RunModule(() =>
    {
        if (!instance)
            instance = new DntPopupMac();
    });
});
