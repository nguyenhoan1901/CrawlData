(ns =>
{
    ns.VirtualKeyboardBalloon = function VirtualKeyboardBalloon(session, locales, onBalloonDataReceiveHandler)
    {
        const m_balloon = new ns.Balloon2(
            "vk_mac",
            "/vk/virtual_keyboard_balloon.html",
            "/vk_mac/balloon.css",
            session,
            GetCoordsCallback,
            OnCloseHandler,
            locales,
            OnDataReceiveHandler
        );

        let m_balloonX = 0;
        let m_balloonY = 0;
        let m_pageMouseX = 0;
        let m_pageMouseY = 0;
        let m_isAlreadyAppeared = false;
        let m_isDrag = false;
        let m_isButtonPressed = false;
        let m_firstAppearanceHandler = ns.EmptyFunc;

        function GetCoordsCallback() 
        {
            const coord = { x: m_balloonX, y: m_balloonY };
            return coord;
        }

        function OnCloseHandler(arg)
        {
            if (arg === 0)
                m_balloon.Hide();
        }

        function OnDragStart(mouseX, mouseY) 
        {
            m_isDrag = true;
            m_pageMouseX = m_balloonX + mouseX;
            m_pageMouseY = m_balloonY + mouseY;

            document.addEventListener("mouseup", OnDragEnd);
            document.addEventListener("mousemove", OnPageMouseMove);
        }

        function OnDragEnd() 
        {
            document.removeEventListener("mouseup", OnDragEnd);
            document.removeEventListener("mousemove", OnPageMouseMove);
            m_isDrag = false;
        }

        function OnDrag(offsetX, offsetY) 
        {
            m_balloonX += offsetX;
            m_balloonY += offsetY;

            m_balloon.LightUpdatePosition(m_balloonX, m_balloonY);

            m_pageMouseX += offsetX;
            m_pageMouseY += offsetY;
        }

        function OnPageMouseMove(event) 
        {
            m_balloonX += event.clientX - m_pageMouseX;
            m_balloonY += event.clientY - m_pageMouseY;

            m_balloon.LightUpdatePosition(m_balloonX, m_balloonY);

            m_pageMouseX = event.clientX;
            m_pageMouseY = event.clientY;
        }

        function OnDataReceiveHandler(data)
        {
            switch (data.msg) 
            {
                case "vk.pressedKey":
                    m_isButtonPressed = true;
                    onBalloonDataReceiveHandler(data);
                    break;
                case "vk.releasedKey":
                    m_isButtonPressed = false;
                    break;
                case "vk.dragStart":
                    OnDragStart(data.mouseX, data.mouseY);
                    break;
                case "vk.drag":
                    OnDrag(data.offsetX, data.offsetY);
                    break;
                case "vk.dragEnd":
                    OnDragEnd();
                    break;
                case "vk.created":
                    m_firstAppearanceHandler(data.width, data.height);
                    m_balloon.LightUpdatePosition(m_balloonX, m_balloonY);
                    break;
                default:
                    break;
            }
        }

        this.IsClicked = () => m_isDrag || m_isButtonPressed;

        this.HideBalloon = () => { m_balloon.Hide(); };

        function MoveAfterPasswordFieldFocus(x, y)
        {
            return width =>
            {
                m_balloonX = x - (width / 2);
                m_balloonY = y;
            };
        }

        function MoveAfterPopupVkOpenClicked(w, h)
        {
            m_balloonX = (window.outerWidth / 2) - (w / 2);
            m_balloonY = (window.outerHeight / 2) - (h / 2);
        }

        function Show(handler)
        {
            if (!m_isAlreadyAppeared)
            {
                m_firstAppearanceHandler = handler;
                m_isAlreadyAppeared = true;
            }
            m_balloon.Show("", {});
        }

        this.OnFocusPasswordTextFieldHandler = rect =>
        {
            Show(MoveAfterPasswordFieldFocus(rect.x + (rect.width / 2), rect.y));
        };

        this.ShowBalloon = () => { Show(MoveAfterPopupVkOpenClicked); };
    };

})(KasperskyLab);
