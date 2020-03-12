/*!
  * wia dom v0.1.4
  * (c) 2020 Sibyl Yu
  * @license MIT
  */
'use strict';

var _$ = $,
    Dom = _$.Dom;
var emptyArray = [];

function attr(attrs, value) {
  if (arguments.length === 1 && typeof attrs === 'string') {
    // Get attr
    if (this[0]) return this[0].getAttribute(attrs);
    return undefined;
  } // Set attrs


  for (var i = 0; i < this.length; i += 1) {
    if (arguments.length === 2) {
      // String
      this[i].setAttribute(attrs, value);
    } else {
      // Object
      // eslint-disable-next-line
      for (var attrName in attrs) {
        this[i][attrName] = attrs[attrName];
        this[i].setAttribute(attrName, attrs[attrName]);
      }
    }
  }

  return this;
} // eslint-disable-next-line


function removeAttr(attr) {
  for (var i = 0; i < this.length; i += 1) {
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
    for (var i = 0; i < this.length; i += 1) {
      if (arguments.length === 2) {
        // String
        this[i][props] = value;
      } else {
        // Object
        // eslint-disable-next-line
        for (var propName in props) {
          this[i][propName] = props[propName];
        }
      }
    }

    return this;
  }
}

function data(key, value) {
  var el;

  if (typeof value === 'undefined') {
    el = this[0]; // Get value

    if (el) {
      if (el.domElementDataStorage && key in el.domElementDataStorage) {
        return el.domElementDataStorage[key];
      }

      var dataKey = el.getAttribute("data-" + key);

      if (dataKey) {
        return dataKey;
      }

      return undefined;
    }

    return undefined;
  } // Set value


  for (var i = 0; i < this.length; i += 1) {
    el = this[i];
    if (!el.domElementDataStorage) el.domElementDataStorage = {};
    el.domElementDataStorage[key] = value;
  }

  return this;
}

function removeData(key) {
  for (var i = 0; i < this.length; i += 1) {
    var el = this[i];

    if (el.domElementDataStorage && el.domElementDataStorage[key]) {
      el.domElementDataStorage[key] = null;
      delete el.domElementDataStorage[key];
    }
  }
}

function dataset() {
  var el = this[0];
  if (!el) return undefined;
  var dataset = {}; // eslint-disable-line

  if (el.dataset) {
    // eslint-disable-next-line
    for (var dataKey in el.dataset) {
      dataset[dataKey] = el.dataset[dataKey];
    }
  } else {
    for (var i = 0; i < el.attributes.length; i += 1) {
      // eslint-disable-next-line
      var _attr = el.attributes[i];

      if (_attr.name.indexOf('data-') >= 0) {
        dataset[$.camelCase(_attr.name.split('data-')[1])] = _attr.value;
      }
    }
  } // eslint-disable-next-line


  for (var key in dataset) {
    if (dataset[key] === 'false') dataset[key] = false;else if (dataset[key] === 'true') dataset[key] = true;else if (parseFloat(dataset[key]) === dataset[key] * 1) dataset[key] *= 1;
  }

  return dataset;
}

