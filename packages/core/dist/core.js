/*!
  * wia core v0.1.1
  * (c) 2020 Sibyl Yu
  * @license MIT
  */
/**
 * promise version ajax get、post
 * return Promise objext.
 * get move to base.js
 */
class Ajax {
  post(url, data) {
    const pm = new Promise((res, rej) => {
      const xhr = $.getXhr();

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) res(xhr.responseText);else rej(new Error(xhr.statusText), xhr.responseText);
        }
        /*
          if ((xhr.readyState === 4) && (xhr.status === 200)) {
            cb(xhr.responseText);
          }
        */

      }; // 异步 post,回调通知


      xhr.open('POST', url, true);
      let param = data;
      if (typeof data === 'object') param = objToParam(data); // 发送 FormData 数据, 会自动设置为 multipart/form-data

      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); // xhr.setRequestHeader('Content-Type', 'multipart/form-data; boundary=AaB03x');
      // alert(param);

      xhr.send(param);
    });
    return pm;
  }
  /**
   * xmlHttpRequest POST 方法
   * 发送 FormData 数据, 会自动设置为 multipart/form-data
   * 其他数据,应该是 application/x-www-form-urlencoded
   * @param url post的url地址
   * @param data 要post的数据
   * @param cb 回调
   */


  postForm(url, data) {
    const pm = new Promise((res, rej) => {
      const xhr = $.getXhr();

      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) res(null, xhr.responseText);else rej(new Error(xhr.status), xhr.responseText);
        }
      }; // 异步 post,回调通知


      xhr.open('POST', url, true); // 发送 FormData 数据, 会自动设置为 multipart/form-data
      // xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      // xhr.setRequestHeader('Content-Type', 'multipart/form-data; boundary=AaB03x');

      xhr.send(data);
    });
    return pm;
  }

  get(url, param) {
    return $.get(url, param);
  }

}

function objToParam(obj) {
  let rs = '';
  const arr = [];

  for (const k in obj) {
    if (obj.hasOwnProperty(k)) {
      arr.push(`${k}=${obj[k]}`);
    } // rs += `${k}=${obj[k]}&`;

  } // 排序


  rs = arr.sort().join('&'); // alert(rs);

  return rs;
}

/**
 * Dom 操作常用函数，从 Zepto 和 Dom7 中摘录
 * http://www.wia.pub/dom
 *
 * @license MIT
 * Released on: March 5, 2020
 */
const {
  Dom
} = $;
const emptyArray = [];

function attr(attrs, value) {
  if (arguments.length === 1 && typeof attrs === 'string') {
    // Get attr
    if (this[0]) return this[0].getAttribute(attrs);
    return undefined;
  } // Set attrs


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
} // eslint-disable-next-line


function removeAttr(attr) {
  for (let i = 0; i < this.length; i += 1) {
    this[i].removeAttribute(attr);
  }

  return this;
} // eslint-disable-next-line


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
    el = this[0]; // Get value

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
  } // Set value


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
  } // eslint-disable-next-line


  for (const key in dataset) {
    if (dataset[key] === 'false') dataset[key] = false;else if (dataset[key] === 'true') dataset[key] = true;else if (parseFloat(dataset[key]) === dataset[key] * 1) dataset[key] *= 1;
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

    if (Array.isArray(value) && el.multiple && el.nodeName.toLowerCase() === 'select') {
      for (let j = 0; j < el.options.length; j += 1) {
        el.options[j].selected = value.indexOf(el.options[j].value) >= 0;
      }
    } else {
      el.value = value;
    }
  }

  return dom;
} // Transforms
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
} // Events


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

    if ($(target).is(targetSelector)) listener.apply(target, eventData);else {
      const parents = $(target).parents(); // eslint-disable-line

      for (let k = 0; k < parents.length; k += 1) {
        if ($(parents[k]).is(targetSelector)) listener.apply(parents[k], eventData);
      }
    }
  }

  function handleEvent(e) {
    const eventData = e && e.target ? e.target.domEventData || [] : [];

    if (eventData.indexOf(e) < 0) {
      eventData.unshift(e);
    }

    listener.apply(this, eventData);
  }

  const events = eventType.split(' ');
  let j;

  for (let i = 0; i < this.length; i += 1) {
    const el = this[i];

    if (!targetSelector) {
      for (j = 0; j < events.length; j += 1) {
        const event = events[j];
        if (!el.domListeners) el.domListeners = {};
        if (!el.domListeners[event]) el.domListeners[event] = [];
        el.domListeners[event].push({
          listener,
          proxyListener: handleEvent
        });
        el.addEventListener(event, handleEvent, capture);
      }
    } else {
      // Live events
      for (j = 0; j < events.length; j += 1) {
        const event = events[j];
        if (!el.domLiveListeners) el.domLiveListeners = {};
        if (!el.domLiveListeners[event]) el.domLiveListeners[event] = [];
        el.domLiveListeners[event].push({
          listener,
          proxyListener: handleLiveEvent
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
    const event = events[i];

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
          const handler = handlers[k];

          if (listener && handler.listener === listener) {
            el.removeEventListener(event, handler.proxyListener, capture);
            handlers.splice(k, 1);
          } else if (listener && handler.listener && handler.listener.domproxy && handler.listener.domproxy === listener) {
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
          cancelable: true
        });
      } catch (e) {
        evt = document.createEvent('Event');
        evt.initEvent(event, true, true);
        evt.detail = eventData;
      } // eslint-disable-next-line


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
} // Sizing/Styles


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
      return this[0].offsetWidth + parseFloat(styles.getPropertyValue('margin-right')) + parseFloat(styles.getPropertyValue('margin-left'));
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
      return this[0].offsetHeight + parseFloat(styles.getPropertyValue('margin-top')) + parseFloat(styles.getPropertyValue('margin-bottom'));
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
      left: box.left + scrollLeft - clientLeft
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
  return this.each(function () {
    this.style.display === "none" && (this.style.display = '');
    if (getComputedStyle(this, '').getPropertyValue("display") === "none") this.style.display = 'block'; //defaultDisplay(this.nodeName)
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
      if (this[0]) return window.getComputedStyle(this[0], null).getPropertyValue(props);
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
} // Dom manipulation


function toArray() {
  const arr = [];

  for (let i = 0; i < this.length; i += 1) {
    arr.push(this[i]);
  }

  return arr;
}

function each(callback) {
  emptyArray.some.call(this, function (el, idx) {
    return callback.call(el, idx, el) === false;
  });
  return this;
}

function forEach(callback) {
  emptyArray.some.call(this, function (el, idx) {
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
} // eslint-disable-next-line


function html(html) {
  if (typeof html === 'undefined') {
    return this[0] ? this[0].innerHTML : undefined;
  }

  for (let i = 0; i < this.length; i += 1) {
    this[i].innerHTML = html;
  }

  return this;
} // eslint-disable-next-line


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

function is(selector) {
  const el = this[0];
  let compareWith;
  let i;
  if (!el || typeof selector === 'undefined') return false;

  if (typeof selector === 'string') {
    if (el.matches) return el.matches(selector);else if (el.webkitMatchesSelector) return el.webkitMatchesSelector(selector);else if (el.msMatchesSelector) return el.msMatchesSelector(selector);
    compareWith = $(selector);

    for (i = 0; i < compareWith.length; i += 1) {
      if (compareWith[i] === el) return true;
    }

    return false;
  } else if (selector === document) return el === document;else if (selector === window) return el === window;

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
    i = 0; // eslint-disable-next-line

    while ((child = child.previousSibling) !== null) {
      if (child.nodeType === 1) i += 1;
    }

    return i;
  }

  return undefined;
} // eslint-disable-next-line


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
} // eslint-disable-next-line


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
} // eslint-disable-next-line


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
        after[j].parentNode.insertBefore(this[i].cloneNode(true), after[j].nextSibling);
      }
    }
  }
}

