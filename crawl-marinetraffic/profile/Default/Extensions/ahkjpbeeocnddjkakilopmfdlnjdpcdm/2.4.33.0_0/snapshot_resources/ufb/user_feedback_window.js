let PhishingUserFeedbackWindow = function PhishingUserFeedbackWindow(settings, locales, report)
{
    let m_webPageLimitInCharactersSize = 0;
    let m_isAreaExpanded = false;

    function OpenInfo()
    {
        browsersApi.runtime.sendMessage({ command: "ufb.openPhishingInfo" }, () =>
            {
                if (browsersApi.runtime.lastError)
                    console.log(`ufb.openPhishingInfo failed with error ${browsersApi.runtime.lastError.message}`); 
            }); 
        if (locales["WindowPhfbOpenInfoLink"])
            window.open(locales["WindowPhfbOpenInfoLink"]);
    }

    function SendReport()
    {
        SetDialogView();
        let isLimitExceeded = report.webpage.length > m_webPageLimitInCharactersSize;
        if (isLimitExceeded)
            report.webpage = report.webpage.substr(0, m_webPageLimitInCharactersSize);

        browsersApi.runtime.sendMessage({ command: "ufb.sendReport", report: report }, () =>
            {
                if (browsersApi.runtime.lastError)
                    console.log(`ufb.sendReport failed with error ${browsersApi.runtime.lastError.message}`); 
            });
    }

    function SetSettings()
    {
        m_webPageLimitInCharactersSize = settings.webPageLimitInKbSize * 1024 / 2;
    }
    function CreateRedirectedSitesText()
    {
        let text = "";
        for (let i = 0; i < report.redirects.length; i++)
        {
            text += report.redirects[i] + "\n";
        }
        return text;
    }

    function ExpandArea()
    {
        if (m_isAreaExpanded === false)
        {
            ChangeClassAttribute("area-web-page-url-not-expanded", "area-web-page-url-expanded");
            ChangeClassAttribute("expand-button-ufb-image-not-expanded", "expand-button-ufb-image-expanded");
            document.getElementById("WindowPhfbExpandButtonText").innerText = locales["WindowPhfbExpandButtonTextAfter"];
            m_isAreaExpanded = true;
        }
        else
        {
            ChangeClassAttribute("area-web-page-url-expanded", "area-web-page-url-not-expanded");
            ChangeClassAttribute("expand-button-ufb-image-expanded", "expand-button-ufb-image-not-expanded");
            document.getElementById("WindowPhfbExpandButtonText").innerText = locales["WindowPhfbExpandButtonTextBefore"];
            m_isAreaExpanded = false;
        }
    }

    function Init()
    {
        window.document.title = locales["PopupWindowPhfbTitle"];
        LocalizeElement("WindowPhfbTitleText", locales);
        LocalizeElement("WindowPhfbInfoText", locales);
        LocalizeElement("WindowPhfbWebsiteTitleText", locales);
        LocalizeElement("WindowPhfbRedirectedSitesTitleText", locales);
        LocalizeElement("WindowPhfbAgreementText", locales);
        LocalizeElement("WindowPhfbReportButtonText", locales);
        LocalizeElement("WindowPhfbThanksText", locales);
        LocalizeElement("WindowPhfbAnalysisText", locales);
        LocalizeElement("WindowPhfbCloseButtonText", locales);
        LocalizeElement("WindowPhfbOpenInfoButtonText", locales);        

        document.getElementById("WindowPhfbExpandButtonText").innerText = locales["WindowPhfbExpandButtonTextBefore"];

        SetClickHandler("phfbReportButton", SendReport);
        SetClickHandler("phfbExpandButton", ExpandArea);
        SetClickHandler("phfbCloseButton", Close);
        SetClickHandler("WindowPhfbOpenInfoButtonText", OpenInfo);

        SetSettings();

        let redirectedListTextElement = document.getElementById("WindowPhfbRedirectedSitesUrlText");
        redirectedListTextElement.innerText = CreateRedirectedSitesText();
        if (redirectedListTextElement.innerText == "")
            document.getElementById("WindowPhfbSectionRedirected").style.display = "none";

        let websiteUrlTextElement = document.getElementById("WindowPhfbWebsiteUrlText");
        websiteUrlTextElement.innerText = report.url;

        if (websiteUrlTextElement.offsetHeight <= document.getElementById("WindowPhfbWebsiteSectionSite").offsetHeight &&
            redirectedListTextElement.offsetHeight <= document.getElementById("WindowPhfbSectionRedirected").offsetHeight)
            document.getElementById("areaPhfbExpandButton").remove();
        report.type = "ufb.phishing";
    }

    Init();
};

