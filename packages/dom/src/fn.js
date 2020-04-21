const {Dom} = $;

const emptyArray = [];

function ready(cb) {
  if (/complete|loaded|interactive/.test(document.readyState) && document.body)
    cb($);
  else
    document.addEventListener(
      'DOMContentLoaded',
      function () {
        cb($);
      },
      false
    );
  return this;
}

function attr(attrs, value) {
  if (arguments.length === 1 && typeof attrs === 'string') {
    // Get attr
    if (this[0]) return this[0].getAttribute(attrs);
    return undefined;
  }

  // Set attrs
  for (let i = 0; i < this.length; i += 1) {
    if (arguments.length === 2) {
      // String
      this[i].setAttribute(attrs, value);
    } else {
      // Object
      // eslint-disable-next-line
      for (const attrName in attrs) {
        this[i][attrName] = attrs[attrName];
        this[i].setAttribute(attrName, attrs[attrName]);
      }
    }
  }
  return this;
}
// eslint-disable-next-line
function removeAttr(attr) {
  for (let i = 0; i < this.length; i += 1) {
    this[i].removeAttribute(attr);
  }
  return this;
}

function hasAttr(attr) {
  return emptyArray.some.call(this, function (el) {
    return el.hasAttribute(attr);
  });
}

// eslint-disable-next-line
function prop(props, value) {
  if (arguments.length === 1 && typeof props === 'string') {
    // Get prop
    if (this[0]) return this[0][props];
  } else {
    // Set props
    for (let i = 0; i < this.length; i += 1) {
      if (arguments.length === 2) {
        // String
        this[i][props] = value;
      } else {
        // Object
        // eslint-disable-next-line
        for (const propName in props) {
          this[i][propName] = props[propName];
        }
      }
    }
    return this;
  }
}
function data(key, value) {
  let el;
  if (typeof value === 'undefined') {
    el = this[0];
    // Get value
    if (el) {
      if (el.domElementDataStorage && key in el.domElementDataStorage) {
        return el.domElementDataStorage[key];
      }

      const dataKey = el.getAttribute(`data-${key}`);
      if (dataKey) {
        return dataKey;
      }
      return undefined;
    }
    return undefined;
  }

  // Set value
  for (let i = 0; i < this.length; i += 1) {
    el = this[i];
    if (!el.domElementDataStorage) el.domElementDataStorage = {};
    el.domElementDataStorage[key] = value;
  }
  return this;
}
function removeData(key) {
  for (let i = 0; i < this.length; i += 1) {
    const el = this[i];
    if (el.domElementDataStorage && el.domElementDataStorage[key]) {
      el.domElementDataStorage[key] = null;
      delete el.domElementDataStorage[key];
    }
  }
}
function dataset() {
  const el = this[0];
  if (!el) return undefined;
  const dataset = {}; // eslint-disable-line
  if (el.dataset) {
    // eslint-disable-next-line
    for (const dataKey in el.dataset) {
      dataset[dataKey] = el.dataset[dataKey];
    }
  } else {
    for (let i = 0; i < el.attributes.length; i += 1) {
      // eslint-disable-next-line
      const attr = el.attributes[i];
      if (attr.name.indexOf('data-') >= 0) {
        dataset[$.camelCase(attr.name.split('data-')[1])] = attr.value;
      }
    }
  }
  // eslint-disable-next-line
  for (const key in dataset) {
    if (dataset[key] === 'false') dataset[key] = false;
    else if (dataset[key] === 'true') dataset[key] = true;
    else if (parseFloat(dataset[key]) === dataset[key] * 1) dataset[key] *= 1;
  }
  return dataset;
}
function val(value) {
  const dom = this;
  if (typeof value === 'undefined') {
    if (dom[0]) {
      if (dom[0].multiple && dom[0].nodeName.toLowerCase() === 'select') {
        const values = [];
        for (let i = 0; i < dom[0].selectedOptions.length; i += 1) {
          values.push(dom[0].selectedOptions[i].value);
        }
        return values;
      }
      return dom[0].value;
    }
    return undefined;
  }

  for (let i = 0; i < dom.length; i += 1) {
    const el = dom[i];
    if (
      Array.isArray(value) &&
      el.multiple &&
      el.nodeName.toLowerCase() === 'select'
    ) {
      for (let j = 0; j < el.options.length; j += 1) {
        el.options[j].selected = value.indexOf(el.options[j].value) >= 0;
      }
    } else {
      el.value = value;
    }
  }
  return dom;
}
// Transforms
// eslint-disable-next-line
function transform(transform) {
  for (let i = 0; i < this.length; i += 1) {
    const elStyle = this[i].style;
    elStyle.webkitTransform = transform;
    elStyle.transform = transform;
  }
  return this;
}
function transition(duration) {
  if (typeof duration !== 'string') {
    duration = `${duration}ms`; // eslint-disable-line
  }
  for (let i = 0; i < this.length; i += 1) {
    const elStyle = this[i].style;
    elStyle.webkitTransitionDuration = duration;
    elStyle.transitionDuration = duration;
  }
  return this;
}
// Events
function on(...args) {
  let [eventType, targetSelector, listener, capture] = args;
  if (typeof args[1] === 'function') {
    [eventType, listener, capture] = args;
    targetSelector = undefined;
  }
  if (!capture) capture = false;

  function handleLiveEvent(e) {
    const target = e.target;
    if (!target) return;
    const eventData = e.target.domEventData || [];
    if (eventData.indexOf(e) < 0) {
      eventData.unshift(e);
    }
    if ($(target).is(targetSelector)) listener.apply(target, eventData);
    else {
      const parents = $(target).parents(); // eslint-disable-line
      for (let k = 0; k < parents.length; k += 1) {
        if ($(parents[k]).is(targetSelector))
          listener.apply(parents[k], eventData);
      }
    }
  }

  // 事件响应，参数为 domEventData，而不是dom事件中的 event
  function handleEvent(e) {
    const eventData = e && e.target ? e.target.domEventData || [] : [];
    if (eventData.indexOf(e) < 0) {
      eventData.unshift(e);
    }
    listener.apply(this, eventData);
  }

  // Prevent duplicate clicks
  // click事件响应，参数为 domEventData，而不是dom事件中的 event
  function clickEvent(e) {
    // disabled not trigger event
    if (this.hasAttribute('disabled')) {
      e.stopPropagation();
      return false;
    }

    // Prevent duplicate clicks
    this.setAttribute('disabled', 'true');
    setTimeout(() => {
      try {
        this.removeAttribute('disabled');
      } catch (ex) {
        console.log('clickEvent ', {ex: ex.message});
      }
    }, 500); // wait 500 ms, can click again

    const eventData = e && e.target ? e.target.domEventData || [] : [];
    if (eventData.indexOf(e) < 0) {
      eventData.unshift(e);
    }
    listener.apply(this, eventData);
  }

  // on 函数内共享闭包变�
  let touchStartX;
  let touchStartY;
  function touchStart(ev) {
    // ev.preventDefault();
    touchStartX = ev.changedTouches[0].clientX;
    touchStartY = ev.changedTouches[0].clientY;
  }

  function touchEnd(ev) {
    ev.preventDefault(); // 阻止后续�?click 事件触发
    const x = Math.abs(ev.changedTouches[0].clientX - touchStartX);
    const y = Math.abs(ev.changedTouches[0].clientY - touchStartY);
    // console.log('dom touchEnd', {x, y});
    if (x <= 5 && y <= 5) return clickEvent.call(this, ev);
  }

  const events = eventType.split(' ');
  let j;
  for (let i = 0; i < this.length; i += 1) {
    const el = this[i];
    if (!targetSelector) {
      for (j = 0; j < events.length; j += 1) {
        let event = events[j];
        if (!el.domListeners) el.domListeners = {};
        if (!el.domListeners[event]) el.domListeners[event] = [];

        // click 300ms late，use touch Trigger immediately
        if (event === 'click' && $.support.touch) {
          el.domListeners[event].push({
            listener,
            proxyListener: [touchStart, touchEnd],
          });
          el.addEventListener('touchstart', touchStart, capture);
          el.addEventListener('touchend', touchEnd, capture);
        } else if (event === 'click') {
          el.domListeners[event].push({
            listener,
            proxyListener: clickEvent,
          });
          el.addEventListener(event, clickEvent, capture);
        } else {
          el.domListeners[event].push({
            listener,
            proxyListener: handleEvent,
          });
          el.addEventListener(event, handleEvent, capture);
        }
      }
    } else {
      // Live events
      for (j = 0; j < events.length; j += 1) {
        const event = events[j];
        if (!el.domLiveListeners) el.domLiveListeners = {};
        if (!el.domLiveListeners[event]) el.domLiveListeners[event] = [];
        el.domLiveListeners[event].push({
          listener,
          proxyListener: handleLiveEvent,
        });
        el.addEventListener(event, handleLiveEvent, capture);
      }
    }
  }
  return this;
}

