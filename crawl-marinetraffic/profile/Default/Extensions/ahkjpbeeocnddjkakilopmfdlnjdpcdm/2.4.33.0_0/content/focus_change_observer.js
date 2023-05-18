(ns =>
{
ns.FocusChangeObserver = function FocusChangeObserver(focusHandler, blurHandler, settingsChangedHandler, tags)
{
    function tryToGetFocusedInput()
    {
        const element = document.activeElement;
        return (document.hasFocus() && isFocusAllowedElement(element)) ? element : null;
    }

    function isFocusAllowedElement(element)
    {
        return element
            && element.tagName
            && tags.includes(element.tagName.toLowerCase());
    }

    function onBlur()
    {
        if (m_focusedElement)
        {
            const element = m_focusedElement;
            m_focusedElement = null;
            blurHandler(element);
        }
    }

    function onFocus(event)
    {
        const element = event.target;
        if (isFocusAllowedElement(element))
        {
            m_focusedElement = element;
            focusHandler(element);
        }
    }

    ns.AddEventListener(document, "focus", onFocus);
    ns.AddEventListener(document, "blur", onBlur);

    let m_focusedElement = tryToGetFocusedInput();
    if (m_focusedElement)
        focusHandler(m_focusedElement);

    this.settingsChanged = () =>
    {
        if (m_focusedElement)
            settingsChangedHandler(m_focusedElement);
    };

    this.unbind = () =>
    {
        if (document.removeEventListener)
        {
            document.removeEventListener("focus", onFocus, true);
            document.removeEventListener("blur", onBlur, true);
        }
        if (m_focusedElement)
        {
            blurHandler(m_focusedElement);
            m_focusedElement = null;
        }
    };
};
})(KasperskyLab);
