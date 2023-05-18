KasperskyLab.AddRunner("xhr_tracker", (ns, session, settings) =>
{
    let m_callFunction = null;

    function IsHeader(headers, name, value)
    {
        return ns.IsDefined(
            headers.find(element => Boolean(element["name"]) && element["name"].toLowerCase() === name.toLowerCase()
                && (value ? Boolean(element["value"]) && element["value"].toLowerCase() === value.toLowerCase() : true))
        );
    }

    function GetCustomHeader()
    {
        return settings.customHeader ? settings.customHeader : "X-KL-Ajax-Request";
    }

    function Initialize()
    {
        session.InitializePlugin((activatePlugin, registerMethod, callFunction) =>
        {
            m_callFunction = callFunction;
            activatePlugin("xhr_tracker", OnPing);

            browsersApi.webRequest.onBeforeSendHeaders.addListener(
                details =>
                {
                    if (details.type !== "xmlhttprequest")
                        return;

                    const origin = details.originUrl || details.initiator;
                    if (ns.IsCorsRequest(details.url, origin) || !IsHeader(details.requestHeaders, GetCustomHeader()))
                        m_callFunction("xhr.onBeforeSendHeaders", { url: details.url });
                },
                { urls: ["<all_urls>"] },
                ["requestHeaders"]
            );
        });
    }

    function OnPing()
    {
        return ns.MaxRequestDelay;
    }

    Initialize();
});