function val(value) {
  var dom = this;

  if (typeof value === 'undefined') {
    if (dom[0]) {
      if (dom[0].multiple && dom[0].nodeName.toLowerCase() === 'select') {
        var values = [];

        for (var i = 0; i < dom[0].selectedOptions.length; i += 1) {
          values.push(dom[0].selectedOptions[i].value);
        }

        return values;
      }

      return dom[0].value;
    }

    return undefined;
  }

  for (var _i = 0; _i < dom.length; _i += 1) {
    var el = dom[_i];

    if (Array.isArray(value) && el.multiple && el.nodeName.toLowerCase() === 'select') {
      for (var j = 0; j < el.options.length; j += 1) {
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
  for (var i = 0; i < this.length; i += 1) {
    var elStyle = this[i].style;
    elStyle.webkitTransform = transform;
    elStyle.transform = transform;
  }

  return this;
}

function transition(duration) {
  if (typeof duration !== 'string') {
    duration = duration + "ms"; // eslint-disable-line
  }

  for (var i = 0; i < this.length; i += 1) {
    var elStyle = this[i].style;
    elStyle.webkitTransitionDuration = duration;
    elStyle.transitionDuration = duration;
  }

  return this;
} // Events


function on() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var eventType = args[0],
      targetSelector = args[1],
      listener = args[2],
      capture = args[3];

  if (typeof args[1] === 'function') {
    eventType = args[0];
    listener = args[1];
    capture = args[2];
    targetSelector = undefined;
  }

  if (!capture) capture = false;

  function handleLiveEvent(e) {
    var target = e.target;
    if (!target) return;
    var eventData = e.target.domEventData || [];

    if (eventData.indexOf(e) < 0) {
      eventData.unshift(e);
    }

    if ($(target).is(targetSelector)) listener.apply(target, eventData);else {
      var _parents = $(target).parents(); // eslint-disable-line


      for (var k = 0; k < _parents.length; k += 1) {
        if ($(_parents[k]).is(targetSelector)) listener.apply(_parents[k], eventData);
      }
    }
  }

  function handleEvent(e) {
    var eventData = e && e.target ? e.target.domEventData || [] : [];

    if (eventData.indexOf(e) < 0) {
      eventData.unshift(e);
    }

    listener.apply(this, eventData);
  }

  var events = eventType.split(' ');
  var j;

  for (var i = 0; i < this.length; i += 1) {
    var el = this[i];

    if (!targetSelector) {
      for (j = 0; j < events.length; j += 1) {
        var _event = events[j];
        if (!el.domListeners) el.domListeners = {};
        if (!el.domListeners[_event]) el.domListeners[_event] = [];

        el.domListeners[_event].push({
          listener: listener,
          proxyListener: handleEvent
        });

        el.addEventListener(_event, handleEvent, capture);
      }
    } else {
      // Live events
      for (j = 0; j < events.length; j += 1) {
        var _event2 = events[j];
        if (!el.domLiveListeners) el.domLiveListeners = {};
        if (!el.domLiveListeners[_event2]) el.domLiveListeners[_event2] = [];

        el.domLiveListeners[_event2].push({
          listener: listener,
          proxyListener: handleLiveEvent
        });

        el.addEventListener(_event2, handleLiveEvent, capture);
      }
    }
  }

  return this;
}

function off() {
  for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  var eventType = args[0],
      targetSelector = args[1],
      listener = args[2],
      capture = args[3];

  if (typeof args[1] === 'function') {
    eventType = args[0];
    listener = args[1];
    capture = args[2];
    targetSelector = undefined;
  }

  if (!capture) capture = false;
  var events = eventType.split(' ');

  for (var i = 0; i < events.length; i += 1) {
    var _event3 = events[i];

    for (var j = 0; j < this.length; j += 1) {
      var el = this[j];
      var handlers = void 0;

      if (!targetSelector && el.domListeners) {
        handlers = el.domListeners[_event3];
      } else if (targetSelector && el.domLiveListeners) {
        handlers = el.domLiveListeners[_event3];
      }

      if (handlers && handlers.length) {
        for (var k = handlers.length - 1; k >= 0; k -= 1) {
          var handler = handlers[k];

          if (listener && handler.listener === listener) {
            el.removeEventListener(_event3, handler.proxyListener, capture);
            handlers.splice(k, 1);
          } else if (listener && handler.listener && handler.listener.domproxy && handler.listener.domproxy === listener) {
            el.removeEventListener(_event3, handler.proxyListener, capture);
            handlers.splice(k, 1);
          } else if (!listener) {
            el.removeEventListener(_event3, handler.proxyListener, capture);
            handlers.splice(k, 1);
          }
        }
      }
    }
  }

  return this;
}

function once() {
  var dom = this;

  for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    args[_key3] = arguments[_key3];
  }

  var eventName = args[0],
      targetSelector = args[1],
      listener = args[2],
      capture = args[3];

  if (typeof args[1] === 'function') {
    eventName = args[0];
    listener = args[1];
    capture = args[2];
    targetSelector = undefined;
  }

  function onceHandler() {
    for (var _len4 = arguments.length, eventArgs = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      eventArgs[_key4] = arguments[_key4];
    }

    listener.apply(this, eventArgs);
    dom.off(eventName, targetSelector, onceHandler, capture);

    if (onceHandler.domproxy) {
      delete onceHandler.domproxy;
    }
  }

  onceHandler.domproxy = listener;
  return dom.on(eventName, targetSelector, onceHandler, capture);
}

function trigger() {
  for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
    args[_key5] = arguments[_key5];
  }

  var events = args[0].split(' ');
  var eventData = args[1];

  for (var i = 0; i < events.length; i += 1) {
    var _event4 = events[i];

    for (var j = 0; j < this.length; j += 1) {
      var el = this[j];
      var evt = void 0;

      try {
        evt = new window.CustomEvent(_event4, {
          detail: eventData,
          bubbles: true,
          cancelable: true
        });
      } catch (e) {
        evt = document.createEvent('Event');
        evt.initEvent(_event4, true, true);
        evt.detail = eventData;
      } // eslint-disable-next-line


      el.domEventData = args.filter(function (data, dataIndex) {
        return dataIndex > 0;
      });
      el.dispatchEvent(evt);
      el.domEventData = [];
      delete el.domEventData;
    }
  }

  return this;
}

