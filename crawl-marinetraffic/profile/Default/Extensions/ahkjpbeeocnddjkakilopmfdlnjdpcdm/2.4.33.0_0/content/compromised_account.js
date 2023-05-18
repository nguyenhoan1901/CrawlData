var compromisedAccountHandler = KasperskyLab.EmptyFunc;
var eventHandler = function eventHandler(arg) { compromisedAccountHandler(arg); };
KasperskyLab.AddEventListener(document, "click", eventHandler);
KasperskyLab.AddEventListener(document, "keydown", eventHandler);
KasperskyLab.AddEventListener(document, "submit", eventHandler);
KasperskyLab.AddRunner("ca", function AddRunnerCA(ns, session, settings)
{
    var m_callFunction = ns.EmptyFunc;
    var m_onUnloadCallFunction = ns.EmptyFunc;
    var m_bodySended = false;
    var m_lastSendedTime = 0;
    var m_domParser = ns.GetDomParser(session);
    var m_inputs = [];
    var m_forms = [];
    var m_buttons = [];
    var m_settings = settings;
    var m_submitCall = false;

    function CallService(commandName, argObject)
    {
        m_callFunction("ca." + commandName, argObject, null, null);
    }

    function TryOnUnloadCallService(commandName, argObject, resultCallback)
    {
        return m_onUnloadCallFunction("ca." + commandName, argObject, resultCallback);
    }

    function OnSubmitWithAutofill(arg)
    {
        ns.SessionLog("=> OnSubmit with autofill eventType: " + arg.type);

        if (m_submitCall)
            return;

        m_submitCall = true;

        ns.AddEventListener(window, "beforeunload", function OnUnload()
        {
            if (!m_submitCall)
                return;

            var domWithWfd = m_domParser.GetHtmlWithWfd(m_settings);
            if (!TryOnUnloadCallService("onHtml", { dom: domWithWfd }))
                CallService("onHtml", { dom: domWithWfd });
        });
    }

    function IsInList(element, elementList)
    {
        for (var i = 0; i < elementList.length; ++i)
        {
            if (element === elementList[i])
                return true;
        }
        return false;
    }

    function AddButtonsToList(submitButtons)
    {
        for (var i = 0; i < submitButtons.length; ++i)
        {
            var button = submitButtons[i];
            if (!IsInList(button, m_buttons))
                m_buttons.push(button);
        }
    }

    function GetElements(root, tag, type)
    {
        if (root.querySelectorAll)
            return root.querySelectorAll(tag + "[type='" + type + "']");

        var result = [];
        var childrens = root.getElementsByTagName(tag);
        for (var i = 0; i < childrens.length; i++) 
        {
            if (childrens[i].type.toLowerCase() === type) 
                result.push(childrens[i]);
        }
        return result;
    }

    function IsVisible(element)
    {
        var style = window.getComputedStyle ? window.getComputedStyle(element) : element.currentStyle;
        return style.display !== "none";
    }

    function GetSingleButton()
    {
        var buttons = GetElements(document, "button", "submit"); 
        if (buttons && buttons.length > 0) 
            return buttons;
        buttons = document.getElementsByTagName("button");
        if (buttons && buttons.length === 1) 
            return buttons[0];
        var result = [];
        for (var i = 0; i < buttons.length; i++) 
        {
            if (IsVisible(buttons[i])) 
                result.push(buttons[i]);
        }
        return result.length === 1 ? result[0] : [];
    }

    function AddInputToList(accountElement)
    {
        if (IsInList(accountElement, m_inputs))
            return;

        ns.SessionLog("setting Enter Key event handlers for " + accountElement.id);

        m_inputs.push(accountElement);
        if (accountElement.form)
        {
            var parentForm = accountElement.form;
            if (!IsInList(parentForm, m_forms))
            {
                ns.SessionLog("setting form submit event handlers for " + accountElement.id);
                m_forms.push(parentForm);
            }

            ns.SessionLog("setting button click event handlers for " + accountElement.id);
            AddButtonsToList(GetElements(parentForm, "input", "submit"));
            AddButtonsToList(GetElements(parentForm, "button", "button"));
        }
        else
        {
            ns.SessionLog("setting button click event handlers for " + accountElement.id);
            AddButtonsToList(GetSingleButton());
        }
    }

    function OnSubmit(arg)
    {
        ns.SessionLog("=> OnSubmit eventType: " + arg.type);
        var target = arg.target || arg.srcElement;
        if (arg.type === "keydown")
        {
            if (arg.keyCode !== 13)
                return;

            if (!IsInList(target, m_buttons) && !IsInList(target, m_inputs) && !IsInList(target, m_forms))
                return;
        }
        else if (arg.type === "click")
        {
            if (!IsInList(target, m_buttons))
                return;
        }
        else if (arg.type === "submit")
        {
            if (!IsInList(target, m_forms))
                return;
        }

        var currentTime = ns.GetCurrentTime();
        if (currentTime - 500 < m_lastSendedTime)
        {
            ns.SessionLog("skipping OnSubmit due to timing");
            return; 
        }

        var accounts = [];
        for (var i = 0; i < m_inputs.length; ++i)
        {
            var accountElement = m_inputs[i];
            if (accountElement.value)
                accounts.push(ns.ToBase64(accountElement.value));
        }

        if (accounts.length > 0)
        {
            if (!TryOnUnloadCallService("onAccount", { accounts: accounts }))
                CallService("onAccount", { accounts: accounts });

            m_lastSendedTime = currentTime;
        }
        else
        {
            ns.SessionLog("CA: OnSubmit with no data occure");
        }

        ns.SessionLog("<= OnSubmit");
    }

    function OnInputCallback(result, onInputData)
    {
        m_submitCall = false;

        if (result !== 0 || onInputData.length === 0)
        {
            ns.SessionLog("Couldn't get login selectors. Result: " + result + " selectors size: " + onInputData.length);
            m_bodySended = false;
            return;
        }

        compromisedAccountHandler = OnSubmit;
        for (var i = 0; i < onInputData.length; ++i)
        {
            var accountElement = document.querySelector(onInputData[i]);
            if (!accountElement)
            {
                ns.SessionLog("Couldn't find element for selector " + onInputData[i]);
                continue;
            }

            AddInputToList(accountElement);
        }
    }

    function OnKeyDown()
    {
        if (m_bodySended)
            return;

        ns.SessionLog("Find login selectors.");
        m_bodySended = true;

        if (m_settings.submitHandlerEnabled)
            compromisedAccountHandler = OnSubmitWithAutofill;

        m_domParser.GetLoginSelectors(OnInputCallback);
    }

    function OnPing()
    {
        return ns.MaxRequestDelay;
    }

    function OnInitializeCallback(activatePlugin, registerMethod, callFunction, deactivate, onUnloadCall)
    {
        m_callFunction = callFunction;
        m_onUnloadCallFunction = onUnloadCall;
        activatePlugin("ca", OnPing);
        ns.AddEventListener(document, "keydown", OnKeyDown);
    }

    function InitializePlugin()
    {
        session.InitializePlugin(OnInitializeCallback);
    }

    InitializePlugin();
});
