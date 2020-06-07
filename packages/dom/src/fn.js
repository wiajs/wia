/*!
 * Expand $.fn
 * 扩展 $.fn
 * same syntax as well known jQuery library
 */

const {Dom} = window.$;

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

function hasAttr(name) {
  return emptyArray.some.call(this, function (el) {
    return el.hasAttribute(name);
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

// 读取或设置 data-* 属性值，保持与jQuery 兼容
// 在dom节点上自定义 domElementDataStorage 对象存储数据
function data(key, value) {
  let R;
  let el;
  const attrName = 'data-' + key.replace(/([A-Z])/g, '-$1').toLowerCase();

  if (typeof value === 'undefined') {
    el = this[0];
    // Get value
    if (el) {
      if (el.domElementDataStorage && key in el.domElementDataStorage) {
        R = el.domElementDataStorage[key];
      } else R = this.attr(attrName);
      }
    if (R) R = $.deserializeValue(R);
  } else {
  // Set value
  for (let i = 0; i < this.length; i += 1) {
    el = this[i];
    if (!el.domElementDataStorage) el.domElementDataStorage = {};
    el.domElementDataStorage[key] = value;
      this.attr(attrName, value);
  }
    R = this;
  }

  return R;
}

function removeData(key) {
  const attrName = 'data-' + key.replace(/([A-Z])/g, '-$1').toLowerCase();

  for (let i = 0; i < this.length; i += 1) {
    const el = this[i];
    if (el.domElementDataStorage && el.domElementDataStorage[key]) {
      el.domElementDataStorage[key] = null;
      delete el.domElementDataStorage[key];
    }
    el.removeAttribute(attrName);
  }

  return this;
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
  for (const key in dataset) dataset[key] = $.deserializeValue(dataset[key]);

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

  // on 函数内共享闭包变量
  let touchStartX;
  let touchStartY;
  function touchStart(ev) {
    // ev.preventDefault();
    touchStartX = ev.changedTouches[0].clientX;
    touchStartY = ev.changedTouches[0].clientY;
  }

  function touchEnd(ev) {
    const x = Math.abs(ev.changedTouches[0].clientX - touchStartX);
    const y = Math.abs(ev.changedTouches[0].clientY - touchStartY);
    // console.log('dom touchEnd', {x, y});
    if (x <= 5 && y <= 5) {
      // ev.preventDefault(); // 不阻止后续的 onclick 事件
			return clickEvent.call(this, ev);
		}
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

// 兼容 jQuery，dom7 是错误的 
function offset(coordinates) {
  if (coordinates)
    return this.each(function (index) {
		var $this = $(this),
				coords = $.funcArg(this, coordinates, index, $this.offset()),
				parentOffset = $this.offsetParent().offset(),
				props = {
					top:  coords.top  - parentOffset.top,
          left: coords.left - parentOffset.left,
        };

      if ($this.css('position') == 'static') props['position'] = 'relative';
      $this.css(props);
    });
  if (!this.length) return null;
  if (
    document.documentElement !== this[0] &&
    !$.contains(document.documentElement, this[0])
  )
    return {top: 0, left: 0};
  var obj = this[0].getBoundingClientRect();
    return {
		left: obj.left + window.pageXOffset,
		top: obj.top + window.pageYOffset,
		width: Math.round(obj.width),
    height: Math.round(obj.height),
  };
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
  const REGEXP_SUFFIX = /^width|height|left|top|marginLeft|marginTop|paddingLeft|paddingTop$/;

  let i;
  if (arguments.length === 1) {
    if (typeof props === 'string') {
      if (this[0])
        return window.getComputedStyle(this[0], null).getPropertyValue(props);
    } else {
      for (i = 0; i < this.length; i += 1) {
        // eslint-disable-next-line
        for (let prop in props) {
          let val = props[prop];
          if (REGEXP_SUFFIX.test(prop) && $.isNumber(val)) val = `${val}px`;

          this[i].style[prop] = val;
        }
      }
      return this;
    }
  }
  if (arguments.length === 2 && typeof props === 'string') {
    for (i = 0; i < this.length; i += 1) {
      let val = value;
      if (REGEXP_SUFFIX.test(props) && $.isNumber(val)) val = `${val}px`;

      this[i].style[props] = val;
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

function some(callback) {
  return emptyArray.some.call(this, function (el, idx) {
    return callback.call(el, el, idx);
  });
}

function every(callback) {
  return emptyArray.every.call(this, function (el, idx) {
    return callback.call(el, el, idx);
  });
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
 * 查看选择的元素是否匹配选择器
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
  const {length} = this;
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

// 添加参数节点到当前节点的最后
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
          tempDiv.removeChild(tempDiv.firstChild);
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
function insertChild(el, ch) {
  if (el.children.length) el.insertBefore(ch, el.children[0]);
  else el.appendChild(ch);
}
// 添加参数节点到当节点的最前
function insert(...args) {
  let newChild;

  for (let k = 0; k < args.length; k += 1) {
    newChild = args[k];
    for (let i = 0; i < this.length; i += 1) {
      if (typeof newChild === 'string') {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = newChild;
        while (tempDiv.lastChild) {
          insertChild(this[i], tempDiv.lastChild);
          tempDiv.removeChild(tempDiv.lastChild);
        }
      } else if (newChild instanceof Dom) {
        for (let j = 0; j < newChild.length; j += 1) {
          insertChild(this[i], newChild[j]);
        }
      } else {
        insertChild(this[i], newChild);
      }
    }
  }

  return this;
}

// 添加当前节点到参数节点的最后
function appendTo(el) {
  $(el).append(this);
  return this;
}

// 添加当前节点到参数节点的最前
function insertTo(el) {
  $(el).insert(this);
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

/**
 * 插入到参数节点前面
 */
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

  return this;
}

/**
 * 插入到参数节点后面
 */
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

  return this;
}

/**
 * 同级后节点，如果符合条件返回节点，不符合条件，返回空节点，不含文本节点
 */
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

/**
 * 同级向后查找符合条件的第一个元素节点，不含文本节点
 */
function nextNode(selector) {
  const nextEls = [];
  let el = this[0];
  if (!el) return new Dom([]);
	
  let next = el.nextElementSibling; // eslint-disable-line
  while (next) {
    if (selector) {
      if ($(next).is(selector)) {
				nextEls.push(next);
				break;
			}
    } else {
			nextEls.push(next);
			break;
		}
    next = next.nextElementSibling;
  }
  return new Dom(nextEls);
}

/**
 * 同级向前查找所有符合条件的元素节点，不含文本节点
 */
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

/**
 * 同级前节点，如果符合条件返回节点，不符合条件，返回空节点，不含文本节点
 */
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

/**
 * 同级向前查找符合条件的第一个元素节点，不含文本节点
 */
function prevNode(selector) {
  const prevEls = [];
  let el = this[0];
  if (!el) return new Dom([]);
	
  let prev = el.previousElementSibling; // eslint-disable-line
  while (prev) {
    if (selector) {
      if ($(prev).is(selector)) {
				prevEls.push(prev);
				break;
			}
    } else {
			prevEls.push(prev);
			break;
		}
    prev = prev.previousElementSibling;
  }
  return new Dom(prevEls);
}

/**
 * 同级向前查找所有符合条件的元素节点，不含文本节点
 */
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

/**
 * 同级前后所有兄弟元素节点，不含文本节点
 */
function siblings(selector) {
  return this.nextAll(selector).add(this.prevAll(selector));
}

/**
 * 所有dom符合条件的父元素
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
 * 从当前元素的父元素开始沿 DOM 树向上,获得匹配选择器的所有祖先元素。
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
 * 从当前元素的父元素开始沿 DOM 树向上,获得匹配选择器的第一个祖先元素。
 * 选择器为空，则返回 空
 */
function parentNode(selector) {
  const parents = []; // eslint-disable-line

  if (typeof selector === 'undefined') return new Dom([]);

  for (let i = 0; i < this.length; i += 1) {
    let parent = this[i].parentNode; // eslint-disable-line
    while (parent) {
      if ($(parent).is(selector)) {
        parents.push(parent);
        break;
      }

      parent = parent.parentNode;
    }
  }
  return $($.uniq(parents));
}

/**
 * 从当前元素开始沿 DOM 树向上,获得匹配选择器的第一个祖先元素。
 * 选择器为空，则返回 空
 */
function closest(selector) {
  let closest = this; // eslint-disable-line
  if (typeof selector === 'undefined') return new Dom([]);

  if (!closest.is(selector)) {
    const parents = []; // eslint-disable-line

    for (let i = 0; i < this.length; i += 1) {
      let parent = this[i].parentNode; // eslint-disable-line
      while (parent) {
        const n = $(parent);
        if (n.is(selector)) return n;

        parent = parent.parentNode;
      }
    }

    return new Dom([]);
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
 * 后代中单个适合选择器的元素
 * @param {*} selector
 */
function findNode(selector) {
  const foundElements = [];
  for (let i = 0; i < this.length; i += 1) {
    const found = this[i].querySelector(selector);
    foundElements.push(found);
  }
  return new Dom(foundElements);
}

/**
 * 返回所有dom的所有符合条件的直接子元素，不包括文本节点
 * @param {*} selector
 */
function children(selector) {
  const cs = []; // eslint-disable-line
  for (let i = 0; i < this.length; i += 1) {
    const childs = this[i].children;

    for (let j = 0; j < childs.length; j += 1) {
      if (!selector) {
        cs.push(childs[j]);
      } else if ($(childs[j]).is(selector)) cs.push(childs[j]);
    }
  }
  return new Dom($.uniq(cs));
}

/**
 * 返回被选元素的第一个符合条件子元素，不包括文本节点
 * @param {*} selector
 */
function childNode(selector) {
  const cs = []; // eslint-disable-line
  for (let i = 0; i < this.length; i += 1) {
    const childs = this[i].children;

    for (let j = 0; j < childs.length; j += 1) {
      if (!selector) {
        cs.push(childs[j]);
        break;
      } else if ($(childs[j]).is(selector)) {
        cs.push(childs[j]);
        break;
      }
    }
  }
  return new Dom($.uniq(cs));
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
 * 第一个子元素节点，不含文本节点
 */
function firstChild() {
  if (!this.dom || this.dom.children.length === 0) return null;
  return this.dom.children[0];
}

/**
 * 最后一个子元素节点，不含文本节点
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
 * 得到光标的位置
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
 * 移到第一行
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
  else R = [];

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
  else R = [];

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
	some,
	every,
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
  insert,
  insertTo,
  prepend,
  prependTo,
  insertBefore,
  insertAfter,
  next,
	nextNode,
  nextAll,
  prev,
	prevNode,
  prevAll,
  siblings,
  parent,
  parentNode,
  parents,
  closest,
  qu,
  qus,
  qn,
  qns,
  qa,
  qas,
  qt,
  qts,
  qc,
  qcs,
  qa as att,
  qas as atts,
  qn as name,
  qns as names,
  qt as tag,
  qts as tags,
  qc as class,
  qcs as classes,
  find,
  findNode,
  hasChild,
  children,
  childNode,
  firstChild,
  lastChild,
  childCount,
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
