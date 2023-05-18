var LastSearchRequest = {};

KasperskyLab.AddRunner("sam", function AddRunnerSam(ns, session, settings)
{
var SearchMonitor = function SearchMonitor()
{
    var m_callFunction = ns.EmptyFunc;
    var m_postponeSendStarted = false;
    var m_pingTimeout = ns.MaxRequestDelay;
    var m_getSearchSiteRequest = ns.EmptyFunc;
    var m_getTypedSearchRequest = ns.EmptyFunc;
    var m_getRealSearchRequest = ns.EmptyFunc;

    if (ns.IsDefined(settings.realSearchResultSelector) && settings.realSearchResultSelector.length > 0)
        settings.realSearchResultSelectorList = [settings.realSearchResultSelector];

    function DecodeURI(query)
    {
        return decodeURIComponent(query.replace(/\+/g, " "));
    }

    function GetSearchRequest(parameterName)
    {
        var parameters = document.location.href.split(/[?#&]/);
        var result = "";
        for (var i = 0; i < parameters.length; ++i)
        {
            var parameter = parameters[i];
            var parameterSeparatorPos = parameter.indexOf("=");
            if (parameterSeparatorPos === -1)
                continue;
            if (parameter.substr(0, parameterSeparatorPos) !== parameterName)
                continue;

            result = DecodeURI(parameter.substr(parameterSeparatorPos + 1));
        }
        return result;
    }

    function NotSearchSiteRequest()
    {
        return "";
    }

    function GetSearchParamsFromSettings(settingsRule)
    {
        try
        {
            m_getSearchSiteRequest = function getSearchSiteRequestImpl() 
            {
                var result = "";
                for (var i = 0; i < settingsRule.searchResultSelector.length; ++i)
                    result = result || GetSearchRequest(settingsRule.searchResultSelector[i]);

                return result;
            };

            if (settingsRule.typedSearchRequest)
            {
                m_getTypedSearchRequest = function getTypedSearchRequestImpl() 
                {
                    var t = document.querySelector(settingsRule.typedSearchRequest);
                    return (t && t.tagName.toLowerCase() === "input") ? t.value : m_getSearchSiteRequest();
                };
            }
            else
            {
                m_getTypedSearchRequest = m_getSearchSiteRequest;
            }

            if (settingsRule.realSearchResultSelectorList)
            {
                m_getRealSearchRequest = function getRealSearchRequestImpl(request) 
                {
                    for (var i = 0; i < settingsRule.realSearchResultSelectorList.length; i++)
                    {
                        var elements = document.querySelectorAll(settingsRule.realSearchResultSelectorList[i]);
                        if (elements && elements.length > 0)
                        {
                            var res = elements[0].innerText || elements[0].value || elements[0].text || "";
                            if (res !== request)
                                return res;
                            ns.SessionLog("Real and type search request are equal");
                        }
                        else
                        {
                            ns.SessionLog("No elements found for real search request");
                        }
                    }
                    return "";
                };
            }
            else
            {
                m_getRealSearchRequest = NotSearchSiteRequest;
                ns.SessionLog("No selectors found for real search request");
            }
        }
        catch (e)
        {
            m_getSearchSiteRequest = NotSearchSiteRequest;
            m_getTypedSearchRequest = NotSearchSiteRequest;
            m_getRealSearchRequest = NotSearchSiteRequest;
        }
    }

    function IsSameRequest(left, right)
    {
        if (!left || !right)
            return false;
        return left.queryText === right.queryText;
    }

    function CollectAndSendSearchResults()
    {
        m_postponeSendStarted = false;
        var queryText = m_getSearchSiteRequest();
        var typedText = m_getTypedSearchRequest();
        var request = queryText || typedText;
        ns.SessionLog("SAM: Collect and send search results for request \"" + request + "\"");
        var queryTextForSearchResults = m_getRealSearchRequest(request);
        var searchResult =
        {
                url: document.location.href,
                queryText: request,
                typedText: typedText,
                queryTextForSearchResults_initialized: Boolean(queryTextForSearchResults.length),  
                queryTextForSearchResults: queryTextForSearchResults
            };

        if (IsSameRequest(searchResult, LastSearchRequest) || !request)
            return;

        ns.SetTimeout(CollectAndSendSearchResults, 5000);
        var onSuccess = function onSuccess() { LastSearchRequest = searchResult; };
        m_callFunction("sam.SearchResult2", searchResult, onSuccess);
    }

    function PostponeCollectAndSendSearchResult()
    {
        ns.SessionLog("SAM: Postpone collect and send search result: " + !m_postponeSendStarted);
        if (!m_postponeSendStarted)
        {
            ns.SetTimeout(CollectAndSendSearchResults, 500);
            m_postponeSendStarted = true;
        }
    }

    function OnPing()
    {
        return m_pingTimeout;
    }

    function ReloadPage(argument)
    {
        if (argument && argument.url !== document.location.href)
            window.history.pushState(0, document.title, ns.StartLocationHref);

        m_callFunction("sam.onReload");
        session.Reload();
    }


    ns.SessionLog("SAM: Start");
    GetSearchParamsFromSettings(settings);

    session.InitializePlugin(function InitializePluginSam(activatePlugin, registerMethod, callFunction)
    {
        m_callFunction = callFunction;
        activatePlugin("sam", OnPing);
        registerMethod("sam.reloadStart", function SamReloadStart() { m_pingTimeout = 500; });
        registerMethod("sam.reloadEnd", function SamReloadEnd() { m_pingTimeout = ns.MaxRequestDelay; });
        registerMethod("sam.reload", ReloadPage);
    });

    CollectAndSendSearchResults();

    var m_observer = ns.GetDomChangeObserver("a");
    m_observer.Start(PostponeCollectAndSendSearchResult);
    ns.AddEventListener(window, "unload", function OnUnload()
        {
            ns.SessionLog("SAM: Stop observer");
            if (m_observer)
                m_observer.Stop();
        });
    ns.SessionLog("SAM: Started");
};

var instance = null;

function RunSearchMonitor() 
{
    if (!instance)
        instance = new SearchMonitor();
}

ns.RunModule(RunSearchMonitor, 10000);

});
