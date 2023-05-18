(function KpmBalloonMain(ns) 
{
    ns.KpmPromoBalloon = function KpmPromoBalloon(session, locales, callFunction) 
    {
        var m_balloon = null;
        var m_balloonWasShowed = false;
        var m_balloonState = 0;
        var m_centerCoord = { x: 0, y: 0 };
        var m_observer = null;
        var m_currentElement = null;
        var m_balloonStyle = "icon";

        var m_frameInfo = { fromFrame: false };

        var m_domParser = ns.GetDomParser(session);
        var m_onKeyDown = null;
        var m_onChange = null;

        function OnDataReceiveHandler(data)
        {
            if (data && data.balloonShowed && m_balloon)
            {
                m_balloonState = 1;
                m_balloonStyle = "balloon";
                m_balloon.Update(m_balloonStyle);
                callFunction("kpm.onTooltipShowed");
            }
        }

        function GetCoord(balloonSize)
        {
            var coord = { x: 0, y: 0 };

            if (!m_currentElement && !m_frameInfo.fromFrame)
                return coord;         

            var elementRect = {};
            if (m_frameInfo.fromFrame)
                elementRect = m_frameInfo.coord;
            else
                elementRect = m_currentElement.getBoundingClientRect();

            var clientWidth = ns.GetPageWidth();

            if (m_balloonState === 0)
            {
                if (elementRect.right + balloonSize.width <= clientWidth)
                {
                    coord.x = elementRect.right;
                    coord.y = elementRect.top + ((elementRect.bottom - elementRect.top) / 2) - (balloonSize.height / 2);
                }
                else
                {
                    coord.x = elementRect.left - balloonSize.width;
                    coord.y = elementRect.top + ((elementRect.bottom - elementRect.top) / 2) - (balloonSize.height / 2);
                }
                m_centerCoord.x = coord.x + (balloonSize.width / 2);
                m_centerCoord.y = coord.y + (balloonSize.height / 2);
            }
            else
            {
                coord.x = m_centerCoord.x - (balloonSize.width / 2);
                coord.y = m_centerCoord.y - (balloonSize.height / 2);
            }

            if (coord.x < 0)
                coord.x = 0;
            if (coord.y < 0)
                coord.y = 0;

            if (coord.x + balloonSize.width > clientWidth)
                coord.x = clientWidth - balloonSize.width;

            var scroll = ns.GetPageScroll();
            coord.x += scroll.left;
            coord.y += scroll.top;

            return coord;
        }

        function GetCoordsCallback(balloonSize)
        {
            return GetCoord(balloonSize);
        }

        function ShowBalloonImpl()
        {
            if (!m_balloonWasShowed)
            {
                ns.RemoveEventListener(document, "keydown", m_onKeyDown);
                ns.RemoveEventListener(document, "change", m_onChange);
                m_balloonWasShowed = true;
                if (window === window.top)
                {
                    m_frameInfo.fromFrame = false;
                    m_balloon.Show("icon");
                    callFunction("kpm.onIconShowed");
                }
            }

            if (window === window.top)
            {
                m_frameInfo.fromFrame = false;
                m_balloon.Show(m_balloonStyle);
                m_balloon.UpdatePosition();
            }
            else
            {
                var r = m_currentElement.getBoundingClientRect();
                callFunction("kpm.NeedToShowTooltip", { top: r.top, bottom: r.bottom, right: r.right, left: r.left });
                m_balloonWasShowed = true;
            }
        }

        function ShowBalloonIfNeed(result, selectors, currentElement)
        {
            if (result)
                return;

            if (m_currentElement && m_currentElement.offsetParent)
            {
                ShowBalloonImpl();
                return;
            }

            selectors.forEach(function forEachCallback(selector)
            {
                var element = document.querySelector(selector);
                if (element && element === currentElement)
                {
                    m_currentElement = element;
                    ShowBalloonImpl();
                }
            });
        }

        function ProcessForField(field)
        {
            var ShowBalloonIfNeedForField = function ShowBalloonIfNeedForField(result, selectors)
            {
                ShowBalloonIfNeed(result, selectors, field);
            };
            m_domParser.GetLoginSelectors(ShowBalloonIfNeedForField);
            m_domParser.GetPasswordSelectors(ShowBalloonIfNeedForField);
            m_domParser.GetNewPasswordSelectors(ShowBalloonIfNeedForField);
        }

        function OnKeyDown(evt)
        {
            try
            {
                if (m_balloonWasShowed && window === window.top)
                    return;
                if (evt && evt.target && evt.target.tagName && evt.target.tagName.toLowerCase() === "input")
                    ProcessForField(evt.target);
            }
            catch (e)
            {
                ns.SessionError(e, "kpm");
            }
        }

        function OnChange(evt)
        {
            try
            {
                if (evt && evt.target && evt.target.tagName && evt.target.tagName.toLowerCase() === "input" && evt.target.type && evt.target.type.toLowerCase() === "password")
                {
                    if (evt.target.value !== "")
                        ProcessForField(evt.target);
                }
            }
            catch (e)
            {
                ns.SessionError(e, "kpm");
            }
        }

        function OnMouseOver(evt)
        {
            try
            {
                var element = evt.target || evt.srcElement;
                if (element.nodeName.toLowerCase() !== "iframe")
                    return;

                m_frameInfo.frameElement = element;
            }
            catch (e)
            {
                ns.SessionError(e, "kpm");
            }
        }

        this.ShowBalloon = function ShowBalloon(obj)
        {
            if (window !== window.top)
                return;
            m_frameInfo.fromFrame = true;
            m_frameInfo.coord = {};

            var r = m_frameInfo.frameElement.getBoundingClientRect();

            m_frameInfo.coord.top = obj.top + r.top;
            m_frameInfo.coord.bottom = obj.bottom + r.top;
            m_frameInfo.coord.left = obj.left + r.left;
            m_frameInfo.coord.right = obj.right + r.left;

            ShowBalloonImpl();
        };

        function OnFocus(evt)
        {
            try
            {
                if (!m_balloonWasShowed)
                    return;
                ProcessForField(evt.target);
            }
            catch (e)
            {
                ns.SessionError(e, "kpm");
            }
        }

        function OnResize()
        {
            try
            {
                if (!m_balloonWasShowed || !m_currentElement)
                    return;
                ShowBalloonImpl();
            }
            catch (e)
            {
                ns.SessionError(e, "kpm");
            }
        }

        function OnCloseHandler(arg)
        {
            if (arg === 1)
                callFunction("kpm.onTooltipClosed");
            if (arg === 2)
                callFunction("kpm.onInstallPluginClicked");
            if (arg === 3)
                callFunction("kpm.onSkipNotificationsClicked");

            ns.RemoveEventListener(document, "focus", OnFocus);
            ns.RemoveEventListener(window, "resize", OnResize);
            if (!m_balloonWasShowed)
            {
                ns.RemoveEventListener(document, "keydown", OnKeyDown);
                ns.RemoveEventListener(document, "change", OnChange);
            }       
            if (window === window.top)
                ns.RemoveEventListener(document, "mouseover", OnMouseOver);


            if (m_observer)
                m_observer.Stop();
            m_balloon.Destroy();
        }

        m_onKeyDown = OnKeyDown;
        m_onChange = OnChange;
        m_balloon = (window === window.top)
            ? new ns.Balloon2("kpm", "/kpm/kpm_promo_balloon.html", "/kpm/tooltip.css", session, GetCoordsCallback, OnCloseHandler, locales, OnDataReceiveHandler)
            : null;

        ns.AddRemovableEventListener(document, "focus", OnFocus);
        ns.AddRemovableEventListener(window, "resize", OnResize);
        if (window === window.top)
            ns.AddRemovableEventListener(document, "mouseover", OnMouseOver);

        ns.AddRemovableEventListener(document, "change", OnChange);
        ns.AddRemovableEventListener(document, "keydown", OnKeyDown);
        function CheckFieldsByCSS(selector, checkFn)
        {
            try
            {
                var fields = document.querySelectorAll(selector);
                for (let field of fields)
                {
                    if (checkFn(field))
                        ProcessForField(field);
                }
            }
            catch (e)
            {
                return false;
            }
            return true;
        }

        function CheckFields()
        {
            if (m_balloonWasShowed && m_currentElement && !m_currentElement.offsetParent && m_balloon)
            {
                m_currentElement = null;
                m_balloon.Hide();
            }
            if (!m_balloonWasShowed)
            {
                if (!CheckFieldsByCSS("input:-webkit-autofill", function checker() { return true; }))
                    CheckFieldsByCSS("input[type='password']", function checker(field) { return field.value !== ""; });
            }
            else
            {
                ProcessForField(document.activeElement);
            }
        }
        CheckFields();

        m_observer = ns.GetDomChangeObserver("input");
        m_observer.Start(CheckFields);
        ns.AddEventListener(window, "unload", function OnUnload()
            {
                if (m_observer)
                    m_observer.Stop();
            });
    };

})(KasperskyLab || {});
