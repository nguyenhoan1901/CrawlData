function NMServer(caller)
{
    function onReceived(msg)
    {
        SetStorageKeyIfUndefined("InstalledBeforeProduct", false);
        caller.onReceived(msg);
    }

    function onServerDisconnected(disconnectArg)
    {
        let isNeedToDelete = false;
        if (browsersApi.runtime.lastError)
        {
            const browserSpecificErrorText = "Specified native messaging host not found.";
            isNeedToDelete = browsersApi.runtime.lastError.message === browserSpecificErrorText;
        }
        else if (disconnectArg && disconnectArg.error)
        {
            const browserSpecificErrorText = `No such native application ${hostName}`;
            isNeedToDelete = disconnectArg.error.message === browserSpecificErrorText;
        }

        ProcessNativeMessagingDisconnectError(isNeedToDelete);
        caller.onServerDisconnected(disconnectArg);
        m_port = null;
    }

    function SetStorageKeyIfUndefined(key, value)
    {
        browsersApi.storage.local.get([key], values =>
        {
            if (typeof values[key] === "undefined")
            {
                const keyValue = {};
                keyValue[key] = value;
                browsersApi.storage.local.set(keyValue);
            }
        });
    }

    function RemoveSelfIfNeed()
    {
        browsersApi.storage.local.get(["InstalledBeforeProduct"], values =>
            {
                if (values.InstalledBeforeProduct === false)
                    browsersApi.management.uninstallSelf();
            });
    }

    function ProcessNativeMessagingDisconnectError(isNeedToDelete)
    {
        if (isNeedToDelete)
            RemoveSelfIfNeed();
        SetStorageKeyIfUndefined("InstalledBeforeProduct", isNeedToDelete);
    }

    this.Send = msg =>
    {
        m_port.postMessage(msg);
    };

    this.Disconnect = () => { m_port.disconnect(); };

    const hostName = "com.kaspersky.ahkjpbeeocnddjkakilopmfdlnjdpcdm.host";


    let m_port = browsersApi.runtime.connectNative(hostName);
    m_port.onMessage.addListener(onReceived);
    m_port.onDisconnect.addListener(onServerDisconnected);
}

function NativeMessagingTransport()
{
    let m_clientId = 1;
    let m_clients = [];
    let m_nmServer = null;
    let m_wasConnected = false;
    let m_supported = true;
    let m_protocolVersion = 0;

    function CheckPort(port)
    {
        if (typeof port === "undefined" || typeof port.id === "undefined")
            return false;
        return true;
    }

    function NewConnection(port, caller)
    {
        if (!m_nmServer && m_supported)
            m_nmServer = new NMServer(caller);

        if (!m_nmServer)
        {
            port.disconnect();
            return;
        }

        if (port.name === "resend")
        {
            const resendPort = browsersApi.tabs.connect(port.sender.tab.id, { name: port.sender.url });
            resendPort.onMessage.addListener(message => { port.postMessage(message); });
            port.onMessage.addListener(message => { resendPort.postMessage(message); });
            return;
        }

        port.id = m_clientId++;
        port.messageBuffer = "";
        m_clients[port.id] = port;
        port.onDisconnect.addListener(() =>
            {
                const shutdownCommand = { callId: 0, command: "shutdown" };
                if (m_nmServer)
                    m_nmServer.Send({ clientId: port.id, message: JSON.stringify(shutdownCommand) });
                delete m_clients[port.id];
            });
        port.onMessage.addListener(ProcessMessage);
        if (m_wasConnected)
            port.postMessage(JSON.stringify({ version: m_protocolVersion, connect: true, portId: port.id }));
    }

    function ProcessSpecificSecureInputCall(msg, port)
    {
        try
        {
            const msgObject = JSON.parse(msg);
            if (msgObject.commandAttribute === "vk.startProtect")
            {
                m_clients[0] = port;
            }
            else if (msgObject.commandAttribute === "vk.stopProtect")
            {
                if (m_clients[0] && m_clients[0].id === port.id)
                    m_clients[0] = null;
            }
            else if (msgObject.command === "nms")
            {
                port.nmsCaller = true;
                if (msgObject.commandAttribute.startsWith("CheckKeyboardLayout"))
                {
                    KasperskyLab.SessionLog("Receive check keyboard layout request in background");
                    return "CheckKeyboardLayout";
                }
                return msgObject.commandAttribute;
            }
        }
        catch (e)
        {
            KasperskyLab.SessionError(e, "nms_back");
        }
        return msg;
    }

    function ProcessMessage(msg, port)
    {
        if (!CheckPort(port) || !m_nmServer)
        {
            port.disconnect();
            delete m_clients[port.id];
            return;
        }
        const resendMessage = ProcessSpecificSecureInputCall(msg, port);
        if (resendMessage !== null)
            m_nmServer.Send({ clientId: port.id, message: resendMessage });
    }

    function SendConnected(port)
    {
        port.postMessage(JSON.stringify({ version: m_protocolVersion, portId: port.id }));
    }

    this.onReceived = obj =>
    {
        if (!m_wasConnected)
        {
            if (obj.protocolVersion < 2 || obj.connect === "unsupported")
            {
                m_supported = false;
                this.onServerDisconnected();
            }
            else if (obj.connect === "ok")
            {
                m_wasConnected = true;
                m_protocolVersion = obj.protocolVersion;
                for (const port of m_clients)
                {
                    if (port)
                        SendConnected(port);
                }
            }
            else
            {
                this.onServerDisconnected();
            }
            return;
        }

        if (typeof obj.clientId === "undefined")
        {
            KasperskyLab.Log("Invalid message");
            return;
        }

        const port = m_clients[obj.clientId];
        if (!port)
        {
            if (obj.clientId === 0 && m_protocolVersion < 4)
            {
                for (const currentPort of m_clients)
                {
                    if (currentPort && currentPort.nmsCaller)
                        currentPort.postMessage(obj.message);
                }
            }
            else
            {
                KasperskyLab.Log("Port didn't find");
            }
            return;
        }
        if (m_protocolVersion < 3)
        {
            port.postMessage(obj.message);
        }
        else if (!obj.isFinished)
        {
            port.messageBuffer += obj.message;
        }
        else
        {
            port.postMessage(port.messageBuffer + obj.message);
            port.messageBuffer = "";
        }
    };

    this.onServerDisconnected = msg =>
    {
        m_wasConnected = false;
        if (m_nmServer)
        {
            m_nmServer.Disconnect();
            m_nmServer = null;
        }

        if (msg)
            KasperskyLab.SessionLog(`NMS turn on unsupported state: ${msg}`);
        for (const port of m_clients)
        {
            if (port)
                port.disconnect();
        }
        m_clients = [];
    };

    this.connect = port => { NewConnection(port, this); };

    function init(caller)
    {
        browsersApi.runtime.onConnect.addListener(port => { NewConnection(port, caller); });
        m_nmServer = new NMServer(caller);
    }
    init(this);
}

const nativeMessagingTransport = new NativeMessagingTransport();
