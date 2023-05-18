(ns =>
{

ns.IsPositionEqual = (prevPos, currentPos) => prevPos && currentPos && prevPos.top === currentPos.top && prevPos.left === currentPos.left;
ns.GetAbsoluteElementPosition = element =>
{
    const box = element.getBoundingClientRect();
    const scroll = ns.GetPageScroll();
    return {
            left: box.left + scroll.left,
            top: box.top + scroll.top,
            right: box.right + scroll.left,
            bottom: box.bottom + scroll.top
        };
};

})(KasperskyLab);
