KasperskyLab.AddRunner("wsc", function AddRunnerWsc(ns, session)
{
    var WebsiteCredentials = function WebsiteCredentials()
    {
        var m_callFunction = ns.EmptyFunc;
        var m_syncCallFunction = ns.EmptyFunc;
        var m_lastPasswordSended = null;
        var m_subscribedAttributeName = "kl_wsc_" + ns.GetCurrentTime();
        var m_passwordInputObserver = ns.GetDomChangeObserver("input");

        function OnPing()
        {
            return ns.MaxRequestDelay;
        }

        function IsVisible(element)
        {
            var style = window.getComputedStyle ? window.getComputedStyle(element) : element.currentStyle;
            return style.display !== "none";
        }
        function IsSubscribedElement(element)
        {
            return element[m_subscribedAttributeName];
        }
        function MarkSubscribedElement(element)
        {
            element[m_subscribedAttributeName] = true;
        }
        function GetElements(element, tag, type)
        {
            if (element.querySelectorAll)
                return element.querySelectorAll(tag + "[type='" + type + "']");

            var result = [];
            var childrens = element.getElementsByTagName(tag);
            for (var i = 0; i < childrens.length; i++)
            {
                if (childrens[i].type.toLowerCase() === type)
                    result.push(childrens[i]);
            }
            return result;
        }

        function GetFormAction(parentForm)
        {
            var formAction = parentForm.action;
            if (typeof parentForm.action !== "string" && parentForm.getAttribute)
            {
                var tmp = document.createElement("form");
                tmp.setAttribute("action", parentForm.getAttribute("action"));
                formAction = tmp.action;
            }
            if (formAction && (formAction.toLowerCase().indexOf("http://") === 0 || formAction.toLowerCase().indexOf("https://") === 0))
                return formAction;
            return "";
        }

        function OnSubmitEventListener(element, parentForm)
        {
            var isElementVisible = IsVisible(element);
            if (isElementVisible && Boolean(element.value) && element.value !== m_lastPasswordSended)
            {
                m_lastPasswordSended = element.value;
                var hash = ns.md5(element.value) || "";
                var url = GetFormAction(parentForm) || document.location.toString() || "";
                var args = { url: url, passwordHash: hash };
                if (!m_syncCallFunction("wsc.WebsiteCredentialSendPasswordHash", args))
                    m_callFunction("wsc.WebsiteCredentialSendPasswordHash", args);
            }
            else
            {
                ns.SessionLog("Submit click, but password not send. Is element visible: " + isElementVisible +
                    ". Has element value: " + Boolean(element.value));
            }
        }

        function GetCallback(element, parentForm)
        {
            return function callback()
            {
                OnSubmitEventListener(element, parentForm);
            };
        }

        function GetSubmitButtons(parentForm)
        {
            return GetElements(parentForm, "input", "submit");
        }
        function GetSingleButton(parentForm)
        {
            var buttons = GetElements(parentForm, "button", "submit"); 
            if (buttons.length > 0) 
                return buttons;

            buttons = parentForm.getElementsByTagName("button");
            var result = [];
            for (var i = 0; i < buttons.length; i++)
            {
                if (IsVisible(buttons[i])) 
                    result.push(buttons[i]);
            }
            return result;
        }
        function SetEnterKeyEventListener(element, callback)
        {
            ns.AddEventListener(element, "keydown", function OnKeydown(e) { if (e.keyCode === 13) callback(); });
        }
        function SetButtonClickEventListener(element, callback)
        {
            ns.AddEventListener(element, "click", callback);
        }
        function SetFormEventListeners(parentForm, elements, callback)
        {
            for (var i = 0; i < elements.length; ++i) 
            {
                SetButtonClickEventListener(elements[i], callback);
                SetEnterKeyEventListener(elements[i], callback);
            }
            SetEnterKeyEventListener(parentForm, callback);
            ns.AddEventListener(parentForm, "submit", callback);
        }
        function SetEventListeners()
        {
            var passwordEditors = GetElements(document, "input", "password");
            ns.SessionLog("Founded password inputs count " + passwordEditors.length);
            for (var i = 0, length = passwordEditors.length; i < length; ++i)
            {
                if (IsSubscribedElement(passwordEditors[i]))
                    continue;
                var passwordForm = passwordEditors[i].form || document;
                if (passwordForm)
                {
                    var buttons = GetSubmitButtons(passwordForm);
                    if (buttons.length === 0)
                        buttons = GetSingleButton(passwordForm);
                    ns.SessionLog("Buttons count " + buttons.length);
                    var callback = GetCallback(passwordEditors[i], passwordForm);

                    SetFormEventListeners(passwordForm, buttons, callback);
                    SetEnterKeyEventListener(passwordEditors[i], callback);
                }
                MarkSubscribedElement(passwordEditors[i]);
            }
        }

        function Initialize()
        {
            session.InitializePlugin(function InitializePluginWsc(activatePlugin, registerMethod, callFunction, deactivate, syncCall)
            {
                m_callFunction = callFunction;
                m_syncCallFunction = syncCall;
                activatePlugin("wsc", OnPing);
            });

            SetEventListeners();
            m_passwordInputObserver.Start(SetEventListeners);
            ns.AddEventListener(window, "load", SetEventListeners);
            ns.AddEventListener(window, "unload", function OnUnload()
                {
                    ns.SessionLog("Stop observe input for WSC");
                    if (m_passwordInputObserver)
                        m_passwordInputObserver.Stop();
                });
            ns.SessionLog("WSC finish initialize");
        }

        Initialize();
    };

    var instance = null;
    ns.RunModule(function RunModuleWebsiteCredentials()
    {
        if (!instance)
            instance = new WebsiteCredentials();
    }, 2000);
});
