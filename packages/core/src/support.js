const Support = (function Support() {
  return {
    touch: (function checkTouch() {
      return !!((window.navigator.maxTouchPoints > 0) || ('ontouchstart' in window) || (window.DocumentTouch && document instanceof window.DocumentTouch));
    }()),

    pointerEvents: !!window.PointerEvent,

    observer: (function checkObserver() {
      return ('MutationObserver' in window || 'WebkitMutationObserver' in window);
    }()),

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
    }()),

    gestures: (function checkGestures() {
      return 'ongesturestart' in window;
    }()),

    intersectionObserver: (function checkObserver() {
      return ('IntersectionObserver' in window);
    }()),
  };
}());

export default Support;
