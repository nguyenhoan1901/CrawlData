var PostponeCheckAtributeName = "kl_" + KasperskyLab.GetCurrentTime();
var IconName = "kl_" + KasperskyLab.GetCurrentTime();

KasperskyLab.AddRunner("ua", function AddRunnerUa(ns, session, settings, locales)
{

var UrlAdvisor = function UrlAdvisor()
{
    var m_urlAdvisorBalloon = new ns.UrlAdvisorBalloon(session, locales);
    var m_enabled = settings.enable;
    var m_checkOnlySearchResults = settings.mode;
    var m_linkSelector = settings.linkSelector;
    var m_elementAfterSelector = settings.elementAfterSelector;
    var m_emptySearchResultSent = false;
    var m_isVerdictSuitableForContinueFunc = function AlwaysSuitable() { return true; };

    var m_postponeCategorizeStarted = false;
    var m_urlCategorizeRequestTime = 0;
    var m_observer = null;

    var m_callFunction = ns.EmptyFunc;
    var m_categorizingObjects = {};
    var m_clearCategorizingObjectsTimerId = null;

    function AddToCategorizeList(url, linkElement)
    {
        if (url in m_categorizingObjects)
            m_categorizingObjects[url].push(linkElement);
        else
            m_categorizingObjects[url] = [linkElement];
    }

    function OnPing(currentTime)
    {
        var timeFormRequest = (currentTime >= m_urlCategorizeRequestTime) ? currentTime - m_urlCategorizeRequestTime : 0;

        return timeFormRequest <= 10000 ? 500 : ns.MaxRequestDelay;
    }

    function GetHref(link)
    {
        try { return link.href; } 
        catch (e) {}
        try { return link.getAttribute("href"); } 
        catch (e) {}
        return "";
    }

    function CreateIcon()
    {
        var icon = document.createElement("img");
        icon.name = IconName;
        icon.width = 16;
        icon.height = 16;
        icon.style.cssText = "width: 16px!important; height: 16px!important;display: inline !important;";
        icon.onclick = function onclick(evt) { ns.StopProcessingEvent(evt); };
        return icon;
    }

    function GetLinkIcon(linkElement)
    {
        var nextElement = linkElement.nextSibling;
        if (m_elementAfterSelector)
        {
            nextElement = linkElement.querySelector(m_elementAfterSelector);
            if (nextElement)
                nextElement = nextElement.nextSibling;
            else
                nextElement = linkElement.nextSibling;
        }
        return (nextElement !== null && nextElement.name === IconName) ? nextElement : null;
    }

    function GetOrCreateLinkIcon(linkElement)
    {
        var icon = GetLinkIcon(linkElement);
        if (icon)
            return icon;

        var nextElement = linkElement;
        if (m_elementAfterSelector)
        {
            nextElement = linkElement.querySelector(m_elementAfterSelector);
            if (!nextElement)
                nextElement = linkElement;
        }

        nextElement.style.display = "inline-block";
        if (nextElement.parentNode)
        {
            nextElement.parentNode.insertBefore(CreateIcon(), nextElement.nextSibling);
        }
        else
        {
            ns.SessionLog("Can not find parent node for: " + nextElement.nodeType);
            return null;
        }

        return nextElement.nextSibling;
    }

    function GetLinkElementByIcon(icon)
    {
        if (!m_elementAfterSelector)
            return icon.previousSibling;
        var searchLinks = [];
        if (KasperskyLab.GetSearchLinks)
            searchLinks = KasperskyLab.GetSearchLinks();
        else
            searchLinks = document.querySelectorAll(m_linkSelector);

        for (var i = 0; i < searchLinks.length; i++)
        {
            var link = searchLinks[i].element || searchLinks[i];
            var elem = link.querySelector(m_elementAfterSelector);
            if (link.nextSibling === icon || (elem && elem.nextSibling === icon))
                return link;
        }
        return icon.previousSibling;
    }

    function UpdateIconImage(icon, verdict)
    {
        if (verdict.rating === 1)
        {
            icon.src = locales["UrlAdvisorGoodImage.png"];
            icon["kis_status"] = 16;
        }
        else if (verdict.rating === 2)
        {
            icon.src = locales["UrlAdvisorSuspiciousImage.png"];
            icon["kis_status"] = 8;
        } 
        else if (verdict.rating === 3)
        {
            icon.src = locales["UrlAdvisorDangerImage.png"];
            icon["kis_status"] = 4;
        }
        else if (verdict.rating === 4)
        {
            icon.src = locales["UrlAdvisorwmufImage.png"];
        }
        else if (verdict.rating === 5)
        {
            icon.src = locales["UrlAdvisorCompromisedImage.png"];
        }
    }
    function SubscribeIconOnMouseEvents(icon, verdict)
    {
        var balloonTimerId = 0;
        ns.AddEventListener(icon, "mouseout", function OnMouseout()
            {
                if (balloonTimerId)
                {
                    clearTimeout(balloonTimerId);
                    balloonTimerId = 0;
                }
            });

        ns.AddEventListener(icon, "mouseover", function OnMouseover(args)
            {
                if (!balloonTimerId)
                {
                    var clientX = args.clientX;
                    var clientY = args.clientY;
                    balloonTimerId = ns.SetTimeout(function TimerCallback()
                        {
                            m_urlAdvisorBalloon.ShowBalloon(clientX, clientY, verdict);
                            balloonTimerId = 0;
                        }, 300);
                }
            });
    }
    function IsElementEmpty(linkElement)
    {
        return !linkElement.offsetHeight && !linkElement.offsetWidth
            && !linkElement.outerText && !linkElement.text;
    }

    function SetVerdictForUrl(verdict)
    {
        try
        {
            if (!(verdict.url in m_categorizingObjects))
                return;

            var linkElements = m_categorizingObjects[verdict.url];
            for (var linkIndex = 0; linkIndex < linkElements.length; ++linkIndex)
            {
                if (IsElementEmpty(linkElements[linkIndex]))
                    continue;
                linkElements[linkIndex][PostponeCheckAtributeName] = false;
                if (!m_isVerdictSuitableForContinueFunc(verdict))
                    continue;
                var icon = GetOrCreateLinkIcon(linkElements[linkIndex]);
                if (!icon)
                    continue;

                UpdateIconImage(icon, verdict);
                SubscribeIconOnMouseEvents(icon, verdict);
            }
        }
        catch (e)
        {
            ns.SessionError(e, "ua");
        }
        delete m_categorizingObjects[verdict.url];
    }

    function SetVerdict(argument)
    {
        for (var currentVerdict = 0; currentVerdict < argument.verdicts.length; currentVerdict++)
            SetVerdictForUrl(argument.verdicts[currentVerdict]);
    }

    function SetVerdictDelayed(argument)
    {
        ns.SetTimeout(function TimerCallback() { SetVerdict(argument); }, 1000);
    }

    function SetSettingsImpl(argument)
    {
        m_enabled = argument.enable;
        if (!m_enabled)
            return;

        m_checkOnlySearchResults = argument.mode;
    }

    function ClearImages()
    {
        var images = document.getElementsByName(IconName);
        while (images.length > 0)
            images[0].parentNode.removeChild(images[0]);
    }
    function ClearAttributes()
    {
        for (var i = 0; i < document.links.length; ++i)
        {
            if (document.links[i][PostponeCheckAtributeName])
                document.links[i][PostponeCheckAtributeName] = false;
        }
    }

    function IsNeedCategorizeLink(linkElement)
    {
        try
        {
            return !linkElement.isContentEditable && Boolean(linkElement.parentNode)
                && !GetLinkIcon(linkElement) && !linkElement[PostponeCheckAtributeName]
                && !IsElementEmpty(linkElement);
        }
        catch (e)
        {
            ns.SessionLog("check link exception: " + (e.message || e));
            return false;
        }
    }


    function CategorizeUrl()
    {
        try
        {
            if (!m_enabled)
            {
                ns.SessionLog("skip categorize links because UA disabled");
                return;
            }

            ns.SessionLog("UA: collect links for categorize");
            m_postponeCategorizeStarted = false;
            var linksForCategorize = [];

            var linksForCheck = [];
            if (!m_checkOnlySearchResults)
                linksForCheck = document.links;
            else if (KasperskyLab.GetSearchLinks)
                linksForCheck = KasperskyLab.GetSearchLinks();
            else if (m_linkSelector && m_checkOnlySearchResults)
                linksForCheck = document.querySelectorAll(m_linkSelector);

            ns.SessionLog("UA: links for categorize size: " + linksForCheck.length);

            for (var i = 0; i < linksForCheck.length; i++)
            {
                var link = linksForCheck[i].element || linksForCheck[i];
                if (IsNeedCategorizeLink(link))
                {
                    link[PostponeCheckAtributeName] = true; 
                    var href = linksForCheck[i].href || GetHref(link);
                    var linkToCategorize = href;
                    if (href)
                    {
                        linksForCategorize.push(linkToCategorize);
                        AddToCategorizeList(href, link);
                    } 
                    else 
                    {
                        ns.Log("access to href blocked by browser"); 
                    }
                }
            }

            var isEmptySearchResult = m_linkSelector && m_checkOnlySearchResults && linksForCheck.length === 0;
            if (isEmptySearchResult || linksForCategorize.length)
            {
                if (isEmptySearchResult)
                {
                    if (m_emptySearchResultSent)
                        return;
                    m_emptySearchResultSent = true;
                }
                ns.SessionLog("UA send links for categorization");

                var args = { links: linksForCategorize };
                m_callFunction("ua.categorize", args);
                m_urlCategorizeRequestTime = ns.GetCurrentTime();


                clearTimeout(m_clearCategorizingObjectsTimerId);
                m_clearCategorizingObjectsTimerId = ns.SetTimeout(function TimerCallback()
                {
                    m_categorizingObjects = {};
                }, 1000 * 60 * 5);
            }
            else
            {
                ns.SessionLog("UA not found links for categorization");
            }
        }
        catch (e)
        {
            ns.SessionError(e, "ua");
        }
    }

    function ProcessDomChange()
    {
        try
        {
            ns.SessionLog("UA: Process dom change");
            if (!m_postponeCategorizeStarted)
            {
                ns.SetTimeout(CategorizeUrl, 500);
                m_postponeCategorizeStarted = true;
            }
            var images = document.getElementsByName(IconName);
            for (var i = 0; i < images.length; ++i)
            {
                var linkNode = GetLinkElementByIcon(images[i]);
                if (!linkNode || !linkNode.nodeName || linkNode.nodeName.toLowerCase() !== "a")
                {
                    var imageNode = images[i];
                    imageNode.parentNode.removeChild(imageNode);
                }
            }
        }
        catch (e)
        {
            ns.SessionError(e, "ua");
        }
    }

    function SetSettings(argument)
    {
        ClearImages();
        ClearAttributes();
        SetSettingsImpl(argument);
        CategorizeUrl();
    }

    function Run()
    {
        CategorizeUrl();

        m_observer = ns.GetDomChangeObserver("a");
        m_observer.Start(ProcessDomChange);
        ns.AddEventListener(window, "load", CategorizeUrl);
    }

    session.InitializePlugin(function InitializePluginUa(activatePlugin, registerMethod, callFunction) 
        {
            m_callFunction = callFunction;

            if (settings.needCheckVerdicts)
            {
                m_isVerdictSuitableForContinueFunc = function CheckVerdict(verdict) 
                    {
                        return verdict.rating === 3 || verdict.rating === 4 || verdict.rating === 5;
                    };
            }
            activatePlugin("ua", OnPing);
            registerMethod("ua.verdict", SetVerdictDelayed);
            registerMethod("ua.settings", SetSettings);
        });

    Run();
};

var instance = null;
ns.RunModule(function RunModuleUrlAdvisor()
{
    if (!instance)
        instance = new UrlAdvisor();
}, 2500);

});
