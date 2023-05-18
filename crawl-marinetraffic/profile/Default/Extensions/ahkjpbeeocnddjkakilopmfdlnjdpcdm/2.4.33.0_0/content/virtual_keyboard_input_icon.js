(ns =>
{
ns.VirtualKeyboardInputIcon = function VirtualKeyboardInputIcon(clickCallback, session)
{
    let m_element = null;
    let m_visible = false;
    const m_balloon = new ns.Balloon2("vk_icon", "/vk/virtual_keyboard_input_icon.html", "/vk/virtual_keyboard_icon.css", session, GetCoords, null, null, DataReceive);
    let m_iconHideTimer = null;
    let m_updatePosInterval = null;
    ns.AddEventListener(window, "scroll", TriggerUpdatePosition);

    function ControlIconDisplaying(event)
    {
        try
        {
            const eventArg = event || window.event;
            if (eventArg.keyCode === 9 || eventArg.keyCode === 16)
                return;

            if (m_element.value === "")
                ShowInternal();
            else
                HideInternal();
        }
        catch (e)
        {
            ns.SessionError(e, "vk");
        }
    }

    function HideInternal()
    {
        if (!m_visible)
            return;
        clearInterval(m_updatePosInterval);
        m_balloon.Destroy();
        m_visible = false;
    }

    function ShowInternal()
    {
        if (m_visible)
            return;
        m_balloon.Show();
        m_balloon.UpdatePosition(); 
        m_updatePosInterval = ns.SetInterval(TriggerUpdatePosition, 500);
        m_visible = true;
    }

    function TriggerUpdatePosition()
    {
        if (!m_visible)
            return;

        const scroll = ns.GetPageScroll();
        if (scroll.top === 0)
            ns.SetTimeout(() => { m_balloon.UpdatePosition(); }, 10);
        else
            m_balloon.UpdatePosition();
    }

    function DataReceive(data)
    {
        if (data.showKeyboard && m_element)
            clickCallback();
    }

    function GetCoords()
    {
        const inputPosition = ns.GetAbsoluteElementPosition(m_element);
        const coords = { x: inputPosition.left + m_element.offsetWidth - 20, y: inputPosition.top + ((m_element.offsetHeight - 16) / 2) };

        const parent = m_element.parentNode;
        for (const child of parent.childNodes)
        {
            if (child.nodeType !== 1)
                continue;
            const style = window.getComputedStyle ? window.getComputedStyle(child) : child.currentStyle;
            if ((child.tagName && child.tagName.toLowerCase() === "img") || style.backgroundImage !== "none")
            {
                const childPosition = ns.GetAbsoluteElementPosition(child);
                if (childPosition.left > inputPosition.left + 20)
                    coords.x = childPosition.left - 20;
            }
        }
        return coords;
    }
    this.Show = element =>
    {
        m_element = element;

        if (m_iconHideTimer)
        {
            clearTimeout(m_iconHideTimer);
            HideInternal();
        }

        ShowInternal();
        ns.AddRemovableEventListener(m_element, "keyup", ControlIconDisplaying);

        this.Hide = () =>
        {
            m_iconHideTimer = ns.SetTimeout(() => { HideInternal(); }, 500);
            this.Hide = () => {};
            ns.RemoveEventListener(m_element, "keyup", ControlIconDisplaying);
        };
    };

    this.Hide = () => {};
};

})(KasperskyLab);