function transitionEnd(callback) {
  var events = ['webkitTransitionEnd', 'transitionend'];
  var dom = this;
  var i;

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
  var events = ['webkitAnimationEnd', 'animationend'];
  var dom = this;
  var i;

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
      var _styles = this.styles();

      return this[0].offsetWidth + parseFloat(_styles.getPropertyValue('margin-right')) + parseFloat(_styles.getPropertyValue('margin-left'));
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
      var _styles2 = this.styles();

      return this[0].offsetHeight + parseFloat(_styles2.getPropertyValue('margin-top')) + parseFloat(_styles2.getPropertyValue('margin-bottom'));
    }

    return this[0].offsetHeight;
  }

  return null;
}

function offset() {
  if (this.length > 0) {
    var el = this[0];
    var box = el.getBoundingClientRect();
    var body = document.body;
    var clientTop = el.clientTop || body.clientTop || 0;
    var clientLeft = el.clientLeft || body.clientLeft || 0;
    var scrollTop = el === window ? window.scrollY : el.scrollTop;
    var scrollLeft = el === window ? window.scrollX : el.scrollLeft;
    return {
      top: box.top + scrollTop - clientTop,
      left: box.left + scrollLeft - clientLeft
    };
  }

  return null;
}

function hide() {
  for (var i = 0; i < this.length; i += 1) {
    this[i].style.display = 'none';
  }

  return this;
}

