(function DomParserMain(ns)
{

function DomParser(session)
{
    var m_callFunction = ns.EmptyFunc;
    var m_logins = [];
    var m_passwords = [];
    var m_newPasswords = [];
    var m_address = [];
    var m_card = [];
    var m_cachedFlag = false;
    var m_pathName = document.location.pathname;

    var m_selectorsRequested = false;
    var m_callbacksQueue = [];
    var m_idCounter = 0;

    function OnGetFieldsCallback(result, selectors)
    {
        if (result === 0 && selectors)
        {
            if (selectors.loginSelectors)
                Array.prototype.push.apply(m_logins, selectors.loginSelectors);
            if (selectors.passwordSelectors)
                Array.prototype.push.apply(m_passwords, selectors.passwordSelectors);
            if (selectors.newPasswordSelectors)
                Array.prototype.push.apply(m_newPasswords, selectors.newPasswordSelectors);
            if (selectors.addressSelectors)
                Array.prototype.push.apply(m_address, selectors.addressSelectors);
            if (selectors.cardSelectors)
                Array.prototype.push.apply(m_card, selectors.cardSelectors);
            m_cachedFlag = true;
        }
        m_selectorsRequested = false;

        for (var i = 0; i < m_callbacksQueue.length; ++i)
            m_callbacksQueue[i](result);
    }
    function CleanupElements()
    {
        if (!document.querySelectorAll)
            return;
        var elements = document.querySelectorAll("[wfd-value],[wfd-invisible]");
        for (var i = 0; i < elements.length; ++i)
        {
            var element = elements[i];
            if (element.hasAttribute("wfd-value"))
                element.removeAttribute("wfd-value");

            if (element.hasAttribute("wfd-invisible"))
                element.removeAttribute("wfd-invisible");
        }
    }

    function CallService(argObject)
    {
        m_callFunction("dp.onGetFields", argObject, OnGetFieldsCallback);
        CleanupElements();
    }

    function IsVisible(element)
    {
        var style = window.getComputedStyle ? window.getComputedStyle(element) : element.currentStyle;
        return style.display !== "none";
    }

    function ProcessChilds(childNodes)
    {
        for (var i = 0; i < childNodes.length; ++i)
        {
            var element = childNodes[i];
            if (element.nodeType !== Node.ELEMENT_NODE)
                continue;

            if (!IsVisible(element))
            {
                element.setAttribute("wfd-invisible", true);
            }
            else
            {
                element.setAttribute("wfd-id", "id" + m_idCounter);
                ++m_idCounter;
                ProcessChilds(element.childNodes);
            }
        }
    }

    function ProcessNextGroupElement(tree, finishCallback)
    {
        var counter = 0;
        while (tree.nextNode())
        {
            ++counter;
            tree.currentNode.setAttribute("wfd-invisible", true);
            if (counter === 100)
            {
                ns.SetTimeout(function TimerCallback() { ProcessNextGroupElement(tree, finishCallback); }, 0);
                return;
            }
        }
        finishCallback();
    }

    function GetSelectorsWithTreeWalker()
    {
        if (!document.body)
        {
            ns.AddEventListener(window, "load", GetSelectorsWithTreeWalker);
            return;
        }
        var filter = {
            acceptNode: function acceptNode(node)
            {
                if (!node)
                    return NodeFilter.FILTER_SKIP;
                if (node.tagName === "INPUT")
                {
                    node.setAttribute("wfd-id", "id" + m_idCounter);
                    ++m_idCounter;
                }
                if (node.parentNode && node.parentNode.getAttribute("wfd-invisible") === true)
                    return NodeFilter.FILTER_REJECT;
                if (!IsVisible(node))
                    return NodeFilter.FILTER_ACCEPT;
                return NodeFilter.FILTER_SKIP;
            }
        };
        var tree = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT, filter.acceptNode, false);
        function finishCallback()
        {
            CallService({ dom: "<body>" + document.body.innerHTML + "</body>" });
        }
        ProcessNextGroupElement(tree, finishCallback);
    }

    function GetSelectorsFromService()
    {
        try
        {
            ProcessChilds(document.body.childNodes);
        }
        catch (e)
        {
            ns.SessionLog(e);
        }
        CallService({ dom: document.documentElement.innerHTML });
    }

    function GetSelectorsInternal(callback, selectors)
    {
        if (m_cachedFlag)
        {
            if (selectors.length > 0)
                callback(0, selectors);
            return;
        }

        function clientCallback(result) { callback(result, selectors); }
        m_callbacksQueue.push(clientCallback);
        if (!m_selectorsRequested)
        {
            m_selectorsRequested = true;
            if (document.createTreeWalker)
                GetSelectorsWithTreeWalker();
            else
                GetSelectorsFromService();
        }
    }

    function AddWfdAttribute(input, settings)
    {
        try
        {
            if (!input || !input.value)
                return;
            if (settings && settings.avoidTypes && input.type && settings.avoidTypes.includes(input.type))
                return;
            if (input.type === "password")
                return;

            input.setAttribute("wfd-value", ns.ToBase64(input.value));
        }
        catch (e)
        {
            ns.SessionLog(e);
        }
    }

    this.GetLoginSelectors = function GetLoginSelectors(clientCallback)
    {
        GetSelectorsInternal(clientCallback, m_logins);
    };

    this.GetPasswordSelectors = function GetPasswordSelectors(clientCallback)
    {
        GetSelectorsInternal(clientCallback, m_passwords);
    };

    this.GetNewPasswordSelectors = function GetNewPasswordSelectors(clientCallback)
    {
        GetSelectorsInternal(clientCallback, m_newPasswords);
    };

    this.GetAddressSelectors = function GetAddressSelectors(clientCallback)
    {
        GetSelectorsInternal(clientCallback, m_address);
    };

    this.GetCardSelectors = function GetCardSelectors(clientCallback)
    {
        GetSelectorsInternal(clientCallback, m_card);
    };

    this.GetHtmlWithWfd = function GetHtmlWithWfd(settings)
    {
        var inputs = document.getElementsByTagName("input");
        if (inputs)
        {
            for (var i = 0; i < inputs.length; i++)
                AddWfdAttribute(inputs[i], settings);
        }

        if (settings && settings.wfdIdSelector)
        {
            var elements = document.querySelectorAll(settings.wfdIdSelector);
            if (elements)
            {
                var count = 1;
                for (var j = 0; j < elements.length; j++)
                {
                    elements[j].setAttribute("wfd-id", count);
                    count++;
                }
            }
        }

        return document.documentElement.innerHTML;
    };

    function OnPing()
    {
        return ns.MaxRequestDelay;
    }

    function OnInitializeCallback(activatePlugin, registerMethod, callFunction)
    {
        m_callFunction = callFunction;
        activatePlugin("dp", OnPing);
    }

    function ResetCacheFlag()
    {
        m_cachedFlag = false;
    }

    function UpdateLocationPathName()
    {
        if (m_pathName !== document.location.pathname) 
        {
            m_pathName = document.location.pathname;
            ResetCacheFlag();
        }
    }

    function OnMessage(request)
    {
        try
        {
            if (request.command && request.command === "HistoryStateUpdate")
                ResetCacheFlag();
        }
        catch (e)
        {
            ns.SessionError(e, "dp");
        }
    }

    function InitializePlugin()
    {
        session.InitializePlugin(OnInitializeCallback);
        ns.AddEventListener(window, "popstate", ResetCacheFlag);
        ns.AddEventListener(document, "load", UpdateLocationPathName);
        browsersApi.runtime.onMessage.addListener(OnMessage);
    }
    InitializePlugin();
}

var gDomParser = null;

ns.GetDomParser = function GetDomParser(session)
{
    if (!gDomParser)
        gDomParser = new DomParser(session);

    return gDomParser;
};

return ns;

})(KasperskyLab);
