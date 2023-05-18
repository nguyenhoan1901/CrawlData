function HandlePopupStartupParameters(request, sender, sendResponse)
{
    if (browsersApi.runtime.lastError)
    {
        KasperskyLab.SessionLog(`Error on handle popup startup parameters: ${browsersApi.runtime.lastError.message}`);
        return false;
    }    
    if (!KasperskyLab.IsSenderPopup(sender))
        return false;

    if (request.command === "getPopupStartupParameters")
        KasperskyLab.TrySendResponse(sendResponse, { isConnectedToProduct: KasperskyLab.IsConnectedToProduct });
    return false;
}

browsersApi.runtime.onMessage.addListener(HandlePopupStartupParameters);
