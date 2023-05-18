let tabId = 0;

const docOptions = {
    name: "light_doc",
    runner: () => {},
    getParameters: () => ({
            tabId: tabId,
            scriptPluginId: Math.floor((1 + Math.random()) * 0x10000).toString(16) 
        })
};
KasperskyLab.AddRunner2(docOptions);

function GetStartupParameters()
{
    browsersApi.runtime.sendMessage({ command: "getContentStartupParameters" },
        response =>
        {
            if (browsersApi.runtime.lastError)
            {
                setTimeout(GetStartupParameters, 100);
                KasperskyLab.SessionError(`Error on GetStartupParameters: ${browsersApi.runtime.lastError.message}`, "light_doc");
                return;
            }
            if (!response)
            {
                setTimeout(GetStartupParameters, 100);
            }
            else
            {
                tabId = response.tabId;
                if (response.isConnectedToProduct)
                    KasperskyLab.StartSession();
                else
                    setTimeout(GetStartupParameters, 2 * 60 * 1000);
            }
        });
}
GetStartupParameters();