function next(selector) {
  if (this.length > 0) {
    if (selector) {
      if (this[0].nextElementSibling && $(this[0].nextElementSibling).is(selector)) {
        return new Dom([this[0].nextElementSibling]);
      }

      return new Dom([]);
    }

    if (this[0].nextElementSibling) return new Dom([this[0].nextElementSibling]);
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
      if (el.previousElementSibling && $(el.previousElementSibling).is(selector)) {
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

function parent(selector) {
  const parents = []; // eslint-disable-line

  for (let i = 0; i < this.length; i += 1) {
    if (this[i].parentNode !== null) {
      if (selector) {
        if ($(this[i].parentNode).is(selector)) parents.push(this[i].parentNode);
      } else {
        parents.push(this[i].parentNode);
      }
    }
  }

  return $($.uniq(parents));
}

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

function hasChild() {
  if (!this.dom) return false;
  return this.dom.children.length > 0;
}

function children(selector) {
  const children = []; // eslint-disable-line

  for (let i = 0; i < this.length; i += 1) {
    const childNodes = this[i].childNodes;

    for (let j = 0; j < childNodes.length; j += 1) {
      if (!selector) {
        if (childNodes[j].nodeType === 1) children.push(childNodes[j]);
      } else if (childNodes[j].nodeType === 1 && $(childNodes[j]).is(selector)) {
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

var Methods =
/*#__PURE__*/
Object.freeze({
  attr: attr,
  removeAttr: removeAttr,
  prop: prop,
  data: data,
  removeData: removeData,
  dataset: dataset,
  val: val,
  transform: transform,
  transition: transition,
  on: on,
  off: off,
  once: once,
  trigger: trigger,
  transitionEnd: transitionEnd,
  animationEnd: animationEnd,
  width: width,
  outerWidth: outerWidth,
  height: height,
  outerHeight: outerHeight,
  offset: offset,
  hide: hide,
  show: show,
  styles: styles,
  css: css,
  toArray: toArray,
  each: each,
  forEach: forEach,
  filter: filter,
  map: map,
  html: html,
  text: text,
  is: is,
  indexOf: indexOf,
  index: index,
  eq: eq,
  append: append,
  appendTo: appendTo,
  prepend: prepend,
  prependTo: prependTo,
  insertBefore: insertBefore,
  insertAfter: insertAfter,
  next: next,
  nextAll: nextAll,
  prev: prev,
  prevAll: prevAll,
  siblings: siblings,
  parent: parent,
  parents: parents,
  closest: closest,
  find: find,
  hasChild: hasChild,
  children: children,
  remove: remove,
  detach: detach,
  add: add,
  empty: empty
});

function scrollTo(...args) {
  let [left, top, duration, easing, callback] = args;

  if (args.length === 4 && typeof easing === 'function') {
    callback = easing;
    [left, top, duration, callback, easing] = args;
  }

  if (typeof easing === 'undefined') easing = 'swing';
  return this.each(function animate() {
    const el = this;
    let currentTop;
    let currentLeft;
    let maxTop;
    let maxLeft;
    let newTop;
    let newLeft;
    let scrollTop; // eslint-disable-line

    let scrollLeft; // eslint-disable-line

    let animateTop = top > 0 || top === 0;
    let animateLeft = left > 0 || left === 0;

    if (typeof easing === 'undefined') {
      easing = 'swing';
    }

    if (animateTop) {
      currentTop = el.scrollTop;

      if (!duration) {
        el.scrollTop = top;
      }
    }

    if (animateLeft) {
      currentLeft = el.scrollLeft;

      if (!duration) {
        el.scrollLeft = left;
      }
    }

    if (!duration) return;

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
      const easeProgress = easing === 'linear' ? progress : 0.5 - Math.cos(progress * Math.PI) / 2;
      let done;
      if (animateTop) scrollTop = currentTop + easeProgress * (newTop - currentTop);
      if (animateLeft) scrollLeft = currentLeft + easeProgress * (newLeft - currentLeft);

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
} // scrollTop(top, duration, easing, callback) {


function scrollTop(...args) {
  let [top, duration, easing, callback] = args;

  if (args.length === 3 && typeof easing === 'function') {
    [top, duration, callback, easing] = args;
  }

  const dom = this;

  if (typeof top === 'undefined') {
    if (dom.length > 0) return dom[0].scrollTop;
    return null;
  }

  return dom.scrollTo(undefined, top, duration, easing, callback);
}

function scrollLeft(...args) {
  let [left, duration, easing, callback] = args;

  if (args.length === 3 && typeof easing === 'function') {
    [left, duration, callback, easing] = args;
  }

  const dom = this;

  if (typeof left === 'undefined') {
    if (dom.length > 0) return dom[0].scrollLeft;
    return null;
  }

  return dom.scrollTo(left, undefined, duration, easing, callback);
}

var Scroll =
/*#__PURE__*/
Object.freeze({
  scrollTo: scrollTo,
  scrollTop: scrollTop,
  scrollLeft: scrollLeft
});

function animate(initialProps, initialParams) {
  const els = this;
  const a = {
    props: Object.assign({}, initialProps),
    params: Object.assign({
      duration: 300,
      easing: 'swing' // or 'linear'

      /* Callbacks
      begin(elements)
      complete(elements)
      progress(elements, complete, remaining, start, tweenValue)
      */

    }, initialParams),
    elements: els,
    animating: false,
    que: [],

    easingProgress(easing, progress) {
      if (easing === 'swing') {
        return 0.5 - Math.cos(progress * Math.PI) / 2;
      }

      if (typeof easing === 'function') {
        return easing(progress);
      }

      return progress;
    },

    stop() {
      if (a.frameId) {
        $.cancelAnimationFrame(a.frameId);
      }

      a.animating = false;
      a.elements.each((index, el) => {
        const element = el;
        delete element.dom7AnimateInstance;
      });
      a.que = [];
    },

    done(complete) {
      a.animating = false;
      a.elements.each((index, el) => {
        const element = el;
        delete element.domAnimateInstance;
      });
      if (complete) complete(els);

      if (a.que.length > 0) {
        const que = a.que.shift();
        a.animate(que[0], que[1]);
      }
    },

    animate(props, params) {
      if (a.animating) {
        a.que.push([props, params]);
        return a;
      }

      const elements = []; // Define & Cache Initials & Units

      a.elements.each((index, el) => {
        let initialFullValue;
        let initialValue;
        let unit;
        let finalValue;
        let finalFullValue;
        if (!el.dom7AnimateInstance) a.elements[index].domAnimateInstance = a;
        elements[index] = {
          container: el
        };
        Object.keys(props).forEach(prop => {
          initialFullValue = window.getComputedStyle(el, null).getPropertyValue(prop).replace(',', '.');
          initialValue = parseFloat(initialFullValue);
          unit = initialFullValue.replace(initialValue, '');
          finalValue = parseFloat(props[prop]);
          finalFullValue = props[prop] + unit;
          elements[index][prop] = {
            initialFullValue,
            initialValue,
            unit,
            finalValue,
            finalFullValue,
            currentValue: initialValue
          };
        });
      });
      let startTime = null;
      let time;
      let elementsDone = 0;
      let propsDone = 0;
      let done;
      let began = false;
      a.animating = true;

      function render() {
        time = new Date().getTime();
        let progress;
        let easeProgress; // let el;

        if (!began) {
          began = true;
          if (params.begin) params.begin(els);
        }

        if (startTime === null) {
          startTime = time;
        }

        if (params.progress) {
          // eslint-disable-next-line
          params.progress(els, Math.max(Math.min((time - startTime) / params.duration, 1), 0), startTime + params.duration - time < 0 ? 0 : startTime + params.duration - time, startTime);
        }

        elements.forEach(element => {
          const el = element;
          if (done || el.done) return;
          Object.keys(props).forEach(prop => {
            if (done || el.done) return;
            progress = Math.max(Math.min((time - startTime) / params.duration, 1), 0);
            easeProgress = a.easingProgress(params.easing, progress);
            const {
              initialValue,
              finalValue,
              unit
            } = el[prop];
            el[prop].currentValue = initialValue + easeProgress * (finalValue - initialValue);
            const currentValue = el[prop].currentValue;

            if (finalValue > initialValue && currentValue >= finalValue || finalValue < initialValue && currentValue <= finalValue) {
              el.container.style[prop] = finalValue + unit;
              propsDone += 1;

              if (propsDone === Object.keys(props).length) {
                el.done = true;
                elementsDone += 1;
              }

              if (elementsDone === elements.length) {
                done = true;
              }
            }

            if (done) {
              a.done(params.complete);
              return;
            }

            el.container.style[prop] = currentValue + unit;
          });
        });
        if (done) return; // Then call

        a.frameId = $.requestAnimationFrame(render);
      }

      a.frameId = $.requestAnimationFrame(render);
      return a;
    }

  };

  if (a.elements.length === 0) {
    return els;
  }

  let animateInstance;

  for (let i = 0; i < a.elements.length; i += 1) {
    if (a.elements[i].domAnimateInstance) {
      animateInstance = a.elements[i].domAnimateInstance;
    } else a.elements[i].domAnimateInstance = a;
  }

  if (!animateInstance) {
    animateInstance = a;
  }

  if (initialProps === 'stop') {
    animateInstance.stop();
  } else {
    animateInstance.animate(a.props, a.params);
  }

  return els;
}

function stop() {
  const els = this;

  for (let i = 0; i < els.length; i += 1) {
    if (els[i].domAnimateInstance) {
      els[i].domAnimateInstance.stop();
    }
  }
}
/**
 * 通过css3 Translate 移动后，获取 x 或 y 坐标
 * @param {*} el
 * @param {*} axis
 */


$.getTranslate = function (el, axis = 'x') {
  let matrix;
  let curTransform;
  let transformMatrix;
  const curStyle = window.getComputedStyle(el, null);

  if (window.WebKitCSSMatrix) {
    curTransform = curStyle.transform || curStyle.webkitTransform;

    if (curTransform.split(',').length > 6) {
      curTransform = curTransform.split(', ').map(a => a.replace(',', '.')).join(', ');
    } // Some old versions of Webkit choke when 'none' is passed; pass
    // empty string instead in this case


    transformMatrix = new window.WebKitCSSMatrix(curTransform === 'none' ? '' : curTransform);
  } else {
    transformMatrix = curStyle.MozTransform || curStyle.OTransform || curStyle.MsTransform || curStyle.msTransform || curStyle.transform || curStyle.getPropertyValue('transform').replace('translate(', 'matrix(1, 0, 0, 1,');
    matrix = transformMatrix.toString().split(',');
  }

  if (axis === 'x') {
    // Latest Chrome and webkits Fix
    if (window.WebKitCSSMatrix) curTransform = transformMatrix.m41; // Crazy IE10 Matrix
    else if (matrix.length === 16) curTransform = parseFloat(matrix[12]); // Normal Browsers
      else curTransform = parseFloat(matrix[4]);
  }

  if (axis === 'y') {
    // Latest Chrome and webkits Fix
    if (window.WebKitCSSMatrix) curTransform = transformMatrix.m42; // Crazy IE10 Matrix
    else if (matrix.length === 16) curTransform = parseFloat(matrix[13]); // Normal Browsers
      else curTransform = parseFloat(matrix[5]);
  }

  return curTransform || 0;
};

function getTranslate(axis = 'x') {
  let R = 0;
  const els = this;
  if (els && els.dom) R = $.getTranslate(els.dom, axis);
  return R;
}

var Animate =
/*#__PURE__*/
Object.freeze({
  animate: animate,
  stop: stop,
  getTranslate: getTranslate
});
const noTrigger = 'resize scroll'.split(' ');

function eventShortcut(name, ...args) {
  if (typeof args[0] === 'undefined') {
    for (let i = 0; i < this.length; i += 1) {
      if (noTrigger.indexOf(name) < 0) {
        if (name in this[i]) this[i][name]();else {
          $(this[i]).trigger(name);
        }
      }
    }

    return this;
  }

  return this.on(name, ...args);
}

function click(...args) {
  return eventShortcut.bind(this)('click', ...args);
}

function blur(...args) {
  return eventShortcut.bind(this)('blur', ...args);
}

function focus(...args) {
  return eventShortcut.bind(this)('focus', ...args);
}

function focusin(...args) {
  return eventShortcut.bind(this)('focusin', ...args);
}

function focusout(...args) {
  return eventShortcut.bind(this)('focusout', ...args);
}

function keyup(...args) {
  return eventShortcut.bind(this)('keyup', ...args);
}

function keydown(...args) {
  return eventShortcut.bind(this)('keydown', ...args);
}

function keypress(...args) {
  return eventShortcut.bind(this)('keypress', ...args);
}

function submit(...args) {
  return eventShortcut.bind(this)('submit', ...args);
}

function change(...args) {
  return eventShortcut.bind(this)('change', ...args);
}

function mousedown(...args) {
  return eventShortcut.bind(this)('mousedown', ...args);
}

function mousemove(...args) {
  return eventShortcut.bind(this)('mousemove', ...args);
}

function mouseup(...args) {
  return eventShortcut.bind(this)('mouseup', ...args);
}

function mouseenter(...args) {
  return eventShortcut.bind(this)('mouseenter', ...args);
}

function mouseleave(...args) {
  return eventShortcut.bind(this)('mouseleave', ...args);
}

function mouseout(...args) {
  return eventShortcut.bind(this)('mouseout', ...args);
}

function mouseover(...args) {
  return eventShortcut.bind(this)('mouseover', ...args);
}

function touchstart(...args) {
  return eventShortcut.bind(this)('touchstart', ...args);
}

function touchend(...args) {
  return eventShortcut.bind(this)('touchend', ...args);
}

function touchmove(...args) {
  return eventShortcut.bind(this)('touchmove', ...args);
}

function resize(...args) {
  return eventShortcut.bind(this)('resize', ...args);
}

function scroll(...args) {
  return eventShortcut.bind(this)('scroll', ...args);
}

var eventShortcuts =
/*#__PURE__*/
Object.freeze({
  click: click,
  blur: blur,
  focus: focus,
  focusin: focusin,
  focusout: focusout,
  keyup: keyup,
  keydown: keydown,
  keypress: keypress,
  submit: submit,
  change: change,
  mousedown: mousedown,
  mousemove: mousemove,
  mouseup: mouseup,
  mouseenter: mouseenter,
  mouseleave: mouseleave,
  mouseout: mouseout,
  mouseover: mouseover,
  touchstart: touchstart,
  touchend: touchend,
  touchmove: touchmove,
  resize: resize,
  scroll: scroll
});
/**
 * 输出方法到 $.fn，用户对 $(dom) 对象操作
 * 相关方法与用法与 zepto、jQuery兼容。
 */

[Methods, Scroll, Animate, eventShortcuts].forEach(group => {
  Object.keys(group).forEach(methodName => {
    $.fn[methodName] = group[methodName];
  });
});

const Support = function Support() {
  return {
    touch: function checkTouch() {
      return !!(window.navigator.maxTouchPoints > 0 || 'ontouchstart' in window || window.DocumentTouch && document instanceof window.DocumentTouch);
    }(),
    pointerEvents: !!window.PointerEvent,
    observer: function checkObserver() {
      return 'MutationObserver' in window || 'WebkitMutationObserver' in window;
    }(),
    passiveListener: function checkPassiveListener() {
      let supportsPassive = false;

      try {
        const opts = Object.defineProperty({}, 'passive', {
          // eslint-disable-next-line
          get() {
            supportsPassive = true;
          }

        });
        window.addEventListener('testPassiveListener', null, opts);
      } catch (e) {// No support
      }

      return supportsPassive;
    }(),
    gestures: function checkGestures() {
      return 'ongesturestart' in window;
    }(),
    intersectionObserver: function checkObserver() {
      return 'IntersectionObserver' in window;
    }()
  };
}();

const Device = function Device() {
  const platform = window.navigator.platform;
  const ua = window.navigator.userAgent;
  const device = {
    ios: false,
    android: false,
    androidChrome: false,
    desktop: false,
    iphone: false,
    ipod: false,
    ipad: false,
    edge: false,
    ie: false,
    firefox: false,
    macos: false,
    windows: false,
    cordova: !!(window.cordova || window.phonegap),
    phonegap: !!(window.cordova || window.phonegap),
    electron: false
  };
  const screenWidth = window.screen.width;
  const screenHeight = window.screen.height;
  const android = ua.match(/(Android);?[\s\/]+([\d.]+)?/); // eslint-disable-line

  let ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
  const ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
  const iphone = !ipad && ua.match(/(iPhone\sOS|iOS)\s([\d_]+)/);
  const ie = ua.indexOf('MSIE ') >= 0 || ua.indexOf('Trident/') >= 0;
  const edge = ua.indexOf('Edge/') >= 0;
  const firefox = ua.indexOf('Gecko/') >= 0 && ua.indexOf('Firefox/') >= 0;
  const windows = platform === 'Win32';
  const electron = ua.toLowerCase().indexOf('electron') >= 0;
  let macos = platform === 'MacIntel'; // iPadOs 13 fix

  if (!ipad && macos && Support.touch && (screenWidth === 1024 && screenHeight === 1366 || // Pro 12.9
  screenWidth === 834 && screenHeight === 1194 // Pro 11
  || screenWidth === 834 && screenHeight === 1112 // Pro 10.5
  || screenWidth === 768 && screenHeight === 1024 // other
  )) {
    ipad = ua.match(/(Version)\/([\d.]+)/);
    macos = false;
  }

  device.ie = ie;
  device.edge = edge;
  device.firefox = firefox; // Android

  if (android && !windows) {
    device.os = 'android';
    device.osVersion = android[2];
    device.android = true;
    device.androidChrome = ua.toLowerCase().indexOf('chrome') >= 0;
  }

  if (ipad || iphone || ipod) {
    device.os = 'ios';
    device.ios = true;
  } // iOS


  if (iphone && !ipod) {
    device.osVersion = iphone[2].replace(/_/g, '.');
    device.iphone = true;
  }

  if (ipad) {
    device.osVersion = ipad[2].replace(/_/g, '.');
    device.ipad = true;
  }

  if (ipod) {
    device.osVersion = ipod[3] ? ipod[3].replace(/_/g, '.') : null;
    device.ipod = true;
  } // iOS 8+ changed UA


  if (device.ios && device.osVersion && ua.indexOf('Version/') >= 0) {
    if (device.osVersion.split('.')[0] === '10') {
      device.osVersion = ua.toLowerCase().split('version/')[1].split(' ')[0];
    }
  } // Webview


  device.webView = !!((iphone || ipad || ipod) && (ua.match(/.*AppleWebKit(?!.*Safari)/i) || window.navigator.standalone)) || window.matchMedia && window.matchMedia('(display-mode: standalone)').matches;
  device.webview = device.webView;
  device.standalone = device.webView; // Desktop

  device.desktop = !(device.ios || device.android) || electron;

  if (device.desktop) {
    device.electron = electron;
    device.macos = macos;
    device.windows = windows;

    if (device.macos) {
      device.os = 'macos';
    }

    if (device.windows) {
      device.os = 'windows';
    }
  } // Pixel Ratio


  device.pixelRatio = window.devicePixelRatio || 1; // Color Scheme

  const DARK = '(prefers-color-scheme: dark)';
  const LIGHT = '(prefers-color-scheme: light)';

  device.prefersColorScheme = function prefersColorTheme() {
    let theme;

    if (window.matchMedia && window.matchMedia(LIGHT).matches) {
      theme = 'light';
    }

    if (window.matchMedia && window.matchMedia(DARK).matches) {
      theme = 'dark';
    }

    return theme;
  }; // weixin


  device.wechat = /MicroMessenger/i.test(ua);
  device.weixin = device.wechat; // Export object

  return device;
}();

/* eslint no-control-regex: "off" */
let uniqueNumber = 1;
const Utils = {
  uniqueNumber() {
    uniqueNumber += 1;
    return uniqueNumber;
  },

  id(mask = 'xxxxxxxxxx', map = '0123456789abcdef') {
    return $.uid(mask, map);
  },

  mdPreloaderContent: `
    <span class="preloader-inner">
      <span class="preloader-inner-gap"></span>
      <span class="preloader-inner-left">
          <span class="preloader-inner-half-circle"></span>
      </span>
      <span class="preloader-inner-right">
          <span class="preloader-inner-half-circle"></span>
      </span>
    </span>
  `.trim(),
  iosPreloaderContent: `
    <span class="preloader-inner">
      ${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(() => '<span class="preloader-inner-line"></span>').join('')}
    </span>
  `.trim(),
  auroraPreloaderContent: `
    <span class="preloader-inner">
      <span class="preloader-inner-circle"></span>
    </span>
  `,

  eventNameToColonCase(eventName) {
    let hasColon;
    return eventName.split('').map((char, index) => {
      if (char.match(/[A-Z]/) && index !== 0 && !hasColon) {
        hasColon = true;
        return `:${char.toLowerCase()}`;
      }

      return char.toLowerCase();
    }).join('');
  },

  deleteProps(obj) {
    $.deleteProps(obj);
  },

  nextTick(callback, delay = 0) {
    return setTimeout(callback, delay);
  },

  nextFrame(cb) {
    return $.nextFrame(cb);
  },

  now() {
    return Date.now();
  },

  requestAnimationFrame(cb) {
    return $.requestAnimationFrame(cb);
  },

  cancelAnimationFrame(id) {
    return $.cancelAnimationFrame(id);
  },

  parseUrlQuery(url) {
    return $.urlParam(url);
  },

  getTranslate(el, axis = 'x') {
    return $.getTranslate(el, axis);
  },

  serializeObject(obj, parents = []) {
    if (typeof obj === 'string') return obj;
    const resultArray = [];
    const separator = '&';
    let newParents;

    function varName(name) {
      if (parents.length > 0) {
        let parentParts = '';

        for (let j = 0; j < parents.length; j += 1) {
          if (j === 0) parentParts += parents[j];else parentParts += `[${encodeURIComponent(parents[j])}]`;
        }

        return `${parentParts}[${encodeURIComponent(name)}]`;
      }

      return encodeURIComponent(name);
    }

    function varValue(value) {
      return encodeURIComponent(value);
    }

    Object.keys(obj).forEach(prop => {
      let toPush;

      if (Array.isArray(obj[prop])) {
        toPush = [];

        for (let i = 0; i < obj[prop].length; i += 1) {
          if (!Array.isArray(obj[prop][i]) && typeof obj[prop][i] === 'object') {
            newParents = parents.slice();
            newParents.push(prop);
            newParents.push(String(i));
            toPush.push(Utils.serializeObject(obj[prop][i], newParents));
          } else {
            toPush.push(`${varName(prop)}[]=${varValue(obj[prop][i])}`);
          }
        }

        if (toPush.length > 0) resultArray.push(toPush.join(separator));
      } else if (obj[prop] === null || obj[prop] === '') {
        resultArray.push(`${varName(prop)}=`);
      } else if (typeof obj[prop] === 'object') {
        // Object, convert to named array
        newParents = parents.slice();
        newParents.push(prop);
        toPush = Utils.serializeObject(obj[prop], newParents);
        if (toPush !== '') resultArray.push(toPush);
      } else if (typeof obj[prop] !== 'undefined' && obj[prop] !== '') {
        // Should be string or plain value
        resultArray.push(`${varName(prop)}=${varValue(obj[prop])}`);
      } else if (obj[prop] === '') resultArray.push(varName(prop));
    });
    return resultArray.join(separator);
  },

  isObject(o) {
    return typeof o === 'object' && o !== null && o.constructor && o.constructor === Object;
  },

  merge(...args) {
    return $.merge(...args);
  },

  extend(...args) {
    const to = args[0];
    args.splice(0, 1);
    return $.assign(to, ...args);
  },

  colorHexToRgb(hex) {
    const h = hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h);
    return result ? result.slice(1).map(n => parseInt(n, 16)) : null;
  },

  colorRgbToHex(r, g, b) {
    const result = [r, g, b].map(n => {
      const hex = n.toString(16);
      return hex.length === 1 ? `0${hex}` : hex;
    }).join('');
    return `#${result}`;
  },

  colorRgbToHsl(r, g, b) {
    r /= 255; // eslint-disable-line

    g /= 255; // eslint-disable-line

    b /= 255; // eslint-disable-line

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const d = max - min;
    let h;
    if (d === 0) h = 0;else if (max === r) h = (g - b) / d % 6;else if (max === g) h = (b - r) / d + 2;else if (max === b) h = (r - g) / d + 4;
    const l = (min + max) / 2;
    const s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
    if (h < 0) h = 360 / 60 + h;
    return [h * 60, s, l];
  },

  colorHslToRgb(h, s, l) {
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const hp = h / 60;
    const x = c * (1 - Math.abs(hp % 2 - 1));
    let rgb1;

    if (Number.isNaN(h) || typeof h === 'undefined') {
      rgb1 = [0, 0, 0];
    } else if (hp <= 1) rgb1 = [c, x, 0];else if (hp <= 2) rgb1 = [x, c, 0];else if (hp <= 3) rgb1 = [0, c, x];else if (hp <= 4) rgb1 = [0, x, c];else if (hp <= 5) rgb1 = [x, 0, c];else if (hp <= 6) rgb1 = [c, 0, x];

    const m = l - c / 2;
    return rgb1.map(n => Math.max(0, Math.min(255, Math.round(255 * (n + m)))));
  },

  colorHsbToHsl(h, s, b) {
    const HSL = {
      h,
      s: 0,
      l: 0
    };
    const HSB = {
      h,
      s,
      b
    };
    HSL.l = (2 - HSB.s) * HSB.b / 2;
    HSL.s = HSL.l && HSL.l < 1 ? HSB.s * HSB.b / (HSL.l < 0.5 ? HSL.l * 2 : 2 - HSL.l * 2) : HSL.s;
    return [HSL.h, HSL.s, HSL.l];
  },

  colorHslToHsb(h, s, l) {
    const HSB = {
      h,
      s: 0,
      b: 0
    };
    const HSL = {
      h,
      s,
      l
    };
    const t = HSL.s * (HSL.l < 0.5 ? HSL.l : 1 - HSL.l);
    HSB.b = HSL.l + t;
    HSB.s = HSL.l > 0 ? 2 * t / HSB.b : HSB.s;
    return [HSB.h, HSB.s, HSB.b];
  },

  colorThemeCSSProperties(...args) {
    let hex;
    let rgb;

    if (args.length === 1) {
      hex = args[0];
      rgb = Utils.colorHexToRgb(hex);
    } else if (args.length === 3) {
      rgb = args;
      hex = Utils.colorRgbToHex(...rgb);
    }

    if (!rgb) return {};
    const hsl = Utils.colorRgbToHsl(...rgb);
    const hslShade = [hsl[0], hsl[1], Math.max(0, hsl[2] - 0.08)];
    const hslTint = [hsl[0], hsl[1], Math.max(0, hsl[2] + 0.08)];
    const shade = Utils.colorRgbToHex(...Utils.colorHslToRgb(...hslShade));
    const tint = Utils.colorRgbToHex(...Utils.colorHslToRgb(...hslTint));
    return {
      '--f7-theme-color': hex,
      '--f7-theme-color-rgb': rgb.join(', '),
      '--f7-theme-color-shade': shade,
      '--f7-theme-color-tint': tint
    };
  }

};

/**
 * 事件类，提供对象的事件侦听、触发，只在类实例中有效。
 * 需要支持事件的对象，可以从这个类继承，则类实例具备事件功能。
 * Fork from Framework7，
 */
class Event {
  constructor(params = {}, parents = []) {
    const self = this;
    self.params = params;
    self.eventsParents = parents;
    self.eventsListeners = {}; // 通过 params 中的 on 加载事件响应

    if (self.params && self.params.on) {
      Object.keys(self.params.on).forEach(eventName => {
        self.on(eventName, self.params.on[eventName]);
      });
    }
  }

  on(events, handler, priority) {
    const self = this;
    if (typeof handler !== 'function') return self;
    const method = priority ? 'unshift' : 'push';
    events.split(' ').forEach(event => {
      if (!self.eventsListeners[event]) self.eventsListeners[event] = [];
      self.eventsListeners[event][method](handler);
    });
    return self;
  }

  once(events, handler, priority) {
    const self = this;
    if (typeof handler !== 'function') return self;

    function onceHandler(...args) {
      self.off(events, onceHandler);

      if (onceHandler.proxy) {
        delete onceHandler.proxy;
      }

      handler.apply(self, args);
    }

    onceHandler.proxy = handler;
    return self.on(events, onceHandler, priority);
  }

  off(events, handler) {
    const self = this;
    if (!self.eventsListeners) return self;
    events.split(' ').forEach(event => {
      if (typeof handler === 'undefined') {
        self.eventsListeners[event] = [];
      } else if (self.eventsListeners[event]) {
        self.eventsListeners[event].forEach((eventHandler, index) => {
          if (eventHandler === handler || eventHandler.proxy && eventHandler.proxy === handler) {
            self.eventsListeners[event].splice(index, 1);
          }
        });
      }
    });
    return self;
  }

  emit(...args) {
    const self = this;
    if (!self.eventsListeners) return self;
    let events;
    let data;
    let context;
    let eventsParents;

    if (typeof args[0] === 'string' || Array.isArray(args[0])) {
      events = args[0];
      data = args.slice(1, args.length);
      context = self;
      eventsParents = self.eventsParents;
    } else {
      events = args[0].events;
      data = args[0].data;
      context = args[0].context || self;
      eventsParents = args[0].local ? [] : args[0].parents || self.eventsParents;
    }

    const eventsArray = Array.isArray(events) ? events : events.split(' ');
    const localEvents = eventsArray.map(eventName => eventName.replace('local::', ''));
    const parentEvents = eventsArray.filter(eventName => eventName.indexOf('local::') < 0);
    localEvents.forEach(event => {
      if (self.eventsListeners && self.eventsListeners[event]) {
        const handlers = [];
        self.eventsListeners[event].forEach(eventHandler => {
          handlers.push(eventHandler);
        });
        handlers.forEach(eventHandler => {
          eventHandler.apply(context, data);
        });
      }
    });

    if (eventsParents && eventsParents.length > 0) {
      eventsParents.forEach(eventsParent => {
        eventsParent.emit(parentEvents, ...data);
      });
    }

    return self;
  }

}

/**
 * Wia app、router等继承类，通过模块化扩展类功能
 */

class Module extends Event {
  constructor(params = {}, parents = []) {
    super(params, parents);
  } // eslint-disable-next-line


  useModuleParams(module, instanceParams) {
    if (module.params) {
      const originalParams = {};
      Object.keys(module.params).forEach(paramKey => {
        if (typeof instanceParams[paramKey] === 'undefined') return;
        originalParams[paramKey] = $.extend({}, instanceParams[paramKey]);
      });
      $.extend(instanceParams, module.params);
      Object.keys(originalParams).forEach(paramKey => {
        $.extend(instanceParams[paramKey], originalParams[paramKey]);
      });
    }
  }

  useModulesParams(instanceParams) {
    const instance = this;
    if (!instance.modules) return;
    Object.keys(instance.modules).forEach(moduleName => {
      const module = instance.modules[moduleName]; // Extend params

      if (module.params) {
        $.extend(instanceParams, module.params);
      }
    });
  }
  /**
   * 将扩展模块的相关事件加载到类实例
   * @param {*} moduleName 扩展模块名称
   * @param {*} moduleParams 
   */


  useModule(moduleName = '', moduleParams = {}) {
    const instance = this;
    if (!instance.modules) return; // 从原型中获得的模块类引用

    const module = typeof moduleName === 'string' ? instance.modules[moduleName] : moduleName;
    if (!module) return; // 扩展实例的方法和属性，Extend instance methods and props

    if (module.instance) {
      Object.keys(module.instance).forEach(modulePropName => {
        const moduleProp = module.instance[modulePropName];

        if (typeof moduleProp === 'function') {
          instance[modulePropName] = moduleProp.bind(instance);
        } else {
          instance[modulePropName] = moduleProp;
        }
      });
    } // 将扩展模块中的on加载到事件侦听中，Add event listeners


    if (module.on && instance.on) {
      Object.keys(module.on).forEach(moduleEventName => {
        instance.on(moduleEventName, module.on[moduleEventName]);
      });
    } // 加载扩展模块的vnodeHooks，Add vnode hooks


    if (module.vnode) {
      if (!instance.vnodeHooks) instance.vnodeHooks = {};
      Object.keys(module.vnode).forEach(vnodeId => {
        Object.keys(module.vnode[vnodeId]).forEach(hookName => {
          const handler = module.vnode[vnodeId][hookName];
          if (!instance.vnodeHooks[hookName]) instance.vnodeHooks[hookName] = {};
          if (!instance.vnodeHooks[hookName][vnodeId]) instance.vnodeHooks[hookName][vnodeId] = [];
          instance.vnodeHooks[hookName][vnodeId].push(handler.bind(instance));
        });
      });
    } // 模块实例化回调，Module create callback


    if (module.create) {
      module.create.bind(instance)(moduleParams);
    }
  }
  /**
   * 初始化实例原型中的所有扩展模块中定义的相关回调
   * @param {*} modulesParams 
   */


  useModules(modulesParams = {}) {
    const instance = this;
    if (!instance.modules) return;
    Object.keys(instance.modules).forEach(moduleName => {
      const moduleParams = modulesParams[moduleName] || {};
      instance.useModule(moduleName, moduleParams);
    });
  }

  static set components(components) {
    const Class = this;
    if (!Class.use) return;
    Class.use(components);
  }
  /**
   * 将模块类加载到指定类上，用于扩展类
   * @param {*} module 模块类
   * @param  {...any} params 参数
   */


  static installModule(module, ...params) {
    const Class = this;
    if (!Class.prototype.modules) Class.prototype.modules = {};
    const name = module.name || `${Object.keys(Class.prototype.modules).length}_${$.now()}`; // 原型属性中引用该模块类，类实例

    Class.prototype.modules[name] = module; // 模块如果定义了原型，则将模块原型加载到类原型

    if (module.proto) {
      Object.keys(module.proto).forEach(key => {
        Class.prototype[key] = module.proto[key];
      });
    } // 加载静态属性


    if (module.static) {
      Object.keys(module.static).forEach(key => {
        Class[key] = module.static[key];
      });
    } // 执行加载回调函数


    if (module.install) {
      module.install.apply(Class, params);
    }

    return Class;
  }
  /**
   * 加载类扩展模块到类
   * @param {*} module 
   * @param  {...any} params 
   */


  static use(module, ...params) {
    const Class = this;

    if (Array.isArray(module)) {
      module.forEach(m => Class.installModule(m));
      return Class;
    }

    return Class.installModule(module, ...params);
  }

}

/**
 * 扩展构造函数
 * @param {*} parameters 
 */
function Constructors (parameters = {}) {
  const {
    defaultSelector,
    constructor,
    domProp,
    app,
    addMethods
  } = parameters;
  const methods = {
    create(...args) {
      if (app) return new constructor(app, ...args);
      return new constructor(...args);
    },

    get(el = defaultSelector) {
      if (el instanceof constructor) return el;
      const $el = $(el);
      if ($el.length === 0) return undefined;
      return $el[0][domProp];
    },

    destroy(el) {
      const instance = methods.get(el);
      if (instance && instance.destroy) return instance.destroy();
      return undefined;
    }

  };

  if (addMethods && Array.isArray(addMethods)) {
    addMethods.forEach(methodName => {
      methods[methodName] = (el = defaultSelector, ...args) => {
        const instance = methods.get(el);
        if (instance && instance[methodName]) return instance[methodName](...args);
        return undefined;
      };
    });
  }

  return methods;
}

function Modals (parameters = {}) {
  const {
    defaultSelector,
    constructor,
    app
  } = parameters;
  const methods = $.extend(Constructors({
    defaultSelector,
    constructor,
    app,
    domProp: 'wiaModal'
  }), {
    open(el, animate) {
      const $el = $(el);
      let instance = $el[0].wiaModal;
      if (!instance) instance = new constructor(app, {
        el: $el
      });
      return instance.open(animate);
    },

    close(el = defaultSelector, animate) {
      const $el = $(el);
      if ($el.length === 0) return undefined;
      let instance = $el[0].wiaModal;
      if (!instance) instance = new constructor(app, {
        el: $el
      });
      return instance.close(animate);
    }

  });
  return methods;
}

/**
 * 动态加载扩展模块，被 App调用。
 * 通过写入页面标签实现动态加载js、css
 * wia base中已经实现了动态下载、加载模块功能，该模块应删除
 */
const fetchedModules = [];

function loadModule(moduleToLoad) {
  const App = this;
  return new Promise((resolve, reject) => {
    const app = App.instance;
    let modulePath;
    let moduleObj;
    let moduleFunc;

    if (!moduleToLoad) {
      reject(new Error('Wia: Lazy module must be specified'));
      return;
    }

    function install(module) {
      App.use(module);

      if (app) {
        app.useModuleParams(module, app.params);
        app.useModule(module);
      }
    }

    if (typeof moduleToLoad === 'string') {
      const matchNamePattern = moduleToLoad.match(/([a-z0-9-]*)/i);

      if (moduleToLoad.indexOf('.') < 0 && matchNamePattern && matchNamePattern[0].length === moduleToLoad.length) {
        if (!app || app && !app.params.lazyModulesPath) {
          reject(new Error('Wia: "lazyModulesPath" app parameter must be specified to fetch module by name'));
          return;
        }

        modulePath = `${app.params.lazyModulesPath}/${moduleToLoad}.js`;
      } else {
        modulePath = moduleToLoad;
      }
    } else if (typeof moduleToLoad === 'function') {
      moduleFunc = moduleToLoad;
    } else {
      // considering F7-Plugin object
      moduleObj = moduleToLoad;
    }

    if (moduleFunc) {
      const module = moduleFunc(App, false);

      if (!module) {
        reject(new Error("Wia: Can't find Wia component in specified component function"));
        return;
      } // Check if it was added


      if (App.prototype.modules && App.prototype.modules[module.name]) {
        resolve();
        return;
      } // Install It


      install(module);
      resolve();
    }

    if (moduleObj) {
      const module = moduleObj;

      if (!module) {
        reject(new Error("Wia: Can't find Wia component in specified component"));
        return;
      } // Check if it was added


      if (App.prototype.modules && App.prototype.modules[module.name]) {
        resolve();
        return;
      } // Install It


      install(module);
      resolve();
    }

    if (modulePath) {
      if (fetchedModules.indexOf(modulePath) >= 0) {
        resolve();
        return;
      }

      fetchedModules.push(modulePath); // 动态加载 js 脚本

      const scriptLoad = new Promise((resolveScript, rejectScript) => {
        App.request.get(modulePath, scriptContent => {
          const id = $.id();
          const callbackLoadName = `wia_component_loader_callback_${id}`;
          const scriptEl = document.createElement('script');
          scriptEl.innerHTML = `window.${callbackLoadName} = function (Wia, WiaAutoInstallComponent) {return ${scriptContent.trim()}}`; // 动态加载 js

          $('head').append(scriptEl);
          const componentLoader = window[callbackLoadName];
          delete window[callbackLoadName];
          $(scriptEl).remove();
          const module = componentLoader(App, false);

          if (!module) {
            rejectScript(new Error(`Wia: Can't find Wia component in ${modulePath} file`));
            return;
          } // Check if it was added


          if (App.prototype.modules && App.prototype.modules[module.name]) {
            resolveScript();
            return;
          } // Install It


          install(module);
          resolveScript();
        }, (xhr, status) => {
          rejectScript(xhr, status);
        });
      }); // 动态加载css样式

      const styleLoad = new Promise(resolveStyle => {
        App.request.get(modulePath.replace('.js', app.rtl ? '.rtl.css' : '.css'), styleContent => {
          const styleEl = document.createElement('style');
          styleEl.innerHTML = styleContent;
          $('head').append(styleEl);
          resolveStyle();
        }, () => {
          resolveStyle();
        });
      });
      Promise.all([scriptLoad, styleLoad]).then(() => {
        resolve();
      }).catch(err => {
        reject(err);
      });
    }
  });
}

var Resize = {
  name: 'resize',
  instance: {
    getSize() {
      const app = this;
      if (!app.root[0]) return {
        width: 0,
        height: 0,
        left: 0,
        top: 0
      };
      const offset = app.root.offset();
      const [width, height, left, top] = [app.root[0].offsetWidth, app.root[0].offsetHeight, offset.left, offset.top];
      app.width = width;
      app.height = height;
      app.left = left;
      app.top = top;
      return {
        width,
        height,
        left,
        top
      };
    }

  },
  on: {
    init() {
      const app = this; // Get Size

      app.getSize(); // Emit resize

      window.addEventListener('resize', () => {
        app.emit('resize');
      }, false); // Emit orientationchange

      window.addEventListener('orientationchange', () => {
        app.emit('orientationchange');
      });
    },

    orientationchange() {
      const app = this; // Fix iPad weird body scroll

      if (app.device.ipad) {
        document.body.scrollLeft = 0;
        setTimeout(() => {
          document.body.scrollLeft = 0;
        }, 0);
      }
    },

    resize() {
      const app = this;
      app.getSize();
    }

  }
};

const SW = {
  registrations: [],

  register(path, scope) {
    const app = this;

    if (!('serviceWorker' in window.navigator) || !app.serviceWorker.container) {
      return new Promise((resolve, reject) => {
        reject(new Error('Service worker is not supported'));
      });
    }

    return new Promise((resolve, reject) => {
      app.serviceWorker.container.register(path, scope ? {
        scope
      } : {}).then(reg => {
        SW.registrations.push(reg);
        app.emit('serviceWorkerRegisterSuccess', reg);
        resolve(reg);
      }).catch(error => {
        app.emit('serviceWorkerRegisterError', error);
        reject(error);
      });
    });
  },

  unregister(registration) {
    const app = this;

    if (!('serviceWorker' in window.navigator) || !app.serviceWorker.container) {
      return new Promise((resolve, reject) => {
        reject(new Error('Service worker is not supported'));
      });
    }

    let registrations;
    if (!registration) registrations = SW.registrations;else if (Array.isArray(registration)) registrations = registration;else registrations = [registration];
    return Promise.all(registrations.map(reg => new Promise((resolve, reject) => {
      reg.unregister().then(() => {
        if (SW.registrations.indexOf(reg) >= 0) {
          SW.registrations.splice(SW.registrations.indexOf(reg), 1);
        }

        app.emit('serviceWorkerUnregisterSuccess', reg);
        resolve();
      }).catch(error => {
        app.emit('serviceWorkerUnregisterError', reg, error);
        reject(error);
      });
    })));
  }

};
var SW$1 = {
  name: 'sw',
  params: {
    serviceWorker: {
      path: undefined,
      scope: undefined
    }
  },

  create() {
    const app = this;
    $.extend(app, {
      serviceWorker: {
        container: 'serviceWorker' in window.navigator ? window.navigator.serviceWorker : undefined,
        registrations: SW.registrations,
        register: SW.register.bind(app),
        unregister: SW.unregister.bind(app)
      }
    });
  },

  on: {
    init() {
      if (!('serviceWorker' in window.navigator)) return;
      const app = this;
      if (!app.serviceWorker.container) return;
      const paths = app.params.serviceWorker.path;
      const scope = app.params.serviceWorker.scope;
      if (!paths || Array.isArray(paths) && !paths.length) return;
      const toRegister = Array.isArray(paths) ? paths : [paths];
      toRegister.forEach(path => {
        app.serviceWorker.register(path, scope);
      });
    }

  }
};

/**
 * Wia App 基类，从 Module 和 Event 继承。
 */
$.support = Support;
$.device = Device;

class App extends Module {
  constructor(params) {
    super(params);

    if (App.instance) {
      throw new Error("App is already initialized and can't be initialized more than once");
    }

    const passedParams = $.extend({}, params); // App Instance

    const app = this;
    App.instance = app;
    $.app = app;
    $.App = App; // Default

    const defaults = {
      version: '1.0.0',
      id: 'pub.wia.testapp',
      root: 'body',
      theme: 'auto',
      language: window.navigator.language,
      routes: [],
      name: 'wia',
      lazyModulesPath: null,
      initOnDeviceReady: true,
      init: true,
      autoDarkTheme: false,
      iosTranslucentBars: true,
      iosTranslucentModals: true,
      component: undefined,
      componentUrl: undefined
    }; // Extend defaults with modules params

    app.useModulesParams(defaults); // Extend defaults with passed params

    app.params = $.extend(defaults, params);
    const $rootEl = $(app.params.root);
    $.extend(app, {
      // App Id
      id: app.params.id,
      // App Name
      name: app.params.name,
      // App version
      version: app.params.version,
      // Routes
      routes: app.params.routes,
      // Lang
      language: app.params.language,
      // Root
      root: $rootEl,
      cfg: app.params.cfg,
      // confg 配置
      // RTL
      rtl: $rootEl.css('direction') === 'rtl',
      // Theme
      theme: function getTheme() {
        if (app.params.theme === 'auto') {
          if (Device.ios) return 'ios';
          if (Device.desktop && Device.electron) return 'aurora';
          return 'md';
        }

        return app.params.theme;
      }(),
      // Initially passed parameters
      passedParams,
      online: window.navigator.onLine
    }); // Save Root

    if (app.root && app.root[0]) {
      app.root[0].wia = app;
    } // 加载use插入的模块类相关方法，Load Use Modules


    app.useModules(); // 初始化数据，Init Data & Methods

    app.initData(); // 自动暗黑主题，Auto Dark Theme

    const DARK = '(prefers-color-scheme: dark)';
    const LIGHT = '(prefers-color-scheme: light)';
    app.mq = {};

    if (window.matchMedia) {
      app.mq.dark = window.matchMedia(DARK);
      app.mq.light = window.matchMedia(LIGHT);
    }

    app.colorSchemeListener = function ({
      matches,
      media
    }) {
      if (!matches) {
        return;
      }

      const html = document.querySelector('html');

      if (media === DARK) {
        html.classList.add('theme-dark');
      } else if (media === LIGHT) {
        html.classList.remove('theme-dark');
      }
    }; // app 初始化，Init


    function init() {
      if (Device.cordova && app.params.initOnDeviceReady) {
        $(document).on('deviceready', () => {
          app.init();
        });
      } else {
        app.init();
      }
    }

    if (app.params.component || app.params.componentUrl) {
      app.router.componentLoader(app.params.component, app.params.componentUrl, {
        componentOptions: {
          el: app.root[0]
        }
      }, el => {
        app.root = $(el);
        app.root[0].f7 = app;
        app.rootComponent = el.f7Component;
        if (app.params.init) init();
      });
    } else if (app.params.init) {
      init();
    } // Return app instance


    return app;
  }
  /**
   * 初始化数据
   */


  initData() {
    const app = this; // Data

    app.data = {};

    if (app.params.data && typeof app.params.data === 'function') {
      $.extend(app.data, app.params.data.bind(app)());
    } else if (app.params.data) {
      $.extend(app.data, app.params.data);
    } // Methods


    app.methods = {};

    if (app.params.methods) {
      Object.keys(app.params.methods).forEach(methodName => {
        if (typeof app.params.methods[methodName] === 'function') {
          app.methods[methodName] = app.params.methods[methodName].bind(app);
        } else {
          app.methods[methodName] = app.params.methods[methodName];
        }
      });
    }
  }

  enableAutoDarkTheme() {
    if (!window.matchMedia) return;
    const app = this;
    const html = document.querySelector('html');

    if (app.mq.dark && app.mq.light) {
      app.mq.dark.addListener(app.colorSchemeListener);
      app.mq.light.addListener(app.colorSchemeListener);
    }

    if (app.mq.dark && app.mq.dark.matches) {
      html.classList.add('theme-dark');
    } else if (app.mq.light && app.mq.light.matches) {
      html.classList.remove('theme-dark');
    }
  }

  disableAutoDarkTheme() {
    if (!window.matchMedia) return;
    const app = this;
    if (app.mq.dark) app.mq.dark.removeListener(app.colorSchemeListener);
    if (app.mq.light) app.mq.light.removeListener(app.colorSchemeListener);
  } // 初始化


  init() {
    const app = this;
    if (app.initialized) return app;
    app.root.addClass('framework7-initializing'); // RTL attr

    if (app.rtl) {
      $('html').attr('dir', 'rtl');
    } // Auto Dark Theme


    if (app.params.autoDarkTheme) {
      app.enableAutoDarkTheme();
    } // Watch for online/offline state


    window.addEventListener('offline', () => {
      app.online = false;
      app.emit('offline');
      app.emit('connection', false);
    });
    window.addEventListener('online', () => {
      app.online = true;
      app.emit('online');
      app.emit('connection', true);
    }); // Root class

    app.root.addClass('framework7-root'); // Theme class

    $('html').removeClass('ios md aurora').addClass(app.theme); // iOS Translucent

    if (app.params.iosTranslucentBars && app.theme === 'ios' && Device.ios) {
      $('html').addClass('ios-translucent-bars');
    }

    if (app.params.iosTranslucentModals && app.theme === 'ios' && Device.ios) {
      $('html').addClass('ios-translucent-modals');
    } // Init class


    $.nextFrame(() => {
      app.root.removeClass('framework7-initializing');
    });
    initStyle(); // Emit, init other modules

    app.initialized = true;
    app.emit('init');
    return app;
  } // eslint-disable-next-line


  loadModule(m) {
    App.loadModule(m); // 模块初始化

    if (this[m.name].init) this[m.name].init();
  } // eslint-disable-next-line


  loadModules(...args) {
    return App.loadModules(...args);
  }

  getVnodeHooks(hook, id) {
    const app = this;
    if (!app.vnodeHooks || !app.vnodeHooks[hook]) return [];
    return app.vnodeHooks[hook][id] || [];
  } // eslint-disable-next-line


  get $() {
    return $;
  }

  static get Dom() {
    return $;
  }

  static get $() {
    return $;
  }

  static get Module() {
    return Module;
  }

  static get Event() {
    return Event;
  }

}
/**
 * 初始化html样式
 * from device module
 */


function initStyle() {
  const classNames = [];
  const html = document.querySelector('html');
  const metaStatusbar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
  if (!html) return;

  if (Device.standalone && Device.ios && metaStatusbar && metaStatusbar.content === 'black-translucent') {
    classNames.push('device-full-viewport');
  } // Pixel Ratio


  classNames.push(`device-pixel-ratio-${Math.floor(Device.pixelRatio)}`); // OS classes

  if (Device.os && !Device.desktop) {
    classNames.push(`device-${Device.os}`);
  } else if (Device.desktop) {
    classNames.push('device-desktop');

    if (Device.os) {
      classNames.push(`device-${Device.os}`);
    }
  }

  if (Device.cordova || Device.phonegap) {
    classNames.push('device-cordova');
  } // Add html classes


  classNames.forEach(className => {
    html.classList.add(className);
  });
}

App.ModalMethods = Modals;
App.ConstructorMethods = Constructors; // 动态加载模块（base里面已经内置动态加载，这个方法应该用不上）

App.loadModule = loadModule;

App.loadModules = function loadModules(modules) {
  return Promise.all(modules.map(module => App.loadModule(module)));
}; // app 加载到 app实例的一些扩展模块


App.support = Support;
App.device = Device;
App.utils = Utils; // 添加应用缺省模块

App.use([Resize, // 控制屏幕大小
SW$1]);

/**
 * Released on: August 28, 2016
 * 图片延迟加载
 * 使用方法：
 * import {Lazy from '@wiajs/core';
 * const _lazy = new Lazy();
 * _lazy.start(dv); // 注意，这个dv是滚动的层，错了无法触发加载，sui 就是内容层！
 * setTimeout(() => {loadView()}, 1);  // krouter 里面已经做了处理，bind 时直接 加载视图即可！
 * loadView 加载视图中（每次页面更新内容后，需调用）
 * _lazy.update(); // 没有显示的图片，加入 待加载数组，并检查是否可视，可视则加载！
 */
// options
const _opts = {
  normal: 'nor',
  // 'data-normal' 普通图片
  retina: 'ret',
  // 'data-retina',
  srcset: 'set',
  // 'data-srcset', 浏览器根据宽、高和像素密度来加载相应的图片资源
  threshold: 0
};

let _opt;

let _ticking;

let _nodes;

let _windowHeight = window.innerHeight;

let _root; // private


let _prevLoc = getLoc(); // feature detection
// https://github.com/Modernizr/Modernizr/blob/master/feature-detects/img/srcset.js


const _srcset = document.body.classList.contains('srcset') || 'srcset' in document.createElement('img'); // 设备分辨率
// not supported in IE10 - https://msdn.microsoft.com/en-us/library/dn265030(v=vs.85).aspx


const _dpr = window.devicePixelRatio || window.screen.deviceXDPI / window.screen.logicalXDPI;
/**
 * 输外部可调用的类
 * 类外面的变量、函数作为模块内部私有属性、方法，外部无法调用
 * 如果全部放入类中，属性、函数相互调用，都需要 this，非常麻烦！
 * 也可以直接使用 export default (options = {}) => {} 输出一个函数！
 * 函数内部反而不需要this，比较方便。
 */


class Lazy {
  // 实例属性
  constructor(opt) {
    _opt = $.assign({}, _opts, opt);
  } // API
  //----------------------------------------
  // dom 就绪后 start，dom 更新后，需 update

  /**
   * 启动延迟加载, 加载事件, dom ready时调用!
   * @param root 根对象, scroll的目标对象，错了无法触发scroll 事件！
   * @returns {init}
   */


  start(root) {
    // sui window scroll event invalid!!!
    // ['scroll', 'resize'].forEach(event => window[action](event, requestScroll));
    ['scroll', 'resize'].forEach(event => root['addEventListener'](event, requestScroll));
    _root = root;
    return this;
  }
  /**
   * 停止延迟加载,卸载事件!
   * @param root 根对象, scroll的目标对象
   * @returns {init}
   */


  stop() {
    // sui window scroll event invalid!!!
    // ['scroll', 'resize'].forEach(event => window[action](event, requestScroll));
    ['scroll', 'resize'].forEach(event => _root['removeEventListener'](event, requestScroll));
    return this;
  }

  update() {
    setTimeout(() => {
      update();
      check();
    }, 1);
  }

}
/**
 * Y 坐标，好像一直是 0
 */

function getLoc() {
  // console.log(`window.scrollY:${window.scrollY} window.pageYOffset:${window.pageYOffset}`);
  return window.scrollY || window.pageYOffset;
} // debounce helpers


function requestScroll() {
  _prevLoc = getLoc();
  requestFrame();
}

function requestFrame() {
  if (!_ticking) {
    window.requestAnimationFrame(() => check());
    _ticking = true;
  }
} // offset helper

/**
 * 节点相对视口的坐标，对于动态加载的，好像得到都是0，使用定时器延迟加载就能正确获取！
 */


function getOffset(node) {
  // 元素四个位置的相对于视口的坐标
  return node.getBoundingClientRect().top + _prevLoc; // return node.offsetTop + _prevLoc;
}
/**
 * 节点是否在可视窗口判断
 * 通过可视窗口顶部、底部坐标来判断
 * 顶部坐标就是页面的滚动条滚动的距离
 * 底部坐标就是滚动条的距离加上当前可视窗口的高度
 * dom元素中心：元素到最顶端的高度加上自身高度的一半
 * @param {*} node
 */


function inViewport(node) {
  const viewTop = _prevLoc; // 视口顶部坐标

  const viewBot = viewTop + _windowHeight; // 视口底部坐标
  // console.log(`viewTop:${viewTop} viewBot:${viewBot}`);
  // 节点坐标

  const nodeTop = getOffset(node);
  const nodeBot = nodeTop + node.offsetHeight; // console.log(`nodeTop:${nodeTop} nodeBot:${nodeBot}`);

  const offset = _opt.threshold / 100 * _windowHeight; // 节点在可视范围内

  const rc = nodeBot >= viewTop - offset && nodeTop <= viewBot + offset; // if (rc)
  //   console.log(`nodeBot:${nodeBot} >= view:${viewTop - offset} nodeTop:${nodeTop} <= view:${viewBot + offset}`);

  return rc;
} // source helper


function setSource(node) {
  $.emit('lazy:src:before', node); // prefer srcset, fallback to pixel density

  if (_srcset && node.hasAttribute(_opt.srcset)) {
    node.setAttribute('srcset', node.getAttribute(_opt.srcset));
  } else {
    const retina = _dpr > 1 && node.getAttribute(_opt.retina);
    const src = retina || node.getAttribute(_opt.normal);
    node.setAttribute('src', src);
    console.log(`set src:${src}`);
  }

  $.emit('lazy:src:after', node); // 删除懒加载属性，避免重复加载

  [_opt.normal, _opt.retina, _opt.srcset].forEach(attr => node.removeAttribute(attr));
  update();
}
/**
 * 检查是否可视,如果可视则更改图片src，加载图片
 * @returns {check}
 */


function check() {
  if (!_nodes) return;
  _windowHeight = window.innerHeight;

  _nodes.forEach(node => inViewport(node) && setSource(node));

  _ticking = false;
  return this;
}
/**
 * 新的图片加入dom，需重新获取属性为nor的图片节点，
 * @returns {update}
 */


function update(root) {
  if (root) _nodes = Array.prototype.slice.call(root.querySelectorAll(`[${_opt.normal}]`));else _nodes = Array.prototype.slice.call(document.querySelectorAll(`[${_opt.normal}]`));
  return this;
}

/**
 * 所有页面从该类继承，并必须实现 load 事件！
 * 事件
 *  五个个事件：load -> ready -> show / hide -> unload
 *  load：必选，加载视图、代码，第一次加载后缓存，后续不会重复加载，动态代码也要在这里加载
 *    参数；param
 *    如果需要前路由数据，通过 $.lastPage.data 访问
 *    view 还未创建，隐藏page 不存在
 *  ready：可选，对视图中的对象事件绑定，已经缓存的视图，比如回退，不会再次触发 ready
 *    参数；view、param
 *    如果需要前路由数据，通过 $.lastPage.data 访问
 *  show：可选，视图显示时触发，可以接收参数，操作视图，无论是否缓存（比如回退）都会触发
 *    对于已经加载、绑定隐藏（缓存）的页面，重新显示时，不会触发load和ready，只会触发show
 *    参数：view、param
 *  hide：可选，视图卸载删除时触发，适合保存卸载页面的数据，卸载的页面从页面删除，进入缓存
 *  unload：可选，页面从缓存中删除时触发，目前暂未实现
 *
 * 数据传递
 *  每个页面都能访问当前路由，路由存在以下参数，用户跨页面数据传递
 *  url：页面跳转时的原始网址
 *  param：页面网址及go中传入的参数合并，保存在 param 中
 *  data：路由中需要保存的数据
 *  view：当前页面层，dom 对象，已经包括绑定的事件
 *  $.page：当前页面对象
 *  $.lastPage：前路由，可通过该参数，获取前路由的 data，在后续路由中使用
 *
 */
class Page {
  constructor(app, name, title, style) {
    this.app = app;
    this.cfg = app.cfg;
    this.name = name; // 名称，支持带路径：admin/login

    this.title = title; // 浏览器标题

    this.style = style || `./page/${name}.css`;
    this.path = `${name}`; // url 路径，不使用正则，直接查找

    this.view = null; // 包含当前页面的div层Dom对象

    this.html = ''; // 页面html文本

    this.css = ''; // 页面css样式

    this.js = ''; // 页面代码

    this.data = {}; // 页面数据对象

    this.param = {}; // 页面切换传递进来的参数对象
  }
  /**
   * 异步加载页面视图内容
   * 返回Promise对象
   * @param {*} param
   * @param {*} cfg
   */


  load(param) {
    this.param = param; // $.assign(this.data, param);
  }
  /**
   * 在已经加载就绪的视图上操作
   * @param {*} view 页面层的 Dom 对象，已经使用`$(#page-name)`，做了处理
   * @param {*} param go 函数的参数，或 网址中 url 中的参数
   * @param {*} back 是否为回退，A->B, B->A，这种操作属于回退
   */


  ready(view, param, back) {
    $.assign(this, {
      view,
      param,
      back
    }); // $.assign(this.data, param);
  } // 在已经加载的视图上操作
  // dv：页面层，param：参数


  show(view, param, back) {
    $.assign(this, {
      view,
      param,
      back
    }); // $.assign(this.data, param);
  }

}

export { Ajax, App, Constructors, Device, Event, Lazy, Modals, Module, Page, Resize, SW$1 as SW, Support, Utils, loadModule };
