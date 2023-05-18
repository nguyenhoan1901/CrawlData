KasperskyLab.AddRunner("vk_mac", (ns, session, settings, locales) =>
{
    function VirtualKeyboardMac()
    {
        const InputKey = {
            EMPTY: 0,
            ENTER: 1,
            BACKSPACE: 2,
            SYMBOL: 3
        };

        const KeyMap = new Map([
            ["return", InputKey.ENTER],
            ["backspace", InputKey.BACKSPACE],
            ["symbol", InputKey.SYMBOL]
        ]);

        const m_virtualKeyboardBalloon = new ns.VirtualKeyboardBalloon(session, locales, OnBallonDataReceived);
        let m_activeElement = null;
        let m_shutdown = false;
        let m_protectChangeTimeout = null;
        let m_callFunction = ns.EmptyFunc;

        function OnPing()
        {
            return ns.MaxRequestDelay;
        }

        function SubscribeOnFocusPasswordField()
        {
            if (!document.body)
            {
                ns.AddEventListener(window, "load", SubscribeOnFocusPasswordField);
                return;
            }

            const inputs = document.getElementsByTagName("input");

            for (const input of inputs)
            {
                if (input.type.toLowerCase() === "password")
                {
                    input.addEventListener("focus", CallShow);
                    input.addEventListener("blur", () =>
                    {
                        const isClickedWhenBlur = m_virtualKeyboardBalloon.IsClicked();
                        ns.SetTimeout(() => 
                        { 
                            if (!(m_virtualKeyboardBalloon.IsClicked() || isClickedWhenBlur))
                                m_virtualKeyboardBalloon.HideBalloon(); 
                        }, 100);
                    });
                }
            }
        }

        function CallShow()
        {
            m_callFunction("popup_vk_mac.show", { url: ns.StartLocationHref, fromPopup: false });
        }

        function ProcessFocus()
        {
        }

        function ProcessBlur()
        {
        }

        function SubscribeWhenMutation()
        {
            if (window.MutationObserver)
            {
                const observer = new MutationObserver(SubscribeOnFocusPasswordField);
                observer.observe(document.getRootNode(), { attributes: true, childList: true, subtree: true });
            }
        }

        function OnShow()
        {
            if (m_activeElement !== null)
                m_virtualKeyboardBalloon.OnFocusPasswordTextFieldHandler(m_activeElement.getBoundingClientRect());
            else
                m_virtualKeyboardBalloon.ShowBalloon();
        }

        function Init()
        {
            session.InitializePlugin((activatePlugin, registerMethod, callFunction) => 
                {
                    m_callFunction = callFunction;
                    activatePlugin("vk_mac", OnPing);
                    registerMethod("vk_mac.show", OnShow);
                    registerMethod("vk_mac.input", OnInput);
                });

            browsersApi.runtime.onMessage.addListener(OnMessage);
            SubscribeOnFocusPasswordField();
            SubscribeWhenMutation();
        }

        function OnMessage(request, sender, sendResponse)
        {
            if (browsersApi.runtime.lastError)
                ns.SessionLog(`Failed onMessage of vk mac ${browsersApi.runtime.lastError.message}`);

            if (request.command === "vk_mac.getHref" && window === window.top)
                KasperskyLab.TrySendResponse(sendResponse, { url: ns.StartLocationHref });
        }

        function StayFocusedAt(pos)
        {
            const cashedActiveElement = m_activeElement;
            ns.SetTimeout(() => 
            { 
                cashedActiveElement.focus();
                cashedActiveElement.setSelectionRange(pos, pos);
            }, 100);
        }

        function OnBackspacePressed() 
        {
            if (m_activeElement.selectionStart === 0 && m_activeElement.selectionEnd === 0)
                return false;

            let start = m_activeElement.value.length;
            let end = m_activeElement.value.length;
            if (m_activeElement.selectionStart && m_activeElement.selectionEnd) 
            {
                start = m_activeElement.selectionStart;
                end = m_activeElement.selectionEnd;
            }

            if (end === start)
                start -= 1;

            const lhs = m_activeElement.value.substring(0, start);
            const rhs = m_activeElement.value.substring(end, m_activeElement.value.length);

            m_activeElement.value = lhs + rhs;
            m_activeElement.selectionStart = start;
            m_activeElement.selectionEnd = start;

            return true;
        }

        function FindElement(tag, type)
        {
            const result = document.querySelector(`${tag}[type='${type}']`);
            if (result)
                return result;

            const elementsByTag = document.getElementsByTagName(tag);
            for (const element of elementsByTag)
            {
                if (element.type.toLowerCase() === type)
                    return element;
            }
            return null;
        }

        function OnInput(data)
        {
            if (data.key === InputKey.SYMBOL)
            {
                InsertCharacter(data.text);
            }
            else if (data.key === InputKey.ENTER)
            {
                if (m_activeElement.tagName && m_activeElement.tagName.toLowerCase() === "textarea")
                {
                    InsertCharacter("\n");
                }
                else
                {
                    const submitElement = FindElement("button", "submit") || FindElement("input", "submit");
                    if (submitElement)
                    {
                        submitElement.click();
                    }
                    else
                    {
                        const ke = new KeyboardEvent("keydown", { bubbles: true, cancelable: true, keyCode: 13 });
                        m_activeElement.dispatchEvent(ke);
                    }
                }
            }
            else if (data.key === InputKey.BACKSPACE)
            {
                if (OnBackspacePressed())
                    GenerateInputEvent({ bubbles: true, inputType: "deleteContentBackward", cancelable: true });
            }

            StayFocusedAt(m_activeElement.selectionStart);
        }

        function OnBallonDataReceived(data)
        {
            const key = KeyMap.has(data.key) ? KeyMap.get(data.key) : InputKey.EMPTY;
            const inputData = { key: key, text: ns.IsDefined(data.text) ? data.text : "" };
            if (m_activeElement)
                OnInput(inputData);
            else
                m_callFunction("popup_vk_mac.input", inputData);
        }

        function InsertCharacter(character)
        {
            const start = m_activeElement.selectionStart;
            const end = m_activeElement.selectionEnd;
            m_activeElement.value = m_activeElement.value.substring(0, start) + character + m_activeElement.value.substring(end);
            m_activeElement.setSelectionRange(start + character.length, start + character.length);

            GenerateInputEvent({ data: character, bubbles: true, inputType: "insertText", cancelable: true });
        }

        function GenerateInputEvent(eventData)
        {
            const inputEvent = new InputEvent("input", eventData);
            return m_activeElement.dispatchEvent(inputEvent);
        }

        function GenerateChangeEvent()
        {
            const changeEvent = new Event("change", { bubbles: true });
            m_activeElement.dispatchEvent(changeEvent);
        }

        function OnElementFocus(element)
        {
            if (m_shutdown)
                return;

            m_activeElement = element;
            m_callFunction("popup_vk_mac.update_focus", { isFocused: true });

            ns.ProtectableElementDetector.ChangeTypeIfNeeded(element);

            clearTimeout(m_protectChangeTimeout);
            m_protectChangeTimeout = ns.SetTimeout(() => { ProcessFocus(element); }, 0);
        }

        function OnElementBlur(element)
        {
            setTimeout(() =>
            {
                if (m_shutdown)
                    return;

                if (m_activeElement === element)
                    GenerateChangeEvent();
                ns.ProtectableElementDetector.RestoreTypeIfNeeded(element);

                clearTimeout(m_protectChangeTimeout);
                m_protectChangeTimeout = ns.SetTimeout(() => { ProcessBlur(); }, 0);
                m_activeElement = null;
                m_callFunction("popup_vk_mac.update_focus", { isFocused: false });
            }, 50);
        }

        ns.AddEventListener(window, "unload", () =>
        {
            clearTimeout(m_protectChangeTimeout);
            m_shutdown = true;
            m_observer.unbind();
        });

        const m_observer = new ns.FocusChangeObserver(OnElementFocus, OnElementBlur, () => {}, ["input", "textarea"]);

        Init();
    }

    let instance = null;
    ns.RunModule(() =>
    {
        if (!instance)
            instance = new VirtualKeyboardMac();
    }, 2000);
});
