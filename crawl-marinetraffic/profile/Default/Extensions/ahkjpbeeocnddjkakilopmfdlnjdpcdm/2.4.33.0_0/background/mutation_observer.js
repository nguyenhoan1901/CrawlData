(function CommonMutation(ns)
{
    function IsElementNode(node)
    {
        return node.nodeType === 1; 
    }

    function IsNodeContainsElementWithTag(node, observeTag)
    {
        try
        {
            return observeTag === "*" || (IsElementNode(node) && ((node.tagName && node.tagName.toLowerCase() === observeTag) || node.getElementsByTagName(observeTag).length > 0));
        }
        catch (e)
        {
            return false;
        }
    }

    function MutationChangeObserver(observeTag)
    {
        var m_observer = null;
        var m_callback = null;
        var m_functionCheckInteresting = observeTag ? function functionCheckInteresting(node) { return IsNodeContainsElementWithTag(node, observeTag); } : IsElementNode;

        function ProcessNodeList(nodeList)
        {
            for (var i = 0; i < nodeList.length; ++i)
            {
                if (m_functionCheckInteresting(nodeList[i]))
                    return true;
            }
            return false;
        }

        function ProcessDomChange(records)
        {
            try
            {
                if (!m_callback)
                    return;

                for (var i = 0; i < records.length; ++i)
                {
                    var record = records[i];
                    if ((record.addedNodes.length && ProcessNodeList(record.addedNodes))
                        || (record.removedNodes.length && ProcessNodeList(record.removedNodes)))
                    {
                        m_callback();
                        return;
                    }
                }
            }
            catch (e)
            {
                ns.SessionError(e);
            }
        }

        this.Start = function Start(callback)
        {
            m_callback = callback;
            m_observer = new MutationObserver(ProcessDomChange);
            m_observer.observe(document, { childList: true, subtree: true });
        };
        this.Stop = function Stop()
        {
            m_observer.disconnect();
            m_callback = null;
        };
    }

    ns.GetDomChangeObserver = function GetDomChangeObserver(observeTag)
    {
        var observeTagLowerCase = observeTag ? observeTag.toLowerCase() : observeTag;
        return new MutationChangeObserver(observeTagLowerCase);
    };

    return ns;
})(KasperskyLab);
