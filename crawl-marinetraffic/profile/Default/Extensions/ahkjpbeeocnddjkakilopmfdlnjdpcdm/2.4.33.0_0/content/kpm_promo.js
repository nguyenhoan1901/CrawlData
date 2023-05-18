KasperskyLab.AddRunner("kpm", function AddRunnerKpm(ns, session, settings, locales)
{
    var KpmPromo = function KpmPromo()
    {
        var m_callFunction = ns.EmptyFunc;
        var m_balloon = null;

        function OnPing()
        {
            return ns.MaxRequestDelay;
        }

        session.InitializePlugin(
            function InitializePluginCallback(activatePlugin, registerMethod, callFunction)
            {
                m_callFunction = callFunction;
                activatePlugin("kpm", OnPing);
                registerMethod("kpm.disable", function KpmDisable()
                {
                    if (m_balloon)
                        m_balloon.Disable();
                });
                registerMethod("kpm.showTooltip", function KpmShowTooltip(obj)
                {
                    if (m_balloon && window === window.top)
                        m_balloon.ShowBalloon(obj);
                });
            }
            );

        m_balloon = new ns.KpmPromoBalloon(session, locales, m_callFunction);
    };


    var instance = null;
    ns.RunModule(function RunModuleKpm()
    {
        if (!instance)
            instance = new KpmPromo();
    });
});