function off(...args) {
  let [eventType, targetSelector, listener, capture] = args;
  if (typeof args[1] === 'function') {
    [eventType, listener, capture] = args;
    targetSelector = undefined;
  }
  if (!capture) capture = false;

  const events = eventType.split(' ');
  for (let i = 0; i < events.length; i += 1) {
    let event = events[i];
    for (let j = 0; j < this.length; j += 1) {
      const el = this[j];
      let handlers;
      if (!targetSelector && el.domListeners) {
        handlers = el.domListeners[event];
      } else if (targetSelector && el.domLiveListeners) {
        handlers = el.domLiveListeners[event];
      }
      if (handlers && handlers.length) {
        for (let k = handlers.length - 1; k >= 0; k -= 1) {
          const handler = handlers[k]; // 事件响应对象数组
          if (listener && handler.listener === listener) {
            if (event === 'click' && $.support.touch) {
              el.removeEventListener(
                'touchstart',
                handler.proxyListener[0],
                capture
              );
              el.removeEventListener(
                'touchend',
                handler.proxyListener[1],
                capture
              );
            } else
              el.removeEventListener(event, handler.proxyListener, capture);
            handlers.splice(k, 1);
          } else if (
            listener &&
            handler.listener &&
            handler.listener.domproxy &&
            handler.listener.domproxy === listener
          ) {
            el.removeEventListener(event, handler.proxyListener, capture);
            handlers.splice(k, 1);
          } else if (!listener) {
            el.removeEventListener(event, handler.proxyListener, capture);
            handlers.splice(k, 1);
          }
        }
      }
    }
  }
  return this;
}
function once(...args) {
  const dom = this;
  let [eventName, targetSelector, listener, capture] = args;
  if (typeof args[1] === 'function') {
    [eventName, listener, capture] = args;
    targetSelector = undefined;
  }
  function onceHandler(...eventArgs) {
    listener.apply(this, eventArgs);
    dom.off(eventName, targetSelector, onceHandler, capture);
    if (onceHandler.domproxy) {
      delete onceHandler.domproxy;
    }
  }
  onceHandler.domproxy = listener;
  return dom.on(eventName, targetSelector, onceHandler, capture);
}
function trigger(...args) {
  const events = args[0].split(' ');
  const eventData = args[1];
  for (let i = 0; i < events.length; i += 1) {
    const event = events[i];
    for (let j = 0; j < this.length; j += 1) {
      const el = this[j];
      let evt;
      try {
        evt = new window.CustomEvent(event, {
          detail: eventData,
          bubbles: true,
          cancelable: true,
        });
      } catch (e) {
        evt = document.createEvent('Event');
        evt.initEvent(event, true, true);
        evt.detail = eventData;
      }
      // eslint-disable-next-line
      el.domEventData = args.filter((data, dataIndex) => dataIndex > 0);
      el.dispatchEvent(evt);
      el.domEventData = [];
      delete el.domEventData;
    }
  }
  return this;
}

