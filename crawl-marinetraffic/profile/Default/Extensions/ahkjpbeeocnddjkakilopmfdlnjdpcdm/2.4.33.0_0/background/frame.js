function EmptyFunc()
{
    "use strict";
}

window.FrameObject = {

    onInitData: EmptyFunc,
    onGetData: EmptyFunc,
    onLocalize: EmptyFunc
};


var m_port = null;
var m_initialized = false;
var m_pluginName = "";
var m_cssLoaded = false;
var m_isRtl = false;
var m_actualStyle = "";
var m_visible = false;
var m_explicitSize = false;

function SendRuntime(command, data)
{
    "use strict";
    var message = { type: command, data: data };
    m_port.postMessage(message);
}

function SendCommand(commandType, commandData)
{
    "use strict";
    if (!m_initialized)
        return;

    if (!m_visible)
        return; 

    SendRuntime(commandType, commandData);
}

function SendLog(error)
{
    "use strict";
    if (!m_initialized)
        return;

    var msg = "";
    if (error instanceof Error)
    {
        msg = error.message;
        if (error.stack)
            msg += "\r\n" + error.stack;
    }
    else if (error instanceof Object)
    {
        msg = JSON.stringify(error);
    }
    else
    {
        msg = String(error);
    }

    SendRuntime("trace", msg);
}

function AddEventListener(element, name, func)
{
    "use strict";
    if ("addEventListener" in element)
    {
        element.addEventListener(name,
            function eventListener(e)
            {
                try
                {
                    func(e || window.event);
                }
                catch (ex)
                {
                    SendLog(ex);
                }
            },
            true);
    }
    else
    {
        element.attachEvent("on" + name,
            function eventListener(e)
            {
                try
                {
                    func.call(element, e || window.event);
                }
                catch (ex)
                {
                    SendLog(ex);
                }
            });
    }
}

function ClearElement(element)
{
    "use strict";
    while (element && element.firstChild)  
        element.removeChild(element.firstChild);
}

function ClearAndFieldElement(element, localeValue)
{
    "use strict";
    ClearElement(element);
    element.appendChild(document.createTextNode(localeValue));
}

function LocalizeElement(id, localeValue) 
{
    "use strict";
    var element = document.getElementById(id);
    if (element)
        ClearAndFieldElement(element, localeValue);
}

function LocalizeElementByClassName(className, localeValue) 
{
    "use strict";
    var elements = document.getElementsByClassName(className);
    for (var i = 0; i < elements.length; ++i)
        ClearAndFieldElement(elements[i], localeValue);
}

function IsDefined(variable)
{
    "use strict";
    return  typeof variable !== "undefined";
}

function StopProcessingEvent(evt) 
{
    "use strict";
    if (evt.preventDefault)
        evt.preventDefault();
    else
        evt.returnValue = false;
    if (evt.stopPropagation)
        evt.stopPropagation();
    if (IsDefined(evt.cancelBubble))
        evt.cancelBubble = true;
}

function InitPort()
{
    "use strict";
    browsersApi.tabs.getCurrent(function(tab)
        {
            m_port = browsersApi.tabs.connect(tab.id, {name: document.location.href});
            m_port.onMessage.addListener(OnPortMessage);
        });
}


function OnPortMessage(message)
{
    "use strict";
    try
    {
        OnMessage(message);
    }
    catch (e)
    {
        SendLog(e);
    }
}

function SendSize(sizeData, needSendNewSize)
{
    "use strict";
    document.body.style.width = sizeData.width + "px";
    document.body.style.height = sizeData.height + "px";

    if (needSendNewSize)
    {
        sizeData.style = m_actualStyle;
        SendCommand("size", sizeData);
    }
}

function ResizeBody(needSendNewSize)
{
    "use strict";
    if (m_explicitSize)
    {
        delete document.body.style.width;
        delete document.body.style.height;
        return;
    }

    document.body.style.width = "1px";
    document.body.style.height = "1px";

    var sizeData = {
        height: document.body.scrollHeight,
        width: document.body.scrollWidth
    };

    if (!sizeData.width || !sizeData.height)
    {
        setTimeout(function resizeTimer()
            {
                sizeData = {
                    height: document.body.scrollHeight,
                    width: document.body.scrollWidth
                };
                SendSize(sizeData, needSendNewSize);
            }, 50);
    }
    else
    {
        SendSize(sizeData, needSendNewSize);
    }
}

function OnLoadHandler()
{
    "use strict";
    m_cssLoaded = true;
    if (m_initialized)
        ResizeBody(true);
}

function InsertCssInline(cssData)
{
    "use strict";
    var style = document.createElement("style");
    style.type = "text/css";
    style.innerHTML = cssData;
    document.head.appendChild(style);

    setTimeout(OnLoadHandler, 0);
}

function SendClose(action)
{
    "use strict";
    if (!m_visible)
        return;

    var closeData = {
        closeAction: action
    };
    SendCommand("close", closeData);
    m_visible = false;
}

function SendData(data) 
{
    "use strict";
    SendCommand("data", data);
}

function SetStyle(style)
{
    "use strict";
    m_actualStyle = style ? style.toString() : "";
    document.body.className = m_actualStyle;
    if (m_isRtl)
        document.body.className += " rtl";
}

function OnUpdate(message)
{
    "use strict";
    m_visible = true;
    SetStyle(message.style);

    if (message.data)
        window.FrameObject.onGetData(message.data);

    if (m_cssLoaded)
        ResizeBody(message.needSize);
}


function OnInit(message)
{
    "use strict";
    m_initialized = true;
    m_pluginName = message.pluginName;
    m_isRtl = message.isRtl;
    m_visible = true;

    SetStyle(message.style);
    if (message.locales)
        window.FrameObject.onLocalize(message.locales);
    if (message.data)
        window.FrameObject.onInitData(message.data);
    if (message.explicitSize)
        m_explicitSize = true;
    if (message.cssData)
        InsertCssInline(message.cssData);

    if (m_cssLoaded)
        ResizeBody(message.needSize);
}

function OnMessage(message)
{
    "use strict";
    if (message.command === "init")
        OnInit(message);
    else if (message.command === "update")
        OnUpdate(message);
}


function Init()
{
    "use strict";
    if (document.readyState === "loading")
        AddEventListener(document, "DOMContentLoaded", InitPort);
    else
        InitPort();
}

Init();

