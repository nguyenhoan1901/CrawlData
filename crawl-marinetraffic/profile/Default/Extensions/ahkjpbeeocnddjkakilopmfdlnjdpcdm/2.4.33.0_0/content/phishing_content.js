KasperskyLab.AddRunner("phfb_content", ns =>
{
    function PhishingFeedbackContent()
    {
        function InitializePlugin()
        {
            KasperskyLab.AddEventListener(document, "click", function onClick(event)
            {
                var element = event.target.closest("a[href]");
                if (element !== null && typeof element.href === "string")
                    browsersApi.runtime.sendMessage({ command: "ufb.cacheUserClick", url: element.href.replace(/#.*/, "") });
            });
        }
        InitializePlugin();
    }

    let instance = null;
    ns.RunModule(() =>
    {
        if (!instance)
            instance = new PhishingFeedbackContent();
    });
});