function transitionEnd(callback) {
  const events = ['webkitTransitionEnd', 'transitionend'];
  const dom = this;
  let i;
  function fireCallBack(e) {
    /* jshint validthis:true */
    if (e.target !== this) return;
    callback.call(this, e);
    for (i = 0; i < events.length; i += 1) {
      dom.off(events[i], fireCallBack);
    }
  }
  if (callback) {
    for (i = 0; i < events.length; i += 1) {
      dom.on(events[i], fireCallBack);
    }
  }
  return this;
}

function animationEnd(callback) {
  const events = ['webkitAnimationEnd', 'animationend'];
  const dom = this;
  let i;
  function fireCallBack(e) {
    if (e.target !== this) return;
    callback.call(this, e);
    for (i = 0; i < events.length; i += 1) {
      dom.off(events[i], fireCallBack);
    }
  }
  if (callback) {
    for (i = 0; i < events.length; i += 1) {
      dom.on(events[i], fireCallBack);
    }
  }
  return this;
}

// Sizing/Styles
function width() {
  if (this[0] === window) {
    return window.innerWidth;
  }

  if (this.length > 0) {
    return parseFloat(this.css('width'));
  }

  return null;
}
function outerWidth(includeMargins) {
  if (this.length > 0) {
    if (includeMargins) {
      // eslint-disable-next-line
      const styles = this.styles();
      return (
        this[0].offsetWidth +
        parseFloat(styles.getPropertyValue('margin-right')) +
        parseFloat(styles.getPropertyValue('margin-left'))
      );
    }
    return this[0].offsetWidth;
  }
  return null;
}
function height() {
  if (this[0] === window) {
    return window.innerHeight;
  }

  if (this.length > 0) {
    return parseFloat(this.css('height'));
  }

  return null;
}
function outerHeight(includeMargins) {
  if (this.length > 0) {
    if (includeMargins) {
      // eslint-disable-next-line
      const styles = this.styles();
      return (
        this[0].offsetHeight +
        parseFloat(styles.getPropertyValue('margin-top')) +
        parseFloat(styles.getPropertyValue('margin-bottom'))
      );
    }
    return this[0].offsetHeight;
  }
  return null;
}
function offset() {
  if (this.length > 0) {
    const el = this[0];
    const box = el.getBoundingClientRect();
    const body = document.body;
    const clientTop = el.clientTop || body.clientTop || 0;
    const clientLeft = el.clientLeft || body.clientLeft || 0;
    const scrollTop = el === window ? window.scrollY : el.scrollTop;
    const scrollLeft = el === window ? window.scrollX : el.scrollLeft;
    return {
      top: box.top + scrollTop - clientTop,
      left: box.left + scrollLeft - clientLeft,
    };
  }

  return null;
}
function hide() {
  for (let i = 0; i < this.length; i += 1) {
    this[i].style.display = 'none';
  }
  return this;
}
function show() {
  return this.each(function() {
    this.style.display === 'none' && (this.style.display = '');
    if (getComputedStyle(this, '').getPropertyValue('display') === 'none')
      this.style.display = 'block'; //defaultDisplay(this.nodeName)
  });
  /*
  for (let i = 0; i < this.length; i += 1) {
    const el = this[i];
    if (el.style.display === 'none') {
      el.style.display = '';
    }
    if (window.getComputedStyle(el, null).getPropertyValue('display') === 'none') {
      // Still not visible
      el.style.display = 'block';
    }
  }
  return this;
	*/
}
function styles() {
  if (this[0]) return window.getComputedStyle(this[0], null);
  return {};
}
function css(props, value) {
  let i;
  if (arguments.length === 1) {
    if (typeof props === 'string') {
      if (this[0])
        return window.getComputedStyle(this[0], null).getPropertyValue(props);
    } else {
      for (i = 0; i < this.length; i += 1) {
        // eslint-disable-next-line
        for (let prop in props) {
          this[i].style[prop] = props[prop];
        }
      }
      return this;
    }
  }
  if (arguments.length === 2 && typeof props === 'string') {
    for (i = 0; i < this.length; i += 1) {
      this[i].style[props] = value;
    }
    return this;
  }
  return this;
}

