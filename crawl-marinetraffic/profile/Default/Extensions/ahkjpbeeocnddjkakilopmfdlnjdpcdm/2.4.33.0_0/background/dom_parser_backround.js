KasperskyLab.AddRunner("dpbgrd", () =>
{
    function HistoryStateUpdate(details)
    {
        if (details.frameId !== 0)
            return;
        browsersApi.tabs.sendMessage(details.tabId, { command: "HistoryStateUpdate" }, { frameId: 0 }, () =>
        {
            if (browsersApi.runtime.lastError)
                KasperskyLab.SessionLog(`HistoryStateUpdate failed with error ${browsersApi.runtime.lastError.message}`);
        });
    }

    browsersApi.webNavigation.onHistoryStateUpdated.addListener(HistoryStateUpdate);
});