function show() {
  return this.each(function () {
    this.style.display === 'none' && (this.style.display = '');
    if (getComputedStyle(this, '').getPropertyValue('display') === 'none') this.style.display = 'block'; //defaultDisplay(this.nodeName)
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
  var i;

  if (arguments.length === 1) {
    if (typeof props === 'string') {
      if (this[0]) return window.getComputedStyle(this[0], null).getPropertyValue(props);
    } else {
      for (i = 0; i < this.length; i += 1) {
        // eslint-disable-next-line
        for (var _prop in props) {
          this[i].style[_prop] = props[_prop];
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
  var arr = [];

  for (var i = 0; i < this.length; i += 1) {
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
  var matchedItems = [];
  var dom = this;

  for (var i = 0; i < dom.length; i += 1) {
    if (callback.call(dom[i], i, dom[i])) matchedItems.push(dom[i]);
  }

  return new Dom(matchedItems);
}

function map(callback) {
  var modifiedItems = [];
  var dom = this;

  for (var i = 0; i < dom.length; i += 1) {
    modifiedItems.push(callback.call(dom[i], i, dom[i]));
  }

  return new Dom(modifiedItems);
} // eslint-disable-next-line


function html(html) {
  if (typeof html === 'undefined') {
    return this[0] ? this[0].innerHTML : undefined;
  }

  for (var i = 0; i < this.length; i += 1) {
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

  for (var i = 0; i < this.length; i += 1) {
    this[i].textContent = text;
  }

  return this;
}

function is(selector) {
  var el = this[0];
  var compareWith;
  var i;
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
  for (var i = 0; i < this.length; i += 1) {
    if (this[i] === el) return i;
  }

  return -1;
}

function index() {
  var child = this[0];
  var i;

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
  var length = this.length;
  var returnIndex;

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

function append() {
  var newChild;

  for (var k = 0; k < arguments.length; k += 1) {
    newChild = k < 0 || arguments.length <= k ? undefined : arguments[k];

    for (var i = 0; i < this.length; i += 1) {
      if (typeof newChild === 'string') {
        var tempDiv = document.createElement('div');
        tempDiv.innerHTML = newChild;

        while (tempDiv.firstChild) {
          this[i].appendChild(tempDiv.firstChild);
        }
      } else if (newChild instanceof Dom) {
        for (var j = 0; j < newChild.length; j += 1) {
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
  var i;
  var j;

  for (i = 0; i < this.length; i += 1) {
    if (typeof newChild === 'string') {
      var tempDiv = document.createElement('div');
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
  var before = $(selector);

  for (var i = 0; i < this.length; i += 1) {
    if (before.length === 1) {
      before[0].parentNode.insertBefore(this[i], before[0]);
    } else if (before.length > 1) {
      for (var j = 0; j < before.length; j += 1) {
        before[j].parentNode.insertBefore(this[i].cloneNode(true), before[j]);
      }
    }
  }
}

function insertAfter(selector) {
  var after = $(selector);

  for (var i = 0; i < this.length; i += 1) {
    if (after.length === 1) {
      after[0].parentNode.insertBefore(this[i], after[0].nextSibling);
    } else if (after.length > 1) {
      for (var j = 0; j < after.length; j += 1) {
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
  var nextEls = [];
  var el = this[0];
  if (!el) return new Dom([]);

  while (el.nextElementSibling) {
    var _next = el.nextElementSibling; // eslint-disable-line

    if (selector) {
      if ($(_next).is(selector)) nextEls.push(_next);
    } else nextEls.push(_next);

    el = _next;
  }

  return new Dom(nextEls);
}

function prev(selector) {
  if (this.length > 0) {
    var el = this[0];

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
  var prevEls = [];
  var el = this[0];
  if (!el) return new Dom([]);

  while (el.previousElementSibling) {
    var _prev = el.previousElementSibling; // eslint-disable-line

    if (selector) {
      if ($(_prev).is(selector)) prevEls.push(_prev);
    } else prevEls.push(_prev);

    el = _prev;
  }

  return new Dom(prevEls);
}

function siblings(selector) {
  return this.nextAll(selector).add(this.prevAll(selector));
}

function parent(selector) {
  var parents = []; // eslint-disable-line

  for (var i = 0; i < this.length; i += 1) {
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
  var parents = []; // eslint-disable-line

  for (var i = 0; i < this.length; i += 1) {
    var _parent = this[i].parentNode; // eslint-disable-line

    while (_parent) {
      if (selector) {
        if ($(_parent).is(selector)) parents.push(_parent);
      } else {
        parents.push(_parent);
      }

      _parent = _parent.parentNode;
    }
  }

  return $($.uniq(parents));
}

function closest(selector) {
  var closest = this; // eslint-disable-line

  if (typeof selector === 'undefined') {
    return new Dom([]);
  }

  if (!closest.is(selector)) {
    closest = closest.parents(selector).eq(0);
  }

  return closest;
}

function find(selector) {
  var foundElements = [];

  for (var i = 0; i < this.length; i += 1) {
    var found = this[i].querySelectorAll(selector);

    for (var j = 0; j < found.length; j += 1) {
      foundElements.push(found[j]);
    }
  }

  return new Dom(foundElements);
}

function children(selector) {
  var children = []; // eslint-disable-line

  for (var i = 0; i < this.length; i += 1) {
    var childNodes = this[i].childNodes;

    for (var j = 0; j < childNodes.length; j += 1) {
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
  for (var i = 0; i < this.length; i += 1) {
    if (this[i].parentNode) this[i].parentNode.removeChild(this[i]);
  }

  return this;
}

function detach() {
  return this.remove();
}

function add() {
  var dom = this;
  var i;
  var j;

  for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
    args[_key6] = arguments[_key6];
  }

  for (i = 0; i < args.length; i += 1) {
    var toAdd = $(args[i]);

    for (j = 0; j < toAdd.length; j += 1) {
      dom[dom.length] = toAdd[j];
      dom.length += 1;
    }
  }

  return dom;
}

function empty() {
  for (var i = 0; i < this.length; i += 1) {
    var el = this[i];

    if (el.nodeType === 1) {
      for (var j = 0; j < el.childNodes.length; j += 1) {
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
 * 是否包含子元�
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
 * 下一个子元素节点，不含或文本节点
 */


function nextNode() {
  var R = null;
  if (!this.dom || this.dom.children.length === 0) return null;
  var nd = this.dom.nextSibling;

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
 * 返回的上级节点名称的元素节点
 * ff parentNode 会返�?�?节点
 * ff textNode节点 没有 tagName
 */


function upperTag(tag, len) {
  if (len === void 0) {
    len = 10;
  }

  var RC = null;
  if (!this.dom) return null;
  var tg = tag.toUpperCase();
  var i = 0;
  var nd = this.dom;

  while (nd) {
    i++;
    if (i >= len) break;

    if (nd.tagName && nd.tagName.toUpperCase() === tg) {
      RC = nd;
      break;
    }

    nd = nd.parentNode;
  }

  return RC;
}
/**
 * 获取 指定 tagName的子元素
 * @param tag
 * @returns {*}
 */


function childTag(tag) {
  var RC = null;
  if (!this.dom) return null;

  try {
    for (var i = 0, len = this.dom.children.length; i < len; i++) {
      var nd = this.dom.children[i];

      if (nd.tagName && nd.tagName.toUpperCase() === tag.toUpperCase()) {
        RC = nd;
        break;
      }
    }
  } catch (e) {
    alert("childTag exp:" + e.message);
  }

  return RC;
}
/**
 * 光标放入尾部
 * @param el
 */


function cursorEnd() {
  if (!this.dom) return null;
  var el = this.dom;
  el.focus();

  if (typeof window.getSelection !== 'undefined' && typeof document.createRange !== 'undefined') {
    var rg = document.createRange();
    rg.selectNodeContents(el); // 合并光标

    rg.collapse(false);
    var sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(rg);
  } else if (typeof document.body.createTextRangrge !== 'undefined') {
    var _rg = document.body.createTextRange();

    _rg.moveToElementText(el); // 合并光标


    _rg.collapse(false); // textRange.moveStart('character', 3);


    _rg.select();
  }
}
/**
 * 获取光标位置
 * @returns {number}
 */


function getCursorPos() {
  var R = 0;
  if (!this.dom) return 0;
  var el = this.dom; // obj.focus();

  if (el.selectionStart) {
    // IE以外
    R = el.selectionStart;
  } else {
    // IE
    var rg = null;

    if (el.tagName.toLowerCase() === 'textarea') {
      // TEXTAREA
      rg = event.srcElement.createTextRange();
      rg.moveToPoint(event.x, event.y);
    } else {
      // Text
      rg = document.selection.createRange();
    }

    rg.moveStart('character', -event.srcElement.value.length); // rg.setEndPoint("StartToStart", obj.createTextRange())

    R = rg.text.length;
  }

  return R;
}
/**
 * 得到光标的位�
 */


function getCursorPosition() {
  if (!this.dom) return 0;
  var el = this.dom;
  var qswh = '@#%#^&#*$'; // obj.focus();

  var rng = document.selection.createRange();
  rng.text = qswh;
  var nPosition = el.value.indexOf(qswh);
  rng.moveStart('character', -qswh.length);
  rng.text = '';
  return nPosition;
}
/**
 * 设置光标位置
 */


function setCursorPos(pos) {
  if (!this.dom) return;
  var rg = this.dom.createTextRange();
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

var Methods = /*#__PURE__*/Object.freeze({
  __proto__: null,
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
  firstChild: firstChild,
  lastChild: lastChild,
  nextNode: nextNode,
  childCount: childCount,
  upperTag: upperTag,
  childTag: childTag,
  cursorEnd: cursorEnd,
  getCursorPos: getCursorPos,
  getCursorPosition: getCursorPosition,
  setCursorPos: setCursorPos,
  moveFirst: moveFirst,
  remove: remove,
  detach: detach,
  add: add,
  empty: empty
});

function scrollTo() {
  for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
    args[_key] = arguments[_key];
  }

  var left = args[0],
      top = args[1],
      duration = args[2],
      easing = args[3],
      callback = args[4];

  if (args.length === 4 && typeof easing === 'function') {
    callback = easing;
    left = args[0];
    top = args[1];
    duration = args[2];
    callback = args[3];
    easing = args[4];
  }

  if (typeof easing === 'undefined') easing = 'swing';
  return this.each(function animate() {
    var el = this;
    var currentTop;
    var currentLeft;
    var maxTop;
    var maxLeft;
    var newTop;
    var newLeft;
    var scrollTop; // eslint-disable-line

    var scrollLeft; // eslint-disable-line

    var animateTop = top > 0 || top === 0;
    var animateLeft = left > 0 || left === 0;

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

    var startTime = null;
    if (animateTop && newTop === currentTop) animateTop = false;
    if (animateLeft && newLeft === currentLeft) animateLeft = false;

    function render(time) {
      if (time === void 0) {
        time = new Date().getTime();
      }

      if (startTime === null) {
        startTime = time;
      }

      var progress = Math.max(Math.min((time - startTime) / duration, 1), 0);
      var easeProgress = easing === 'linear' ? progress : 0.5 - Math.cos(progress * Math.PI) / 2;
      var done;
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


function scrollTop() {
  for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  var top = args[0],
      duration = args[1],
      easing = args[2],
      callback = args[3];

  if (args.length === 3 && typeof easing === 'function') {
    top = args[0];
    duration = args[1];
    callback = args[2];
    easing = args[3];
  }

  var dom = this;

  if (typeof top === 'undefined') {
    if (dom.length > 0) return dom[0].scrollTop;
    return null;
  }

  return dom.scrollTo(undefined, top, duration, easing, callback);
}

function scrollLeft() {
  for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    args[_key3] = arguments[_key3];
  }

  var left = args[0],
      duration = args[1],
      easing = args[2],
      callback = args[3];

  if (args.length === 3 && typeof easing === 'function') {
    left = args[0];
    duration = args[1];
    callback = args[2];
    easing = args[3];
  }

  var dom = this;

  if (typeof left === 'undefined') {
    if (dom.length > 0) return dom[0].scrollLeft;
    return null;
  }

  return dom.scrollTo(left, undefined, duration, easing, callback);
}

var Scroll = /*#__PURE__*/Object.freeze({
  __proto__: null,
  scrollTo: scrollTo,
  scrollTop: scrollTop,
  scrollLeft: scrollLeft
});

function animate(initialProps, initialParams) {
  var els = this;
  var a = {
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
    easingProgress: function easingProgress(easing, progress) {
      if (easing === 'swing') {
        return 0.5 - Math.cos(progress * Math.PI) / 2;
      }

      if (typeof easing === 'function') {
        return easing(progress);
      }

      return progress;
    },
    stop: function stop() {
      if (a.frameId) {
        $.cancelAnimationFrame(a.frameId);
      }

      a.animating = false;
      a.elements.each(function (index, el) {
        var element = el;
        delete element.dom7AnimateInstance;
      });
      a.que = [];
    },
    done: function done(complete) {
      a.animating = false;
      a.elements.each(function (index, el) {
        var element = el;
        delete element.domAnimateInstance;
      });
      if (complete) complete(els);

      if (a.que.length > 0) {
        var que = a.que.shift();
        a.animate(que[0], que[1]);
      }
    },
    animate: function animate(props, params) {
      if (a.animating) {
        a.que.push([props, params]);
        return a;
      }

      var elements = []; // Define & Cache Initials & Units

      a.elements.each(function (index, el) {
        var initialFullValue;
        var initialValue;
        var unit;
        var finalValue;
        var finalFullValue;
        if (!el.dom7AnimateInstance) a.elements[index].domAnimateInstance = a;
        elements[index] = {
          container: el
        };
        Object.keys(props).forEach(function (prop) {
          initialFullValue = window.getComputedStyle(el, null).getPropertyValue(prop).replace(',', '.');
          initialValue = parseFloat(initialFullValue);
          unit = initialFullValue.replace(initialValue, '');
          finalValue = parseFloat(props[prop]);
          finalFullValue = props[prop] + unit;
          elements[index][prop] = {
            initialFullValue: initialFullValue,
            initialValue: initialValue,
            unit: unit,
            finalValue: finalValue,
            finalFullValue: finalFullValue,
            currentValue: initialValue
          };
        });
      });
      var startTime = null;
      var time;
      var elementsDone = 0;
      var propsDone = 0;
      var done;
      var began = false;
      a.animating = true;

      function render() {
        time = new Date().getTime();
        var progress;
        var easeProgress; // let el;

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

        elements.forEach(function (element) {
          var el = element;
          if (done || el.done) return;
          Object.keys(props).forEach(function (prop) {
            if (done || el.done) return;
            progress = Math.max(Math.min((time - startTime) / params.duration, 1), 0);
            easeProgress = a.easingProgress(params.easing, progress);
            var _el$prop = el[prop],
                initialValue = _el$prop.initialValue,
                finalValue = _el$prop.finalValue,
                unit = _el$prop.unit;
            el[prop].currentValue = initialValue + easeProgress * (finalValue - initialValue);
            var currentValue = el[prop].currentValue;

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

  var animateInstance;

  for (var i = 0; i < a.elements.length; i += 1) {
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
  var els = this;

  for (var i = 0; i < els.length; i += 1) {
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


$.getTranslate = function (el, axis) {
  if (axis === void 0) {
    axis = 'x';
  }

  var matrix;
  var curTransform;
  var transformMatrix;
  var curStyle = window.getComputedStyle(el, null);

  if (window.WebKitCSSMatrix) {
    curTransform = curStyle.transform || curStyle.webkitTransform;

    if (curTransform.split(',').length > 6) {
      curTransform = curTransform.split(', ').map(function (a) {
        return a.replace(',', '.');
      }).join(', ');
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

function getTranslate(axis) {
  if (axis === void 0) {
    axis = 'x';
  }

  var R = 0;
  var els = this;
  if (els && els.dom) R = $.getTranslate(els.dom, axis);
  return R;
}

var Animate = /*#__PURE__*/Object.freeze({
  __proto__: null,
  animate: animate,
  stop: stop,
  getTranslate: getTranslate
});

var noTrigger = 'resize scroll'.split(' ');

function eventShortcut(name) {
  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  if (typeof args[0] === 'undefined') {
    for (var i = 0; i < this.length; i += 1) {
      if (noTrigger.indexOf(name) < 0) {
        if (name in this[i]) this[i][name]();else {
          $(this[i]).trigger(name);
        }
      }
    }

    return this;
  }

  return this.on.apply(this, [name].concat(args));
}

function click() {
  for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
    args[_key2] = arguments[_key2];
  }

  return eventShortcut.bind(this).apply(void 0, ['click'].concat(args));
}

function blur() {
  for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    args[_key3] = arguments[_key3];
  }

  return eventShortcut.bind(this).apply(void 0, ['blur'].concat(args));
}

function focus() {
  for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
    args[_key4] = arguments[_key4];
  }

  return eventShortcut.bind(this).apply(void 0, ['focus'].concat(args));
}

function focusin() {
  for (var _len5 = arguments.length, args = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
    args[_key5] = arguments[_key5];
  }

  return eventShortcut.bind(this).apply(void 0, ['focusin'].concat(args));
}

function focusout() {
  for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
    args[_key6] = arguments[_key6];
  }

  return eventShortcut.bind(this).apply(void 0, ['focusout'].concat(args));
}

function keyup() {
  for (var _len7 = arguments.length, args = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
    args[_key7] = arguments[_key7];
  }

  return eventShortcut.bind(this).apply(void 0, ['keyup'].concat(args));
}

function keydown() {
  for (var _len8 = arguments.length, args = new Array(_len8), _key8 = 0; _key8 < _len8; _key8++) {
    args[_key8] = arguments[_key8];
  }

  return eventShortcut.bind(this).apply(void 0, ['keydown'].concat(args));
}

function keypress() {
  for (var _len9 = arguments.length, args = new Array(_len9), _key9 = 0; _key9 < _len9; _key9++) {
    args[_key9] = arguments[_key9];
  }

  return eventShortcut.bind(this).apply(void 0, ['keypress'].concat(args));
}

function submit() {
  for (var _len10 = arguments.length, args = new Array(_len10), _key10 = 0; _key10 < _len10; _key10++) {
    args[_key10] = arguments[_key10];
  }

  return eventShortcut.bind(this).apply(void 0, ['submit'].concat(args));
}

function change() {
  for (var _len11 = arguments.length, args = new Array(_len11), _key11 = 0; _key11 < _len11; _key11++) {
    args[_key11] = arguments[_key11];
  }

  return eventShortcut.bind(this).apply(void 0, ['change'].concat(args));
}

function mousedown() {
  for (var _len12 = arguments.length, args = new Array(_len12), _key12 = 0; _key12 < _len12; _key12++) {
    args[_key12] = arguments[_key12];
  }

  return eventShortcut.bind(this).apply(void 0, ['mousedown'].concat(args));
}

function mousemove() {
  for (var _len13 = arguments.length, args = new Array(_len13), _key13 = 0; _key13 < _len13; _key13++) {
    args[_key13] = arguments[_key13];
  }

  return eventShortcut.bind(this).apply(void 0, ['mousemove'].concat(args));
}

function mouseup() {
  for (var _len14 = arguments.length, args = new Array(_len14), _key14 = 0; _key14 < _len14; _key14++) {
    args[_key14] = arguments[_key14];
  }

  return eventShortcut.bind(this).apply(void 0, ['mouseup'].concat(args));
}

function mouseenter() {
  for (var _len15 = arguments.length, args = new Array(_len15), _key15 = 0; _key15 < _len15; _key15++) {
    args[_key15] = arguments[_key15];
  }

  return eventShortcut.bind(this).apply(void 0, ['mouseenter'].concat(args));
}

function mouseleave() {
  for (var _len16 = arguments.length, args = new Array(_len16), _key16 = 0; _key16 < _len16; _key16++) {
    args[_key16] = arguments[_key16];
  }

  return eventShortcut.bind(this).apply(void 0, ['mouseleave'].concat(args));
}

function mouseout() {
  for (var _len17 = arguments.length, args = new Array(_len17), _key17 = 0; _key17 < _len17; _key17++) {
    args[_key17] = arguments[_key17];
  }

  return eventShortcut.bind(this).apply(void 0, ['mouseout'].concat(args));
}

function mouseover() {
  for (var _len18 = arguments.length, args = new Array(_len18), _key18 = 0; _key18 < _len18; _key18++) {
    args[_key18] = arguments[_key18];
  }

  return eventShortcut.bind(this).apply(void 0, ['mouseover'].concat(args));
}

function touchstart() {
  for (var _len19 = arguments.length, args = new Array(_len19), _key19 = 0; _key19 < _len19; _key19++) {
    args[_key19] = arguments[_key19];
  }

  return eventShortcut.bind(this).apply(void 0, ['touchstart'].concat(args));
}

function touchend() {
  for (var _len20 = arguments.length, args = new Array(_len20), _key20 = 0; _key20 < _len20; _key20++) {
    args[_key20] = arguments[_key20];
  }

  return eventShortcut.bind(this).apply(void 0, ['touchend'].concat(args));
}

function touchmove() {
  for (var _len21 = arguments.length, args = new Array(_len21), _key21 = 0; _key21 < _len21; _key21++) {
    args[_key21] = arguments[_key21];
  }

  return eventShortcut.bind(this).apply(void 0, ['touchmove'].concat(args));
}

function resize() {
  for (var _len22 = arguments.length, args = new Array(_len22), _key22 = 0; _key22 < _len22; _key22++) {
    args[_key22] = arguments[_key22];
  }

  return eventShortcut.bind(this).apply(void 0, ['resize'].concat(args));
}

function scroll() {
  for (var _len23 = arguments.length, args = new Array(_len23), _key23 = 0; _key23 < _len23; _key23++) {
    args[_key23] = arguments[_key23];
  }

  return eventShortcut.bind(this).apply(void 0, ['scroll'].concat(args));
}

var eventShortcuts = /*#__PURE__*/Object.freeze({
  __proto__: null,
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
[Methods, Scroll, Animate, eventShortcuts].forEach(function (group) {
  Object.keys(group).forEach(function (methodName) {
    $.fn[methodName] = group[methodName];
  });
});

module.exports = $;
