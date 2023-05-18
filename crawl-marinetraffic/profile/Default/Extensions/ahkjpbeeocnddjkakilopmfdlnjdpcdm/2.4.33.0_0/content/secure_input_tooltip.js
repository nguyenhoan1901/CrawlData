(ns =>
{

ns.SecureInputTooltip = function SecureInputTooltip(locales, session)
{
    let m_currentElement = null;
    let m_timer = null;

    const Top = 0;
    const Bottom = 1;

    let m_lastTooltipPosition = Bottom;

    const GetCoords = tooltipSize =>
    {
        if (!m_timer)
        {
            m_timer = ns.SetInterval(UpdateBalloonByTimer, 100);
            ns.SetTimeout(() => { this.Hide(); }, 3000);
        }

        const inputPosition = ns.GetAbsoluteElementPosition(m_currentElement);
        const coords = { x: inputPosition.left, y: inputPosition.top };

        const inputTopRelative = inputPosition.top - ns.GetPageScroll().top;
        const clientHeightUnderInput = ns.GetPageHeight() - inputTopRelative - m_currentElement.offsetHeight;

        if ((clientHeightUnderInput > tooltipSize.height - 1)
            || (inputPosition.top - tooltipSize.height + 1 < 0))
        {
            coords.y = inputPosition.top + m_currentElement.offsetHeight - 1;
            SetPosition(Top);
        }
        else
        {
            coords.y = inputPosition.top - tooltipSize.height + 1;
            SetPosition(Bottom);
        }

        return coords;
    };
    const m_balloon = new ns.Balloon2("vk_si", "/vk/secure_input_tooltip.html", "/vk/secure_input_tooltip.css", session, GetCoords, OnCloseHandler, locales);

    function GetClassName(position)
    {
        if (position === Top)
            return "top_balloon";
        else if (position === Bottom)
            return "bottom_balloon";
        return null;
    }

    function UpdateBalloon()
    {
        if (!m_balloon)
            return;
        m_balloon.Update(GetClassName(m_lastTooltipPosition));
    }

    function SetPosition(position)
    {
        if (m_lastTooltipPosition === position)
            return;

        m_lastTooltipPosition = position;
        UpdateBalloon();
    }

    function UpdateBalloonByTimer()
    {
        if (!m_balloon)
            return;
        m_balloon.UpdatePosition();
    }

    function RestoreFocusForLastElement()
    {
        if (m_currentElement) 
            m_currentElement.focus();
    }

    function OnCloseHandler(closeAction)
    {
        switch (closeAction)
        {
        case 1:
            ns.SetTimeout(RestoreFocusForLastElement, 0);
            break;
        default:
            ns.SessionError({ message: "Unknown close action", details: `action: ${closeAction}` }, "vk");
            break;
        }
    }


    this.Show = element =>
    {
        m_currentElement = element;
        m_balloon.Show();

        this.Hide = () =>
        {
            clearInterval(m_timer);

            ns.SetTimeout(() => { m_balloon.Destroy(); }, 200);

            this.Show = () => {};
            this.Hide = () => {};
        };
    };
    this.Hide = () => {};
};

})(KasperskyLab);