let BrokenWebpageUserFeedbackWindow = function BrokenWebpageUserFeedbackWindow(settings, locales, report)
{
    let m_webPageLimitInCharactersSize = 0;
    let m_isAreaExpanded = false;

    function SetSettings()
    {
        m_webPageLimitInCharactersSize = settings.webPageLimitInKbSize * 1024 / 2;
        document.getElementById("bwfbTextArea").setAttribute("maxlength", settings.userTextLimitInSymbolsSize);
    }

    function ExpandArea()
    {
        if (m_isAreaExpanded === false)
        {
            ChangeClassAttribute("area-web-page-url-not-expanded", "area-web-page-url-expanded");
            ChangeClassAttribute("expand-button-ufb-image-not-expanded", "expand-button-ufb-image-expanded");
            document.getElementById("WindowBwfbExpandButtonText").innerText = locales["WindowBwfbExpandButtonTextAfter"];
            m_isAreaExpanded = true;
        }
        else
        {
            ChangeClassAttribute("area-web-page-url-expanded", "area-web-page-url-not-expanded");
            ChangeClassAttribute("expand-button-ufb-image-expanded", "expand-button-ufb-image-not-expanded");
            document.getElementById("WindowBwfbExpandButtonText").innerText = locales["WindowBwfbExpandButtonTextBefore"];
            m_isAreaExpanded = false;
        }
    }

    function SendReport()
    {
        SetDialogView();

        report.userText = document.getElementById("bwfbTextArea").value;
        let isLimitExceeded = report.webpage.length > m_webPageLimitInCharactersSize;
        if (isLimitExceeded)
            report.webpage = report.webpage.substr(0, m_webPageLimitInCharactersSize);

        browsersApi.runtime.sendMessage({ command: "ufb.sendReport", report: report }, () =>
            {
                if (browsersApi.runtime.lastError)
                    console.log(`ufb.sendReport failed with error ${browsersApi.runtime.lastError.message}`); 
            });
    }

    function InitImpl()
    {
        window.document.title = locales["PopupWindowBwfbTitle"];
        LocalizeElement("WindowBwfbTitleText", locales);
        LocalizeElement("WindowBwfbInfoText", locales);
        LocalizeElement("WindowBwfbWebsiteTitleText", locales);
        LocalizeElement("WindowBwfbAgreementText", locales);
        LocalizeElement("WindowBwfbReportButtonText", locales);
        LocalizeElement("WindowBwfbThanksText", locales);
        LocalizeElement("WindowBwfbAnalysisText", locales);
        LocalizeElement("WindowBwfbCloseButtonText", locales);
        document.getElementById("WindowBwfbExpandButtonText").innerText = locales["WindowBwfbExpandButtonTextBefore"];
        LocalizeAttribute(document.getElementById("bwfbTextArea"), "placeholder", locales["WindowBwfbTextAreaPlaceHolder"]);

        SetClickHandler("bwfbReportButton", SendReport);
        SetClickHandler("bwfbExpandButton", ExpandArea);
        SetClickHandler("bwfbCloseButton", Close);

        SetSettings();

        let websiteUrlTextElement = document.getElementById("WindowBwfbWebsiteUrlText");
        websiteUrlTextElement.innerText = report.url;

        if (websiteUrlTextElement.offsetHeight <= document.getElementById("WindowBwfbWebsiteSection").offsetHeight)
            document.getElementById("areaBwfbExpandButton").remove();
        report.type = "ufb.broken_webpage";
    }

    function Init()
    {
        if (document.readyState === "loading")
        {
            let initialized = false;
            const delayFunc = function DelayFunc()
                {
                    if (!initialized)
                    {
                        initialized = true;
                        setTimeout(InitImpl, 0);
                    }
                };

            document.addEventListener("DOMContentLoaded", delayFunc);
            window.addEventListener("load", delayFunc);
        }
        else
        {
            InitImpl();
        }
    };

    Init();
};

let m_window = null;

function OnMessage(message)
{
    if (message.receiver === document.location.href)
    {
        if (message.command === "init")
            OnInit(message.initData);
    }
}

function OnInit(data)
{
    if (data.cssData)
        InsertCssInline(data.cssData);

    let w = document.body.clientWidth;
    let h = document.body.clientHeight;
    let l = Math.round(screen.width/2 - w/2);
    let t = Math.round(screen.height/2 - h/2);
    browsersApi.windows.getCurrent(UpdateWindow(w, h, l, t));

    if (data.pluginName === "bwfb")
        m_window = new BrokenWebpageUserFeedbackWindow(data.settings, data.locales, data.report);
    else if (data.pluginName === "phfb")
        m_window = new PhishingUserFeedbackWindow(data.settings, data.locales, data.report);
}

function UpdateWindow(w, h, l, t)
{
    return window => 
    {
        browsersApi.windows.update(window.id, { height: h, width: w, left: l, top: t });
    }
}

function SetDialogView() 
{
    document.getElementById("BeforeReportContent").style.display = "none";
    document.getElementById("AfterReportContent").style.display = "block";
}

function Close()
{
    window.close();
}

function Init()
{
    browsersApi.runtime.onMessage.addListener(OnMessage);
    browsersApi.runtime.sendMessage({sender: document.location.href, command: "init"}, () =>
            {
                if (browsersApi.runtime.lastError)
                    console.log(`init user feeback window failed with error ${browsersApi.runtime.lastError.message}`); 
            });
}

Init();