// Dom manipulation
function toArray() {
  const arr = [];
  for (let i = 0; i < this.length; i += 1) {
    arr.push(this[i]);
  }
  return arr;
}

function each(callback) {
  emptyArray.some.call(this, function(el, idx) {
    return callback.call(el, idx, el) === false;
  });
  return this;
}

function forEach(callback) {
  emptyArray.some.call(this, function(el, idx) {
    return callback.call(el, el, idx) === false;
  });
  return this;
}

/*
// Iterate over the collection passing elements to `callback`
function each(callback) {
  // Don't bother continuing without a callback
  if (!callback) return this;
  // Iterate over the current collection
  for (let i = 0; i < this.length; i += 1) {
    // If the callback returns false
    if (callback.call(this[i], i, this[i]) === false) {
      // End the loop early
      return this;
    }
  }
  // Return `this` to allow chained DOM operations
  return this;
}
function forEach(callback) {
  // Don't bother continuing without a callback
  if (!callback) return this;
  // Iterate over the current collection
  for (let i = 0; i < this.length; i += 1) {
    // If the callback returns false
    if (callback.call(this[i], this[i], i) === false) {
      // End the loop early
      return this;
    }
  }
  // Return `this` to allow chained DOM operations
  return this;
}
*/

function filter(callback) {
  const matchedItems = [];
  const dom = this;
  for (let i = 0; i < dom.length; i += 1) {
    if (callback.call(dom[i], i, dom[i])) matchedItems.push(dom[i]);
  }
  return new Dom(matchedItems);
}
function map(callback) {
  const modifiedItems = [];
  const dom = this;
  for (let i = 0; i < dom.length; i += 1) {
    modifiedItems.push(callback.call(dom[i], i, dom[i]));
  }
  return new Dom(modifiedItems);
}
// eslint-disable-next-line
function html(html) {
  if (typeof html === 'undefined') {
    return this[0] ? this[0].innerHTML : undefined;
  }

  for (let i = 0; i < this.length; i += 1) {
    this[i].innerHTML = html;
  }
  return this;
}
// eslint-disable-next-line
function text(text) {
  if (typeof text === 'undefined') {
    if (this[0]) {
      return this[0].textContent.trim();
    }
    return null;
  }

  for (let i = 0; i < this.length; i += 1) {
    this[i].textContent = text;
  }
  return this;
}

