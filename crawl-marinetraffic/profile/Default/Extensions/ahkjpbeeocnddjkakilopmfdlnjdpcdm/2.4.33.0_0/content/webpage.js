KasperskyLab.AddRunner("wp", (ns, session) =>
{
function Webpage()
{
    let m_callFunction = ns.EmptyFunc;

    function OnPing()
    {
        return ns.MaxRequestDelay;
    }

    function isFrameRedirected(callback)
    {
        browsersApi.runtime.sendMessage({ command: "isFrameRedirected" }, response =>
            {
                if (browsersApi.runtime.lastError)
                {
                    ns.SessionLog(browsersApi.runtime.lastError.message);
                    return;
                }
                callback(response.isRedirected);
            });
    }

    function Process()
    {
        m_callFunction("wp.content", { dom: document.documentElement.innerHTML });
    }

    function DelayProcess()
    {
        if (document.readyState === "complete")
            Process();
        else
            ns.SetTimeout(Process, 1000);
    }

    session.InitializePlugin((activatePlugin, registerMethod, callFunction) =>
        {
            m_callFunction = callFunction;
            activatePlugin("wp", OnPing);
            registerMethod("wp.getFrameContent", Process);
        });

    if (window !== window.top)
    {
        isFrameRedirected(isRedirected =>
        {
            if (isRedirected)
                m_callFunction("wp.createProcessors", null, DelayProcess);
        });
    }
    else
    {
        DelayProcess();
    }
}

let instance = null;
ns.RunModule(() =>
{
    if (!instance)
        instance = new Webpage();
});
});
