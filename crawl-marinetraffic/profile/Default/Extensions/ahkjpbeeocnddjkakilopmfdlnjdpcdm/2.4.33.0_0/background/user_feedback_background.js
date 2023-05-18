KasperskyLab.AddRunner("ufb", (ns, session) =>
{
    function UserFeedback()
    {
        const m_redirects = new Map();
        const m_beforeRedirectMap = new Map();

        const userTransitionTypesToClearRedirects = new Set(["auto_bookmark", "typed", "generated", "form_submit", "reload"]);
        const userTransitionQualifiersToClearRedirects = new Set(["from_address_bar", "forward_back"]);

        const m_phfbWindow = new ns.PopupWindow("phfb", session, "/ufb/phishing_user_feedback_window.html", "/ufb/popup_window.css");
        const m_bwfbWindow = new ns.PopupWindow("bwfb", session, "/ufb/broken_webpage_user_feedback_window.html", "/ufb/popup_window.css");

        let m_callFunction = () => {};
        let m_cachedHrefUserClicked = "";

        function InitializePlugin()
        {
            session.InitializePlugin((activatePlugin, registerMethod, callFunction) =>
                {
                    m_callFunction = callFunction;
                    activatePlugin("ufb", OnPing);
                });
            browsersApi.runtime.onMessage.addListener(OnMessage);
            browsersApi.webNavigation.onCommitted.addListener(OnCommittedHandler);
            const filter = { urls: ["https://*/*", "http://*/*"] };
            browsersApi.webRequest.onBeforeRedirect.addListener(OnBeforeRedirectHandler, filter, []);
            browsersApi.tabs.onRemoved.addListener(OnRemovedHandler);
        }

        function CallActiveTab(resolve)
        {
            return report =>
            {
                browsersApi.tabs.query({ active: true, windowType: "normal", currentWindow: true }, result =>
                {
                    if (result.length > 0)
                    {
                        report.tabId = result[0].id;
                        report.url = result[0].url;
                        resolve(report);
                    }
                });
            };
        }

        function OnPing()
        {
            return ns.MaxRequestDelay;
        }

        function AddDocumentHTMLtoReport(resolve)
        {
            return report =>
            {
                browsersApi.tabs.executeScript({
                    code: "document.documentElement.innerHTML"
                }, executeResults =>
                {
                    report.webpage = "";
                    if (browsersApi.runtime.lastError)
                        KasperskyLab.Log("AddDocumentHTMLtoReport: cannot execute the script");
                    else if (typeof executeResults[0] === "undefined")
                        KasperskyLab.Log("AddDocumentHTMLtoReport: result not found");
                    else
                        report.webpage = executeResults[0];
                    resolve(report);
                });
            };
        }

        function AddRedirectsToReport(resolve)
        {
            return report =>
            {
                report.redirects = [];
                if (m_redirects.has(report.tabId) && m_redirects.get(report.tabId).length > 1)
                    report.redirects = m_redirects.get(report.tabId);
                resolve(report);
            };
        }

        function OnCommittedHandler(details)
        {
            if (details.frameId !== 0)
                return;

            const id = details.tabId;
            const url = details.url;

            let isNeedRemovePrevRedirects = userTransitionTypesToClearRedirects.has(details.transitionType);
            if (details.transitionType === "link")
            {
                for (let i = 0; i < details.transitionQualifiers.length; i++)
                {
                    if (userTransitionQualifiersToClearRedirects.has(details.transitionQualifiers[i]))
                    {
                        isNeedRemovePrevRedirects = true;
                        break;
                    }
                }
                if (!isNeedRemovePrevRedirects && m_cachedHrefUserClicked.length > 0)
                {
                    isNeedRemovePrevRedirects = m_cachedHrefUserClicked === details.url.replace(/#.*/, "");
                    if (isNeedRemovePrevRedirects)
                        m_cachedHrefUserClicked = "";
                }
            }
            if (isNeedRemovePrevRedirects || !m_redirects.has(id))
                m_redirects.set(id, []);

            if (m_beforeRedirectMap.has(id))
            {
                const redirects = m_beforeRedirectMap.get(id);
                for (let i = 0; i < redirects.length; i++)
                    m_redirects.get(id).push(redirects[i]);
                m_beforeRedirectMap.set(id, []);
            }
            m_redirects.get(id).push(url);
        }

        function OnBeforeRedirectHandler(details)
        {   
            if (details.frameId !== 0 || details.type !== "main_frame")
                return;
            const id = details.tabId;
            const url = details.url;

            if (!m_beforeRedirectMap.has(id))
                m_beforeRedirectMap.set(id, [url]);
            else
                m_beforeRedirectMap.get(id).push(url);
        }

        function OnRemovedHandler(tabId) 
        {
            if (m_redirects.has(tabId))
                m_redirects.delete(tabId);

            if (m_beforeRedirectMap.has(tabId))
                m_beforeRedirectMap.delete(tabId);
        }

        function OpenBwfbWindow(request)
        {
            return report => { m_bwfbWindow.Open(request, report); };
        }

        function OpenPhfbWindow(request)
        {
            return report => { m_phfbWindow.Open(request, report); };
        }

        function OnMessage(request)
        {
            try
            {
                if (browsersApi.runtime.lastError)
                    ns.SessionLog(`Failed onMessage of user feeback background ${browsersApi.runtime.lastError.message}`);
                if (request.command === "bwfb.openWindow")
                {
                    const report = {};
                    CallActiveTab(
                        AddDocumentHTMLtoReport(
                            OpenBwfbWindow(request)
                        )
                    )(report);
                }
                else if (request.command === "phfb.openWindow")
                {
                    const report = {};
                    CallActiveTab(
                        AddDocumentHTMLtoReport(
                            AddRedirectsToReport(
                                OpenPhfbWindow(request)
                            )
                        )
                    )(report);
                }
                else if (request.command === "ufb.sendReport")
                {
                    if (request.report.type === "ufb.phishing")
                        SendPhishingReport(request.report);
                    else if (request.report.type === "ufb.broken_webpage")
                        SendBrokenWebpageReport(request.report);
                }
                else if (request.command === "ufb.openPhishingInfo")
                {
                    OpenPhishingInfo();
                }
                else if (request.command === "ufb.cacheUserClick")
                {
                    m_cachedHrefUserClicked = request.url;
                }
            }
            catch (e)
            {
                ns.SessionError(e, "ufb");
            }
        }

        function SendPhishingReport(report)
        {
            m_callFunction("phfb_popup.send_report", { url: report.url, webpage: report.webpage, redirects: report.redirects });
        }

        function SendBrokenWebpageReport(report)
        {
            m_callFunction("bwfb_popup.send_report", { url: report.url, webpage: report.webpage, userText: report.userText });
        }

        function OpenPhishingInfo()
        {
            m_callFunction("phfb_popup.open_info");
        }

        InitializePlugin();
    }

    let instance = null;
    ns.RunModule(() => 
    {
        if (!instance)
            instance = new UserFeedback();
    });
});