/**
 * 查看选择的元素是否匹配选择�
 */
function is(selector) {
  const el = this[0];
  let compareWith;
  let i;
  if (!el || typeof selector === 'undefined') return false;
  if (typeof selector === 'string') {
    if (el.matches) return el.matches(selector);
    else if (el.webkitMatchesSelector)
      return el.webkitMatchesSelector(selector);
    else if (el.msMatchesSelector) return el.msMatchesSelector(selector);

    compareWith = $(selector);
    for (i = 0; i < compareWith.length; i += 1) {
      if (compareWith[i] === el) return true;
    }
    return false;
  } else if (selector === document) return el === document;
  else if (selector === window) return el === window;

  if (selector.nodeType || selector instanceof Dom) {
    compareWith = selector.nodeType ? [selector] : selector;
    for (i = 0; i < compareWith.length; i += 1) {
      if (compareWith[i] === el) return true;
    }
    return false;
  }
  return false;
}
function indexOf(el) {
  for (let i = 0; i < this.length; i += 1) {
    if (this[i] === el) return i;
  }
  return -1;
}
function index() {
  let child = this[0];
  let i;
  if (child) {
    i = 0;
    // eslint-disable-next-line
    while ((child = child.previousSibling) !== null) {
      if (child.nodeType === 1) i += 1;
    }
    return i;
  }
  return undefined;
}

/**
 * 返回指定索引dom元素的Dom对象
 * @param {*} index
 */
