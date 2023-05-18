(function NmsTransportMain(ns)
{
ns.NMSTransportSupported = ns.IsDefined(chrome) && ns.IsDefined(browsersApi.runtime);
if (!ns.NMSTransportSupported)
    return ns;

ns.NMSCaller = function NMSCaller()
{
    let m_port = null;

    const m_waitResponse = {};
    let m_callReceiver = () => {};
    let m_callReceiverEnabled = false;
    let m_connected = false;
    let m_initialized = false;
    let m_deferredCalls = [];
    let m_callId = 0;

    function ProcessMessage(arg)
    {
        try
        {
            const response = ns.JSONParse(arg);
            if (m_waitResponse[response.callId])
            {
                const callWaiter = m_waitResponse[response.callId];
                delete m_waitResponse[response.callId];
                clearTimeout(callWaiter.timeout);

                if (callWaiter.callbackResult)
                    callWaiter.callbackResult(response.commandData);

                return;
            }

            if (!m_initialized)
            {
                m_deferredCalls.push(arg);
                return;
            }

            if (response.command === "from")
            {
                const command = ns.JSONParse(response.commandData);
                m_callReceiver(command.method, command.parameters);
            }
        }
        catch (e)
        {
            ns.SessionError(e, "nms");
        }
    }

    function ConnetToNativeMessaging(callbackSuccess, callbackError)
    {
        m_port = browsersApi.runtime.connect();
        AddListeners();

        function OnMessage(msg)
        {
            if (!m_connected)
            {
                const connectData = ns.JSONParse(msg);
                ns.GetNmsId = () => connectData.portId;
                ns.GetNmsVersion = () => connectData.version;

                m_port.onMessage.removeListener(OnMessage);
                m_port.onMessage.addListener(ProcessMessage);
                m_connected = true;
                if (callbackSuccess)
                    callbackSuccess();
            }
        }

        m_port.onMessage.addListener(OnMessage);
        function OnDisconnect()
        {
            let reason = "unknown";
            if (browsersApi.runtime.lastError)
                reason = browsersApi.runtime.lastError.message;
            m_connected = false;
            callbackError(`Connection was disconnect: ${reason}`);

            m_port.onMessage.removeListener(OnMessage);
            m_port.onMessage.removeListener(ProcessMessage);
            m_port.onDisconnect.removeListener(OnDisconnect);
        }
        function AddListeners()
        {
            m_port.onDisconnect.addListener(OnDisconnect);
        }

    }

    function CallImpl(command, commandAttribute, data, callbackResult, callbackError)
    {
        try
        {
            if (++m_callId % 0x100000000 === 0)
                m_callId = 1;

            const callId = m_callId;
            if (callbackResult || callbackError)
            {
                const timeout = ns.SetTimeout(() =>
                    {
                        delete m_waitResponse[callId];
                        callbackError && callbackError(`NMS call timeout for ${command}/${commandAttribute}`);
                    }, 120000);
                const callWaiter = 
                    {
                        callId: callId,
                        callbackResult: callbackResult,
                        timeout: timeout
                    };
                m_waitResponse[callId] = callWaiter;
            }

            m_port.postMessage(ns.JSONStringify(
                {
                    callId: callId,
                    command: command,
                    commandAttribute: commandAttribute || "",
                    commandData: data || ""
                }
                ));
        }
        catch (e)
        {
            callbackError && callbackError(`Connection call ${command}/${commandAttribute} exception: ${e}`);
        }
    }

    this.Start = (callbackSuccess, callbackError) =>
    {
        try
        {
            m_connected = false;
            ConnetToNativeMessaging(callbackSuccess, callbackError);
        }
        catch (e)
        {
            callbackError && callbackError(`Connection start exception: ${e}`);
        }
    };

    this.SendLog = message => { CallImpl("log", null, message); };
    this.SendResult = (methodName, data) => { CallImpl("callResult", methodName, data); };
    this.Call = (command, commandAttribute, data, isAsync, callbackResult, callbackError) =>
    {
        if (ns.IsDefined(isAsync) && !isAsync)
            return false;

        CallImpl(
            command,
            commandAttribute,
            data,
            callbackResult
                ? responseText =>
                    {
                        if (callbackResult)
                        {
                            try
                            {
                                const response = ns.JSONParse(responseText);
                                callbackResult(response.result, response.parameters, response.method);
                            }
                            catch (e)
                            {
                                CallImpl("log", null, `error on parse message: ${responseText} error: ${e}`);
                                callbackError && callbackError(e);
                            }
                        }
                    }
                : null,
            callbackError
            );
        return false;
    };

    this.nmsCallSupported = true;

    this.ResourceCall = (resourcePostfix, callbackResult, callbackError) =>
    {
        CallImpl("resource", "", resourcePostfix, callbackResult, callbackError);
    };

    this.InitCall = (initData, callbackResult, callbackError) =>
    {
        if (ns.StartLocationHref === "data:text/html,chromewebdata")
        {
            callbackError();
            return;
        }

        CallImpl("init", null, ns.JSONStringify(initData), responseText =>
            {
                m_initialized = true;
                const initSettings = ns.JSONParse(responseText);

                if (ns.IsDefined(initSettings.Shutdown))
                    return;

                callbackResult(initSettings);

                for (let i = 0; i < m_deferredCalls.length; ++i)
                    ProcessMessage(m_deferredCalls[i]);
                m_deferredCalls = [];
            }, callbackError);
    };

    this.StartCall = (startData, callbackResult, callbackError) =>
    {
        CallImpl(
            "start",
            null,
            ns.JSONStringify(startData),
            responseText => { callbackResult(ns.JSONParse(responseText)); },
            callbackError
        );
    };
    this.StopCall = (injector, callbackResult, callbackError) =>
    {
        CallImpl(
            "stop",
            null,
            ns.JSONStringify({ injectorName: injector }),
            responseText => { callbackResult(ns.JSONParse(responseText)); },
            callbackError
        );
    };
    this.GetReceiver = () => this;
    this.StartReceive = callMethod =>
    {
        m_callReceiverEnabled = true;
        m_callReceiver = callMethod;
    };
    this.ForceReceive = () => {};
    this.StopReceive = () =>
    {
        m_callReceiverEnabled = false;
        m_callReceiver = () => {};

        if (m_port)
        {
            m_connected = false;
            m_port.disconnect();
            m_port = null;
        }
    };
    this.IsStarted = () => m_callReceiverEnabled;
    this.IsProductConnected = () => m_connected;
};

return ns;
})(KasperskyLab);
