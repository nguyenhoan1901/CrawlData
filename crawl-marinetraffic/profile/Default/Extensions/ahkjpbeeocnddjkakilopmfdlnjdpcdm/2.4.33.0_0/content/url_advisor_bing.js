KasperskyLab.GetSearchLinks = function GetSearchLinks()
{
    try
    {
        var links = document.querySelectorAll(".b_algo > h2 > a, .sb_tlst > h2 > a, .b_algo > .b_title > h2 > a");
        var results = [];
        for (var i = 0; i < links.length; ++i)
        {
            try
            {
                var linkElement = links[i];
                var liElement = linkElement.parentElement.parentElement.parentElement;
                var href = liElement.querySelector("cite").innerHTML;
                results.push({ element: linkElement, href: href });
            }
            catch (e)
            {
                KasperskyLab.SessionLog(e);
            }
        }
        return results;
    }
    catch (e)
    {
        KasperskyLab.SessionError(e, "ua");
        return [];
    }
};