function eq(index) {
  if (typeof index === 'undefined') return this;
  const length = this.length;
  let returnIndex;
  if (index > length - 1) {
    return new Dom([]);
  }
  if (index < 0) {
    returnIndex = length + index;
    if (returnIndex < 0) return new Dom([]);
    return new Dom([this[returnIndex]]);
  }
  return new Dom([this[index]]);
}
function append(...args) {
  let newChild;

  for (let k = 0; k < args.length; k += 1) {
    newChild = args[k];
    for (let i = 0; i < this.length; i += 1) {
      if (typeof newChild === 'string') {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = newChild;
        while (tempDiv.firstChild) {
          this[i].appendChild(tempDiv.firstChild);
        }
      } else if (newChild instanceof Dom) {
        for (let j = 0; j < newChild.length; j += 1) {
          this[i].appendChild(newChild[j]);
        }
      } else {
        this[i].appendChild(newChild);
      }
    }
  }

  return this;
}
// eslint-disable-next-line
function appendTo(parent) {
  $(parent).append(this);
  return this;
}
function prepend(newChild) {
  let i;
  let j;
  for (i = 0; i < this.length; i += 1) {
    if (typeof newChild === 'string') {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = newChild;
      for (j = tempDiv.childNodes.length - 1; j >= 0; j -= 1) {
        this[i].insertBefore(tempDiv.childNodes[j], this[i].childNodes[0]);
      }
    } else if (newChild instanceof Dom) {
      for (j = 0; j < newChild.length; j += 1) {
        this[i].insertBefore(newChild[j], this[i].childNodes[0]);
      }
    } else {
      this[i].insertBefore(newChild, this[i].childNodes[0]);
    }
  }
  return this;
}
// eslint-disable-next-line
function prependTo(parent) {
  $(parent).prepend(this);
  return this;
}
function insertBefore(selector) {
  const before = $(selector);
  for (let i = 0; i < this.length; i += 1) {
    if (before.length === 1) {
      before[0].parentNode.insertBefore(this[i], before[0]);
    } else if (before.length > 1) {
      for (let j = 0; j < before.length; j += 1) {
        before[j].parentNode.insertBefore(this[i].cloneNode(true), before[j]);
      }
    }
  }
}
function insertAfter(selector) {
  const after = $(selector);
  for (let i = 0; i < this.length; i += 1) {
    if (after.length === 1) {
      after[0].parentNode.insertBefore(this[i], after[0].nextSibling);
    } else if (after.length > 1) {
      for (let j = 0; j < after.length; j += 1) {
        after[j].parentNode.insertBefore(
          this[i].cloneNode(true),
          after[j].nextSibling
        );
      }
    }
  }
}
function next(selector) {
  if (this.length > 0) {
    if (selector) {
      if (
        this[0].nextElementSibling &&
        $(this[0].nextElementSibling).is(selector)
      ) {
        return new Dom([this[0].nextElementSibling]);
      }
      return new Dom([]);
    }

    if (this[0].nextElementSibling)
      return new Dom([this[0].nextElementSibling]);
    return new Dom([]);
  }
  return new Dom([]);
}
function nextAll(selector) {
  const nextEls = [];
  let el = this[0];
  if (!el) return new Dom([]);
  while (el.nextElementSibling) {
    const next = el.nextElementSibling; // eslint-disable-line
    if (selector) {
      if ($(next).is(selector)) nextEls.push(next);
    } else nextEls.push(next);
    el = next;
  }
  return new Dom(nextEls);
}
function prev(selector) {
  if (this.length > 0) {
    const el = this[0];
    if (selector) {
      if (
        el.previousElementSibling &&
        $(el.previousElementSibling).is(selector)
      ) {
        return new Dom([el.previousElementSibling]);
      }
      return new Dom([]);
    }

    if (el.previousElementSibling) return new Dom([el.previousElementSibling]);
    return new Dom([]);
  }
  return new Dom([]);
}
function prevAll(selector) {
  const prevEls = [];
  let el = this[0];
  if (!el) return new Dom([]);
  while (el.previousElementSibling) {
    const prev = el.previousElementSibling; // eslint-disable-line
    if (selector) {
      if ($(prev).is(selector)) prevEls.push(prev);
    } else prevEls.push(prev);
    el = prev;
  }
  return new Dom(prevEls);
}
function siblings(selector) {
  return this.nextAll(selector).add(this.prevAll(selector));
}

/**
 * 所有符合条件的父元�
 */
function parent(selector) {
  const parents = []; // eslint-disable-line
  for (let i = 0; i < this.length; i += 1) {
    if (this[i].parentNode !== null) {
      if (selector) {
        if ($(this[i].parentNode).is(selector))
          parents.push(this[i].parentNode);
      } else {
        parents.push(this[i].parentNode);
      }
    }
  }
  return $($.uniq(parents));
}

/**
 * 从当前元素的父元素开始沿 DOM 树向�?获得匹配选择器的所有祖先元素�
 */
function parents(selector) {
  const parents = []; // eslint-disable-line
  for (let i = 0; i < this.length; i += 1) {
    let parent = this[i].parentNode; // eslint-disable-line
    while (parent) {
      if (selector) {
        if ($(parent).is(selector)) parents.push(parent);
      } else {
        parents.push(parent);
      }
      parent = parent.parentNode;
    }
  }
  return $($.uniq(parents));
}

/**
 * 从当前元素开始沿 DOM 树向�?获得匹配选择器的第一个祖先元素�
 */
function closest(selector) {
  let closest = this; // eslint-disable-line
  if (typeof selector === 'undefined') {
    return new Dom([]);
  }
  if (!closest.is(selector)) {
    closest = closest.parents(selector).eq(0);
  }
  return closest;
}

/**
 * 后代中所有适合选择器的元素
 * @param {*} selector
 */
function find(selector) {
  const foundElements = [];
  for (let i = 0; i < this.length; i += 1) {
    const found = this[i].querySelectorAll(selector);
    for (let j = 0; j < found.length; j += 1) {
      foundElements.push(found[j]);
    }
  }
  return new Dom(foundElements);
}

