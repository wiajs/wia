/**
 * 支持按动画滚动窗口
 * @param  {...any} args
 * left, top, duration, easing, callback
 * @returns
 */
function scrollTo(...args) {
  let [left, top, duration, easing, callback] = args;
  if (args.length === 4 && typeof easing === 'function') {
    callback = easing;
    [left, top, duration, callback, easing] = args;
  }
  if (typeof easing === 'undefined') easing = 'swing';

  return this.each(function animate() {
    const el = this; // dom

    let currentTop;
    let currentLeft;
    let maxTop;
    let maxLeft;
    let newTop;
    let newLeft;
    let scrollTop; // eslint-disable-line
    let scrollLeft; // eslint-disable-line

    if (typeof easing === 'undefined') easing = 'swing';
    const hasScrollTop = 'scrollTop' in el;
    const hasScrollLeft = 'scrollLeft' in el;

    let animateTop = top > 0 || top === 0;
    let animateLeft = left > 0 || left === 0;

    if (animateTop) {
      currentTop = el.scrollTop;
      if (!duration) {
        if (hasScrollTop) el.scrollTop = top;
        else el.scrollTo(el.scrollX, top);
      }
    }

    if (animateLeft) {
      currentLeft = el.scrollLeft;
      if (!duration) {
        if (hasScrollLeft) el.scrollLeft = left;
        else el.scrollTo(left, el.scrollY);
      }
    }

    // 不需要动画
    if (!duration) return;

    // 延时动画
    if (animateTop) {
      maxTop = el.scrollHeight - el.offsetHeight;
      newTop = Math.max(Math.min(top, maxTop), 0);
    }

    if (animateLeft) {
      maxLeft = el.scrollWidth - el.offsetWidth;
      newLeft = Math.max(Math.min(left, maxLeft), 0);
    }

    let startTime = null;
    if (animateTop && newTop === currentTop) animateTop = false;
    if (animateLeft && newLeft === currentLeft) animateLeft = false;

    function render(time = new Date().getTime()) {
      if (startTime === null) {
        startTime = time;
      }
      const progress = Math.max(Math.min((time - startTime) / duration, 1), 0);
      const easeProgress =
        easing === 'linear' ? progress : 0.5 - Math.cos(progress * Math.PI) / 2;

      let done;
      if (animateTop)
        scrollTop = currentTop + easeProgress * (newTop - currentTop);
      if (animateLeft)
        scrollLeft = currentLeft + easeProgress * (newLeft - currentLeft);
      if (animateTop && newTop > currentTop && scrollTop >= newTop) {
        el.scrollTop = newTop;
        done = true;
      }
      if (animateTop && newTop < currentTop && scrollTop <= newTop) {
        el.scrollTop = newTop;
        done = true;
      }
      if (animateLeft && newLeft > currentLeft && scrollLeft >= newLeft) {
        el.scrollLeft = newLeft;
        done = true;
      }
      if (animateLeft && newLeft < currentLeft && scrollLeft <= newLeft) {
        el.scrollLeft = newLeft;
        done = true;
      }

      if (done) {
        if (callback) callback();
        return;
      }

      if (animateTop) el.scrollTop = scrollTop;
      if (animateLeft) el.scrollLeft = scrollLeft;
      $.requestAnimationFrame(render);
    }
    $.requestAnimationFrame(render);
  });
}

/**
 * 垂直滚动
 * @param  {...any} args
 * top 滚动距离
 * duration 动画时长
 * easing 动画
 * callback 滚动完成后的回调
 * @returns
 */
function scrollTop(...args) {
  if (!this.length) return;

  let [top, duration, easing, callback] = args;
  if (args.length === 3 && typeof easing === 'function') {
    [top, duration, callback, easing] = args;
  }
  const hasScrollTop = 'scrollTop' in this[0];

  // 没有传值，则取回当前dom节点的scrollTop
  if (top === undefined)
    return hasScrollTop ? this[0].scrollTop : this[0].pageYOffset;

  return this.scrollTo(undefined, top, duration, easing, callback);
}

/**
 * 水平滚动
 * @param  {...any} args
 * left 滚动距离
 * duration 动画时长
 * easing 动画
 * callback 滚动完成后的回调
 * @returns
 */
function scrollLeft(...args) {
  if (!this.length) return;

  let [left, duration, easing, callback] = args;
  if (args.length === 3 && typeof easing === 'function') {
    [left, duration, callback, easing] = args;
  }

  const hasScrollLeft = 'scrollLeft' in this[0];
  if (left === undefined)
    return hasScrollLeft ? this[0].scrollLeft : this[0].pageXOffset;

  return this.scrollTo(left, undefined, duration, easing, callback);
}

function scrollHeight() {
  return this[0].scrollHeight;
}

function scrollWidth() {
  return this[0].scrollWidth;
}

export {scrollTo, scrollTop, scrollLeft, scrollHeight, scrollWidth};
