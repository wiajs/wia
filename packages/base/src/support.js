/** 
 * 是否支持触摸 touch等功能
*/

let _support;

const Support = (function Support() {
  if (_support)
    return _support;

   _support = {
    touch:  !!(
      'ontouchstart' in window ||
      (window.DocumentTouch && document instanceof window.DocumentTouch)
    ),

    pointerEvents:
      !!window.PointerEvent &&
      'maxTouchPoints' in window.navigator &&
      window.navigator.maxTouchPoints >= 0,

    observer: (function checkObserver() {
      return ('MutationObserver' in window || 'WebkitMutationObserver' in window);
    })(),

    passiveListener: (function checkPassiveListener() {
      let supportsPassive = false;
      try {
        const opts = Object.defineProperty({}, 'passive', {
          // eslint-disable-next-line
          get() {
            supportsPassive = true;
          },
        });
        window.addEventListener('testPassiveListener', null, opts);
      } catch (e) {
        // No support
      }
      return supportsPassive;
    })(),

    gestures: (function checkGestures() {
      return 'ongesturestart' in window;
    })(),

    intersectionObserver: (function checkObserver() {
      return 'IntersectionObserver' in window;
    })(),
  };
	return _support;
})();

export default Support;