/**
 * 返回被选元素的所有直接子元素，不包括文本节点
 * @param {*} selector
 */
function children(selector) {
  const children = []; // eslint-disable-line
  for (let i = 0; i < this.length; i += 1) {
    const childNodes = this[i].childNodes;

    for (let j = 0; j < childNodes.length; j += 1) {
      if (!selector) {
        if (childNodes[j].nodeType === 1) children.push(childNodes[j]);
      } else if (
        childNodes[j].nodeType === 1 &&
        $(childNodes[j]).is(selector)
      ) {
        children.push(childNodes[j]);
      }
    }
  }
  return new Dom($.uniq(children));
}

function remove() {
  for (let i = 0; i < this.length; i += 1) {
    if (this[i].parentNode) this[i].parentNode.removeChild(this[i]);
  }
  return this;
}
function detach() {
  return this.remove();
}

function add(...args) {
  const dom = this;
  let i;
  let j;
  for (i = 0; i < args.length; i += 1) {
    const toAdd = $(args[i]);
    for (j = 0; j < toAdd.length; j += 1) {
      dom[dom.length] = toAdd[j];
      dom.length += 1;
    }
  }
  return dom;
}

function empty() {
  for (let i = 0; i < this.length; i += 1) {
    const el = this[i];
    if (el.nodeType === 1) {
      for (let j = 0; j < el.childNodes.length; j += 1) {
        if (el.childNodes[j].parentNode) {
          el.childNodes[j].parentNode.removeChild(el.childNodes[j]);
        }
      }
      el.textContent = '';
    }
  }
  return this;
}

/**
 * 是否包含子元素，不含文本节点
 */
function hasChild() {
  if (!this.dom) return false;
  return this.dom.children.length > 0;
}

/**
 * 第一个子元素节点，不含文本节�
 */
function firstChild() {
  if (!this.dom || this.dom.children.length === 0) return null;
  return this.dom.children[0];
}

/**
 * 下一个元素节点，不含文本节点
 */
function nextNode() {
  let R = null;
  if (!this.dom || this.dom.children.length === 0) return null;

  let nd = this.dom.nextSibling;
  while (nd) {
    if (nd.nodeType === 1) {
      // 元素节点
      R = nd;
      break;
    }
    nd = this.dom.nextSibling;
  }
  return R;
}

/**
 * 最后一个子元素节点，不含文本节�
 */
function lastChild() {
  if (!this.dom || this.dom.children.length === 0) return null;
  return this.dom.children[this.dom.children.length - 1];
}

/**
 * 元素子节点数量，不含文本节点
 */
function childCount() {
  if (!this.dom) return 0;
  return this.dom.children.length;
}

/**
 * 返回的上级节点名称的元素节点，可用closest替代
 * ff parentNode 会返�?�?节点
 * ff textNode节点 没有 tagName
 */
function upperTag(tag) {
  let RC = null;

  if (!this.dom) return null;

  const tg = tag.toUpperCase();

  let nd = this.dom;
  while (nd) {
    if (nd.tagName && nd.tagName.toUpperCase() === tg) {
      RC = nd;
      break;
    }
    nd = nd.parentNode;
  }
  return RC;
}

/**
 * 获取 指定 tagName的直接子元素，不含文本节点，可用 child替代
 * @param tag
 * @returns {*}
 */
function childTag(tag) {
  let RC = null;

  if (!this.dom) return null;

  try {
    for (let i = 0, len = this.dom.children.length; i < len; i++) {
      const nd = this.dom.children[i];

      if (nd.tagName && nd.tagName.toUpperCase() === tag.toUpperCase()) {
        RC = nd;
        break;
      }
    }
  } catch (e) {
    alert(`childTag exp:${e.message}`);
  }

  return RC;
}

/**
 * 光标放入尾部
 * @param el
 */
function cursorEnd() {
  if (!this.dom) return null;

  const el = this.dom;
  el.focus();

  if (
    typeof window.getSelection !== 'undefined' &&
    typeof document.createRange !== 'undefined'
  ) {
    const rg = document.createRange();
    rg.selectNodeContents(el);
    // 合并光标
    rg.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(rg);
  } else if (typeof document.body.createTextRangrge !== 'undefined') {
    const rg = document.body.createTextRange();
    rg.moveToElementText(el);
    // 合并光标
    rg.collapse(false);
    // textRange.moveStart('character', 3);
    rg.select();
  }
}

/**
 * 获取光标位置
 * @returns {number}
 */
function getCursorPos() {
  let R = 0;

  if (!this.dom) return 0;

  const el = this.dom;

  // obj.focus();
  if (el.selectionStart) {
    // IE以外
    R = el.selectionStart;
  } else {
    // IE
    let rg = null;
    if (el.tagName.toLowerCase() === 'textarea') {
      // TEXTAREA
      rg = event.srcElement.createTextRange();
      rg.moveToPoint(event.x, event.y);
    } else {
      // Text
      rg = document.selection.createRange();
    }
    rg.moveStart('character', -event.srcElement.value.length);
    // rg.setEndPoint("StartToStart", obj.createTextRange())
    R = rg.text.length;
  }
  return R;
}

/**
 * 得到光标的位�
 */
function getCursorPosition() {
  if (!this.dom) return 0;

  const el = this.dom;

  const qswh = '@#%#^&#*$';
  // obj.focus();
  const rng = document.selection.createRange();
  rng.text = qswh;
  const nPosition = el.value.indexOf(qswh);
  rng.moveStart('character', -qswh.length);
  rng.text = '';
  return nPosition;
}

/**
 * 设置光标位置
 */
function setCursorPos(pos) {
  if (!this.dom) return;

  const rg = this.dom.createTextRange();
  rg.collapse(true);
  rg.moveStart('character', pos);
  rg.select();
}

/**
 * 移到第一�
 */
function moveFirst() {
  this.rowindex = 0;
}

/**
 * querySelector
 * return only first
 */
function qu(sel) {
  return $(this.dom?.querySelector(sel));
}

function qus(sel) {
  return $(sel, this.dom);
}

/**
 * querySelector name
 * return only first
 */
function qn(name) {
  return $(this.dom?.querySelector(`[name=${name}]`));
}

function qns(name) {
  return $(`[name=${name}]`, this.dom);
}

/**
 * querySelector attribute
 * return only first
 */
function qa(name, v) {
  return $(this.dom?.querySelector(`[${name}=${v}]`));
}

function qas(name, v) {
  return $(`[${name}=${v}]`, this.dom);
}

/**
 * querySelector ClassName
 * cls: 'aaa bbb'
 * return only first
 */
function qc(cls) {
  let R = this.dom?.getElementsByClassName(cls);
  if (R) R = R[0];

  return $(R);
}

function qcs(cls) {
  let R = this.dom?.getElementsByClassName(cls);
  if (R && R.length > 0) R = [].slice.call(R);
  else return (R = []);

  return new Dom(R);
}

/**
 * querySelector TagName
 * tag: 'div'
 * return only first
 */
function qt(tag) {
  let R = this.dom?.getElementsByTagName(tag);
  if (R) R = R[0];

  return $(R);
}

function qts(tag) {
  let R = this.dom?.getElementsByTagName(tag);
  if (R && R.length > 0) R = [].slice.call(R);
  else return (R = []);

  return new Dom(R);
}

export {
  ready,
  attr,
  hasAttr,
  removeAttr,
  prop,
  data,
  removeData,
  dataset,
  val,
  transform,
  transition,
  on,
  off,
  once,
  trigger,
  transitionEnd,
  animationEnd,
  width,
  outerWidth,
  height,
  outerHeight,
  offset,
  hide,
  show,
  styles,
  css,
  toArray,
  each,
  forEach,
  filter,
  map,
  html,
  text,
  is,
  indexOf,
  index,
  eq,
  append,
  appendTo,
  prepend,
  prependTo,
  insertBefore,
  insertAfter,
  next,
  nextAll,
  prev,
  prevAll,
  siblings,
  parent,
  parents,
  closest,
  qu,
  qn,
  qn as name,
  qa,
  qt,
  qt as tag,
  qc,
  qus,
  qns,
  qns as names,
  qas,
  qts,
  qts as tags,
  qcs,
  find,
  hasChild,
  children,
  firstChild,
  lastChild,
  nextNode,
  childCount,
  upperTag,
  childTag,
  cursorEnd,
  getCursorPos,
  getCursorPosition,
  setCursorPos,
  moveFirst,
  remove,
  detach,
  add,
  empty,
};
