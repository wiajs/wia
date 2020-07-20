/*!
  * wia dom v0.1.11
  * (c) 2020 Sibyl Yu
  * @license MIT
  */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

/*!
 * Expand $.fn
 * 扩展 $.fn
 * same syntax as well known jQuery library
 */
var Dom = window.$.Dom;
var emptyArray = [];
var elementDisplay = {};

function ready(cb) {
  if (/complete|loaded|interactive/.test(document.readyState) && document.body) cb($);else document.addEventListener('DOMContentLoaded', function () {
    cb($);
  }, false);
  return this;
}

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
}

function hasAttr(name) {
  return emptyArray.some.call(this, function (el) {
    return el.hasAttribute(name);
  });
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
} // 读取或设置 data-* 属性值，保持与jQuery 兼容
// 在dom节点上自定义 domElementDataStorage 对象存储数据


function data(key, value) {
  var R;
  var el;
  var attrName = 'data-' + key.replace(/([A-Z])/g, '-$1').toLowerCase();

  if (typeof value === 'undefined') {
    el = this[0]; // Get value

    if (el) {
      if (el.domElementDataStorage && key in el.domElementDataStorage) {
        R = el.domElementDataStorage[key];
      } else R = this.attr(attrName);
    }

    if (R) R = $.deserializeValue(R);
  } else {
    // Set value
    for (var i = 0; i < this.length; i += 1) {
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
  var attrName = 'data-' + key.replace(/([A-Z])/g, '-$1').toLowerCase();

  for (var i = 0; i < this.length; i += 1) {
    var el = this[i];

    if (el.domElementDataStorage && el.domElementDataStorage[key]) {
      el.domElementDataStorage[key] = null;
      delete el.domElementDataStorage[key];
    }

    el.removeAttribute(attrName);
  }

  return this;
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
    dataset[key] = $.deserializeValue(dataset[key]);
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
}
/**
 * 事件响应
 * targetSelector 参数一般很少用
 * click 300ms late，use touch Trigger immediately
 * swipe 滑动事件上下左右四个方向，滑动距离超过10px，则触发回调函数
 * 触发回调函数，参数为 (ev, {x, y})，x y互斥，只有一个有值
 * press 按压事件，超过 1秒，移动距离小于 5px，为 press 事件
 */


function on() {
  var _this2 = this;

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
  } // 事件响应，可通过el的domEventData 带额外参数，dom事件中的 event作为第一个参数


  function handleEvent() {
    var _ref, _vs$, _vs$$target, _vs$2, _vs$2$target;

    for (var _len2 = arguments.length, vs = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      vs[_key2] = arguments[_key2];
    }

    var ds = (_ref = (_vs$ = vs[0]) === null || _vs$ === void 0 ? void 0 : (_vs$$target = _vs$.target) === null || _vs$$target === void 0 ? void 0 : _vs$$target.domEventData) !== null && _ref !== void 0 ? _ref : [];
    var rs = [].concat(vs, ds);
    listener.apply(this, rs); // 清除 domEventData 附加数据

    if ((_vs$2 = vs[0]) === null || _vs$2 === void 0 ? void 0 : (_vs$2$target = _vs$2.target) === null || _vs$2$target === void 0 ? void 0 : _vs$2$target.domEventData) {
      vs[0].target.domEventData = [];
      delete vs[0].target.domEventData;
    }
  } // Prevent duplicate clicks
  // click事件响应，参数为 domEventData，而不是dom事件中的 event


  function clickEvent(e) {
    var _this = this;

    // disabled not trigger event
    if (this.hasAttribute('disabled')) {
      e.stopPropagation();
      return false;
    } // Prevent duplicate clicks


    this.setAttribute('disabled', 'true');
    setTimeout(function () {
      try {
        _this.removeAttribute('disabled');
      } catch (ex) {
        console.log('clickEvent ', {
          ex: ex.message
        });
      }
    }, 500); // wait 500 ms, can click again

    var eventData = e && e.target ? e.target.domEventData || [] : [];

    if (eventData.indexOf(e) < 0) {
      eventData.unshift(e);
    }

    listener.apply(this, eventData);
  } // on 函数内共享闭包变量


  var touch = {};

  function touchStart(e) {
    var _ref2, _touch$el$rect, _ref3, _touch$el$rect2;

    // ev.preventDefault(); // 默认行为为滚动屏幕
    // touch.x = e.targetTouches[0].pageX; // pageX 相对文档的位置
    touch.x = e.targetTouches[0].pageX; // targetTouches clientX 可见视口位置，pageX 文档位置

    touch.y = e.targetTouches[0].pageY;
    touch.el = $(e.target);
    touch.top = (_ref2 = (_touch$el$rect = touch.el.rect()) === null || _touch$el$rect === void 0 ? void 0 : _touch$el$rect.top) !== null && _ref2 !== void 0 ? _ref2 : 0;
    touch.left = (_ref3 = (_touch$el$rect2 = touch.el.rect()) === null || _touch$el$rect2 === void 0 ? void 0 : _touch$el$rect2.left) !== null && _ref3 !== void 0 ? _ref3 : 0;
    touch.time = new Date().getTime();
    touch.trigger = false;
    touch.scrollY = false;
    var pg = touch.el.closest('.page-content').dom;

    if (pg) {
      touch.scrollY = true;
      if (pg.scrollTop === 0 || pg.scrollTop + pg.clientHeight === pg.scrollHeight) touch.scrollY = false;
    }
  }

  function touchMove(e) {
    var _ref4, _touch$el$rect3, _ref5, _touch$el$rect4;

    if (eventType !== 'swipe' || touch.trigger) return;
    var x = Math.round(e.targetTouches[0].pageX - touch.x);
    var y = Math.round(e.targetTouches[0].pageY - touch.y);
    var top = Math.round(((_ref4 = (_touch$el$rect3 = touch.el.rect()) === null || _touch$el$rect3 === void 0 ? void 0 : _touch$el$rect3.top) !== null && _ref4 !== void 0 ? _ref4 : 0) - touch.top);
    var left = Math.round(((_ref5 = (_touch$el$rect4 = touch.el.rect()) === null || _touch$el$rect4 === void 0 ? void 0 : _touch$el$rect4.left) !== null && _ref5 !== void 0 ? _ref5 : 0) - touch.left); // 计算手指在屏幕上的滑动距离，减掉页面跟随手指滚动的距离

    var mx = Math.abs(x - left);
    var my = Math.abs(y - top); // 页面不滚动，滑动超过12px，触发滑动事件，页面滚动则不触发

    if (my > 15 && mx < 8 && top === 0 && !touch.scrollY) {
      touch.trigger = true; // move 会反复触发，事件只触发一次

      return handleEvent.call(this, e, {
        x: 0,
        y: y
      });
    }

    if (mx > 12 && my < 8 && left === 0 && top === 0) {
      // ev.preventDefault(); // 不阻止后续的 onclick 事件，否则后续onclick 不会触发
      touch.trigger = true; // move 会反复触发，事件只触发一次

      return handleEvent.call(this, e, {
        x: x,
        y: 0
      });
    }
  } // 同时具备 press click，需分开两个函数监听，触发两次，否则只能触发一次


  function clickEnd(e) {
    return touchEnd.call(this, e);
  }

  function pressEnd(e) {
    return touchEnd.call(this, e);
  }

  function touchEnd(e) {
    if (eventType !== 'click' && eventType !== 'press') return;
    touch.trigger = false;
    var x = Math.abs(e.changedTouches[0].pageX - touch.x);
    var y = Math.abs(e.changedTouches[0].pageY - touch.y);
    var tm = new Date().getTime() - touch.time; // console.log('dom touchEnd', {x, y});

    if (x <= 5 && y <= 5) {
      // ev.preventDefault(); // 不阻止后续的 onclick 事件，否则后续onclick 不会触发
      if (tm < 500 && eventType === 'click') return clickEvent.call(this, e);
      if (tm > 500 && eventType === 'press') return handleEvent.call(this, e);
    }
  }

  var events = eventType.split(' ');
  var j;

  var _loop = function _loop(i) {
    var el = _this2[i]; // 未设置目标选择器

    if (!targetSelector) {
      for (j = 0; j < events.length; j += 1) {
        var _event = events[j];
        if (!el.domListeners) el.domListeners = {};
        if (!el.domListeners[_event]) el.domListeners[_event] = [];

        if ($.support.touch && (_event === 'click' || _event === 'swipe' || _event === 'press')) {
          (function () {
            var lis = {
              capture: capture,
              listener: listener,
              proxyListener: [touchStart]
            };
            var passive = capture;

            if (_event === 'swipe') {
              if ($.support.passiveListener) passive = {
                passive: true,
                capture: capture
              };
              lis.proxyListener.push(touchMove);
            } else if (_event === 'click') lis.proxyListener.push(clickEnd);else if (_event === 'press') lis.proxyListener.push(pressEnd);

            el.domListeners[_event].push(lis);

            lis.proxyListener.forEach(function (v) {
              var type = v.name.toLowerCase();
              if (type === 'clickend' || type === 'pressend') type = 'touchend';
              el.addEventListener(type, v, passive);
            });
          })();
        } else if (_event === 'click') {
          el.domListeners[_event].push({
            capture: capture,
            listener: listener,
            proxyListener: clickEvent
          });

          el.addEventListener(_event, clickEvent, capture);
        } else {
          // 其他事件
          el.domListeners[_event].push({
            capture: capture,
            listener: listener,
            proxyListener: handleEvent
          });

          el.addEventListener(_event, handleEvent, capture);
        }
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
  };

  for (var i = 0; i < this.length; i += 1) {
    _loop(i);
  }

  return this;
}

function off() {
  for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
    args[_key3] = arguments[_key3];
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
          var handler = handlers[k]; // 事件响应对象数组
          // 停止指定的响应函数

          if (listener && handler.listener === listener) {
            if ((_event3 === 'click' || _event3 === 'swipe' || _event3 === 'press') && $.support.touch) {
              el.removeEventListener('touchstart', handler.proxyListener[0], handler.capture);
              if (_event3 === 'swipe') el.removeEventListener('touchmove', handler.proxyListener[1], handler.capture);else el.removeEventListener('touchend', handler.proxyListener[1], handler.capture);
            } else el.removeEventListener(_event3, handler.proxyListener, handler.capture);

            handlers.splice(k, 1);
          } else if (listener && handler.listener && handler.listener.domproxy && handler.listener.domproxy === listener) {
            el.removeEventListener(_event3, handler.proxyListener, handler.capture);
            handlers.splice(k, 1);
          } else if (!listener) {
            el.removeEventListener(_event3, handler.proxyListener, handler.capture);
            handlers.splice(k, 1);
          }
        }
      }
    }
  }

  return this;
}

function once() {
  var self = this;

  for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
    args[_key4] = arguments[_key4];
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
  } // 封装 回调函数，执行一次后自动 off


  function onceHandler() {
    for (var _len5 = arguments.length, eventArgs = new Array(_len5), _key5 = 0; _key5 < _len5; _key5++) {
      eventArgs[_key5] = arguments[_key5];
    }

    listener.apply(this, eventArgs);
    self.off(eventName, targetSelector, onceHandler, capture);

    if (onceHandler.domproxy) {
      delete onceHandler.domproxy;
    }
  }

  onceHandler.domproxy = listener;
  return self.on(eventName, targetSelector, onceHandler, capture);
}

function trigger() {
  for (var _len6 = arguments.length, args = new Array(_len6), _key6 = 0; _key6 < _len6; _key6++) {
    args[_key6] = arguments[_key6];
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
/**
 * 兼容 jQuery，dom7 是错误的
 * wia 中，window 滚动被 .page-content 页面层替代
 */


function offset(coordinates) {
  if (coordinates) return this.each(function (index) {
    var $this = $(this),
        coords = $.funcArg(this, coordinates, index, $this.offset()),
        parentOffset = $this.offsetParent().offset(),
        props = {
      top: coords.top - parentOffset.top,
      left: coords.left - parentOffset.left
    };
    if ($this.css('position') == 'static') props['position'] = 'relative';
    $this.css(props);
  });
  if (!this.length) return null;
  if (document.documentElement !== this[0] && !$.contains(document.documentElement, this[0])) return {
    top: 0,
    left: 0
  };
  var obj = this[0].getBoundingClientRect();
  var pg = this.closest('.page-content');
  var scrollX = pg.length ? pg.dom.scrollLeft : window.pageXOffset;
  var scrollY = pg.length ? pg.dom.scrollTop : window.pageYOffset;
  return {
    left: obj.left + scrollX,
    top: obj.top + scrollY,
    width: Math.round(obj.width),
    height: Math.round(obj.height)
  };
}

function rect() {
  if (!this.length) return null;
  if (document.documentElement !== this[0] && !$.contains(document.documentElement, this[0])) return {
    top: 0,
    left: 0
  };
  var obj = this[0].getBoundingClientRect();
  return {
    left: obj.left,
    top: obj.top,
    width: Math.round(obj.width),
    height: Math.round(obj.height)
  };
}

function hide() {
  return this.each(function () {
    if (this.style.display != 'none') this.style.display = 'none';
  });
}

function defaultDisplay(nodeName) {
  var element, display;

  if (!elementDisplay[nodeName]) {
    element = document.createElement(nodeName);
    document.body.appendChild(element);
    display = getComputedStyle(element, '').getPropertyValue('display');
    element.parentNode.removeChild(element);
    display == 'none' && (display = 'block');
    elementDisplay[nodeName] = display;
  }

  return elementDisplay[nodeName];
}

function show() {
  return this.each(function () {
    this.style.display === 'none' && (this.style.display = ''); // Still not visible

    if (getComputedStyle(this, '').getPropertyValue('display') === 'none') this.style.display = defaultDisplay(this.nodeName); // block
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
  var REGEXP_SUFFIX = /^width|height|left|top|marginLeft|marginTop|paddingLeft|paddingTop$/;
  var i;

  if (arguments.length === 1) {
    if (typeof props === 'string') {
      if (this[0]) return window.getComputedStyle(this[0], null).getPropertyValue(props);
    } else {
      for (i = 0; i < this.length; i += 1) {
        // eslint-disable-next-line
        for (var _prop in props) {
          var _val = props[_prop];
          if (REGEXP_SUFFIX.test(_prop) && $.isNumber(_val)) _val = _val + "px";
          this[i].style[_prop] = _val;
        }
      }

      return this;
    }
  }

  if (arguments.length === 2 && typeof props === 'string') {
    for (i = 0; i < this.length; i += 1) {
      var _val2 = value;
      if (REGEXP_SUFFIX.test(props) && $.isNumber(_val2)) _val2 = _val2 + "px";
      this[i].style[props] = _val2;
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


function filter(cb) {
  var matchedItems = [];
  var dom = this;

  for (var i = 0; i < dom.length; i += 1) {
    if (cb.call(dom[i], i, dom[i])) matchedItems.push(dom[i]);
  }

  return new Dom(matchedItems);
}

function map(cb) {
  var modifiedItems = [];
  var dom = this;

  for (var i = 0; i < dom.length; i += 1) {
    modifiedItems.push(cb.call(dom[i], i, dom[i]));
  }

  return new Dom(modifiedItems);
}

function clone() {
  return this.map(function () {
    return this.cloneNode(true);
  });
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
/**
 * 查看选择的元素是否匹配选择器
 */


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
}
/**
 * 返回指定索引dom元素的Dom对象
 * @param {*} index
 */


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
} // 添加参数节点到当前节点的最后


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
          tempDiv.removeChild(tempDiv.firstChild);
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
} // 添加当前节点到参数节点的最后


function appendTo(el) {
  $(el).append(this);
  return this;
}

function insertChild(el, ch) {
  if (el.childNodes.length) el.insertBefore(ch, el.childNodes[0]);else el.appendChild(ch);
} // 添加参数节点到当节点的最前


function prepend() {
  var newChild;

  for (var k = 0; k < arguments.length; k += 1) {
    newChild = k < 0 || arguments.length <= k ? undefined : arguments[k];

    for (var i = 0; i < this.length; i += 1) {
      if (typeof newChild === 'string') {
        var tempDiv = document.createElement('div');
        tempDiv.innerHTML = newChild;

        while (tempDiv.lastChild) {
          insertChild(this[i], tempDiv.lastChild);
          tempDiv.removeChild(tempDiv.lastChild);
        }
      } else if (newChild instanceof Dom) {
        for (var j = newChild.length - 1; j >= 0; j -= 1) {
          insertChild(this[i], newChild[j]);
        }
      } else {
        insertChild(this[i], newChild);
      }
    }
  }

  return this;
} // 添加当前节点到参数节点的最前


function prependTo(el) {
  $(el).prepend(this);
  return this;
}
/**
 * 插入到参数节点前面
 */


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

  return this;
}
/**
 * 插入到参数节点后面
 */


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

  return this;
}
/**
 * 同级后节点，如果符合条件返回节点，不符合条件，返回空节点，不含文本节点
 */


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
/**
 * 同级向后查找符合条件的第一个元素节点，不含文本节点
 */


function nextNode(selector) {
  var nextEls = [];
  var el = this[0];
  if (!el) return new Dom([]);
  var next = el.nextElementSibling; // eslint-disable-line

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
 * 同级向后查找所有符合条件的元素节点，不含文本节点
 */


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
/**
 * 同级前节点，如果符合条件返回节点，不符合条件，返回空节点，不含文本节点
 */


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
/**
 * 同级向前查找符合条件的第一个元素节点，不含文本节点
 */


function prevNode(selector) {
  var prevEls = [];
  var el = this[0];
  if (!el) return new Dom([]);
  var prev = el.previousElementSibling; // eslint-disable-line

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
/**
 * 同级前后所有兄弟元素节点，不含文本节点
 */


function siblings(selector) {
  return this.nextAll(selector).add(this.prevAll(selector));
}
/**
 * 所有dom节点符合条件的父元素
 */


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
/**
 * 从当前元素的父元素开始沿 DOM 树向上,获得匹配选择器的所有祖先元素。
 */


function parents(selector) {
  var parents = []; // eslint-disable-line

  for (var i = 0; i < this.length; i += 1) {
    var _parent = this[i].parentNode; // eslint-disable-line

    while (_parent) {
      if (selector) {
        if ($(_parent).is(selector)) parents.push(_parent);
      } else parents.push(_parent);

      _parent = _parent.parentNode;
    }
  }

  return $($.uniq(parents));
}
/**
 * 从当前元素的父元素开始沿 DOM 树向上,获得匹配选择器的第一个祖先元素。
 * 选择器为空，则返回 空
 */


function parentNode(sel) {
  var R = [];

  for (var i = 0; i < this.length; i += 1) {
    var _parent2 = this[i].parentNode;

    while (_parent2) {
      if (sel) {
        if ($(_parent2).is(sel)) {
          R.push(_parent2);
          return new Dom(R, sel);
        }
      } else {
        R.push(_parent2);
        return new Dom(R, sel);
      }

      _parent2 = _parent2.parentNode;
    }
  }

  return new Dom(R, sel);
}
/**
 * 从当前元素开始沿 DOM 树向上,获得匹配选择器的第一个祖先元素。
 * 选择器为空，则返回 空
 */


function closest(selector) {
  var closest = this; // eslint-disable-line

  if (typeof selector === 'undefined') return new Dom([]);

  if (!closest.is(selector)) {

    for (var i = 0; i < this.length; i += 1) {
      var _parent3 = this[i].parentNode; // eslint-disable-line

      while (_parent3) {
        var n = $(_parent3);
        if (n.is(selector)) return n;
        _parent3 = _parent3.parentNode;
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
  var foundElements = [];

  for (var i = 0; i < this.length; i += 1) {
    var found = this[i].querySelectorAll(selector);

    for (var j = 0; j < found.length; j += 1) {
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
  var R = [];

  for (var i = 0; i < this.length; i += 1) {
    var found = this[i].querySelector(selector);
    if (found) R.push(found);
  }

  return new Dom(R, selector);
}
/**
 * 返回所有dom的所有符合条件的直接子元素，不包括文本节点
 * @param {*} selector
 */


function children(selector) {
  var cs = []; // eslint-disable-line

  for (var i = 0; i < this.length; i += 1) {
    var childs = this[i].children;

    for (var j = 0; j < childs.length; j += 1) {
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
  var cs = []; // eslint-disable-line

  for (var i = 0; i < this.length; i += 1) {
    var childs = this[i].children;

    for (var j = 0; j < childs.length; j += 1) {
      if (!selector) {
        cs.push(childs[j]);
        break;
      } else if ($(childs[j]).is(selector)) {
        cs.push(childs[j]);
        break;
      }
    }
  }

  return new Dom(cs, selector);
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

  for (var _len7 = arguments.length, args = new Array(_len7), _key7 = 0; _key7 < _len7; _key7++) {
    args[_key7] = arguments[_key7];
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
  return new Dom([this.dom.children[0]]);
}
/**
 * 最后一个子元素节点，不含文本节点
 */


function lastChild() {
  if (!this.dom || this.dom.children.length === 0) return null;
  return new Dom([this.dom.children[this.dom.children.length - 1]]);
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
 * 得到光标的位置
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
  var _this$dom;

  return $((_this$dom = this.dom) === null || _this$dom === void 0 ? void 0 : _this$dom.querySelector(sel));
}

function qus(sel) {
  return $(sel, this.dom);
}
/**
 * querySelector attribute
 * return only first
 */


function att(name, v) {
  var _this$dom2;

  var n = (_this$dom2 = this.dom) === null || _this$dom2 === void 0 ? void 0 : _this$dom2.querySelector("[" + name + "=" + v + "]");
  return $(n ? n : []);
}

function atts(name, v) {
  return $("[" + name + "=" + v + "]", this.dom);
}
/**
 * querySelector name
 * return only first
 */


function name(v) {
  return this.att('name', v);
}

function names(v) {
  return this.atts('name', v);
}
/**
 * querySelector ClassName
 * cls: 'aaa bbb'
 * return only first
 */


function clas(cls) {
  var _this$dom3;

  var R = (_this$dom3 = this.dom) === null || _this$dom3 === void 0 ? void 0 : _this$dom3.getElementsByClassName(cls);
  if (R) R = R[0];
  return $(R);
}

function clases(cls) {
  var _this$dom4;

  var R = (_this$dom4 = this.dom) === null || _this$dom4 === void 0 ? void 0 : _this$dom4.getElementsByClassName(cls);
  if (R && R.length > 0) R = [].slice.call(R);else R = [];
  return new Dom(R);
}
/**
 * querySelector TagName
 * tag: 'div'
 * return only first
 */


function tag(tag) {
  var _this$dom5;

  var R = (_this$dom5 = this.dom) === null || _this$dom5 === void 0 ? void 0 : _this$dom5.getElementsByTagName(tag);
  if (R) R = R[0];
  return $(R);
}

function tags(tag) {
  var _this$dom6;

  var R = (_this$dom6 = this.dom) === null || _this$dom6 === void 0 ? void 0 : _this$dom6.getElementsByTagName(tag);
  if (R && R.length > 0) R = [].slice.call(R);else R = [];
  return new Dom(R);
}

var Methods = /*#__PURE__*/Object.freeze({
  __proto__: null,
  ready: ready,
  attr: attr,
  hasAttr: hasAttr,
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
  rect: rect,
  hide: hide,
  show: show,
  styles: styles,
  css: css,
  toArray: toArray,
  each: each,
  forEach: forEach,
  some: some,
  every: every,
  filter: filter,
  map: map,
  clone: clone,
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
  nextNode: nextNode,
  nextAll: nextAll,
  prev: prev,
  prevNode: prevNode,
  prevAll: prevAll,
  siblings: siblings,
  parent: parent,
  parentNode: parentNode,
  parents: parents,
  closest: closest,
  qu: qu,
  qus: qus,
  att: att,
  atts: atts,
  name: name,
  names: names,
  tag: tag,
  tags: tags,
  clas: clas,
  clases: clases,
  find: find,
  findNode: findNode,
  hasChild: hasChild,
  children: children,
  childNode: childNode,
  firstChild: firstChild,
  lastChild: lastChild,
  childCount: childCount,
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
 * 通过css3 Translate 移动后，获取 x �?y 坐标
 * @param {*} el
 * @param {*} axis
 */


function getTranslate(axis) {
  if (axis === void 0) {
    axis = 'x';
  }

  var els = this;
  if (!els || !els.dom) return 0;
  var el = els.dom;
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

function swipe() {
  for (var _len24 = arguments.length, args = new Array(_len24), _key24 = 0; _key24 < _len24; _key24++) {
    args[_key24] = arguments[_key24];
  }

  return eventShortcut.bind(this).apply(void 0, ['swipe'].concat(args));
}

function press() {
  for (var _len25 = arguments.length, args = new Array(_len25), _key25 = 0; _key25 < _len25; _key25++) {
    args[_key25] = arguments[_key25];
  }

  return eventShortcut.bind(this).apply(void 0, ['press'].concat(args));
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
  scroll: scroll,
  swipe: swipe,
  press: press
});

function _extends() {
  _extends = Object.assign || function (target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i];

      for (var key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          target[key] = source[key];
        }
      }
    }

    return target;
  };

  return _extends.apply(this, arguments);
}

/**
 * 当前模块实现页面与数据交互
 *
 * 1. 简单数据直接填入 input的value
 * 2. 复杂数据，如对象、数组等，则填入 隐藏域 的data 对象，
 *    并通过页面模板实现复杂数据展示。
 * 3. 数据输出到页面，通过以下函数：
 *    setForm 对整个页面，比如 Form表单，进行数据输出
 *    setField 对单个字段，进行数据输出，如果为空，则清除
 *    addField 单个字段，增加数据
 * 4. 读取页面数据
 *    getForm 读取整个页面数据，返回 FormData 对象
 *    getField 读取指定字段数据，返回 仅仅包含 指定字段的 FormData对象
 *    读取时，自动将所有隐藏域的data对象，转换为字符串，方便FormData 提交服务器。
 * 5. 对于重复 name 的 input，一般是对象数组，自动转换为对象数组，存入 FormData，
 *    方便服务器处理。
 * 6. 重复数据通过id 和 _id 字段判断，addField时，重复id 或 _id，删除之前的对象，仅保存新增的对象。
 *    id 作为服务器返回的字段，_id 作为客户端添加的字段，
 *    getForm 或 getField 时，自动删除，不返回给服务器，避免影响服务器数据。
 * 7. 以上方法 绑定到 $.fn 中，使用时，按 Dom类似方法使用，如：
 *    _.name('fmDta').setForm(data);
 */

/**
 * 根据数据项名称，自动查找页面对应input 或 field，实现数据到页面的填充
 * 调用该方法的容器一般是 Form，也支持非Form
 * 容器中的节点， 一般是input， 也支持非input，通过field 字段目标实现展现
 * 如果数据为数组，则使用调用者同名模板，生成多节点，
 * field、input隐藏域带模板，会按模板生成字段部分展现
 * setForm 调用了 setField，可以理解为setField的批量操作
 * 也就是说，数据内的元素，支持数组、对象，一次性实现整个容器的数据展现
 * @param {*} v 数据
 * @param {*} n 模板名称，可选，如果不填，默认取 调用者的name
 * 注意，setForm的模板与setField中的模板不一样
 * setForm模板先调用clone克隆模板节点，不赋值，后续再调用 setField 进行赋值。
 * 意味着 setForm中的模板里面可以再嵌套字段模板。
 * setField中的模板，使用带${r.name}这种插值模板，根据后台r数据，生成带数据值的 html。
 * @param {*} add 新增，可选
 */
function setForm(v, n, add) {
  if (add === void 0) {
    add = false;
  }

  try {
    var el = this; // 清空所有数据，填充新数据

    if (!add) clearForm.call(el);
    if (!n) n = el.attr('name'); // 使用模板

    if (n) {
      var tp = el.name(n + "-tp");

      if (tp.length) {
        if ($.isArray(v)) v.forEach(function (r) {
          addSet.call(el, n, r);
        });else addSet.call(el, n, v);
      } else Object.keys(v).forEach(function (k) {
        return setField.call(el, k, v[k]);
      });
    } else if ($.isObject(v)) // 非母版
      Object.keys(v).forEach(function (k) {
        return setField.call(el, k, v[k]);
      });
  } catch (ex) {
    console.error('setForm exp.', {
      msg: ex.message
    });
  }
}
/**
 * 设置 字段值，根据页面模板，实现页面自动化展示
 * 在Form表单中，一般用input来存放字符串值，如果使用模板，input type 必须为 hidden
 * 在非Form表单中，没有input 也可以使用，k为模板名称中不带-tp部分
 * @param {*} el 容器
 * @param {*} k 字段名称
 * @param {*} v 设置值
 * @param {*} add 重新设置还是新增，重新设置会清除数据项，默认为 false
 */


function setField(k, v, add) {
  if (add === void 0) {
    add = false;
  }

  try {
    if (!k) return false;
    var el = this; // 清除字段数据

    if (!add) clearField.call(el, k);
    var $n = el.name(k);

    if ($n.length > 0) {
      var _v;

      var n = $n.dom;
      console.log('setField', {
        type: n.type
      }); // null undfined 转换为空

      v = (_v = v) !== null && _v !== void 0 ? _v : '';
      if (v === 'null' || v === 'undefined') v = '';
      if (n.tagName.toLowerCase() === 'textarea') $n.val(v);else if (n.tagName.toLowerCase() === 'input') {
        if (n.type === 'text') setInput.call(el, k, v);else if (['date', 'time', 'month', 'week', 'datetime', 'datetime-local', 'email', 'number', 'search', 'url'].includes(n.type)) $n.val(v); // 隐藏域，一般使用模板，数据为数组或对象
        else if (n.type === 'hidden') {
            setInput.call(el, k, v);
            setData.call(el, k, v); // 触发 input的 onchange 事件，hidden 组件数据变化，不会触发onchange
            // 这里发起change事件，方便其他组件接收事件后，实现UI等处理
            // 其他接受change事件的组件，不能再次触发change，否则导致死循环

            $n.change();
          } else if (n.type === 'select-one') {
            for (var i = 0, len = n.options.length; i < len; i++) {
              if (n.options[i].value === String(v)) {
                n.options[i].selected = true;
                break;
              }
            }
          } else if (n.type === 'checkbox') {
            var ns = el.names(k);
            ns.each(function (i, x) {
              x.checked = v.includes(x.value);
            });
          } else setData.call(el, k, v);
      } else setData.call(el, k, v);
    } else setData.call(el, k, v);
  } catch (ex) {
    console.error('setField exp.', {
      msg: ex.message
    });
  }
}
/**
 * 向 field 中添加值
 * @param {*} el 容器
 * @param {*} k 字段名称
 * @param {*} v 新增数据
 */


function addField(k, v) {
  setField.call(this, k, v, true);
}
/**
 *
 * @param {*} e
 */


function removeChip(e) {
  console.log('removeChip', {
    e: e
  });
  var el = $(e.target).closest('.chip');

  if (el && el.length > 0) {
    var id = el.data('id');
    var n = el.prevNode('input[type=hidden]');
    el.remove();

    if (n && n.length > 0) {
      id = n.val().replace(new RegExp(id + "\\s*,?\\s*"), '').replace(/\s*,\s*$/, '');
      n.val(id);
    }
  }
}
/**
 * 根据模板添加 form 数据集
 * 内部函数，被setForm调用
 * @param {*} n 模板名称
 * @param {*} v 数据对象
 */


function addSet(n, v) {
  try {
    var el = this;
    var tp = el.name(n + "-tp");
    var p = tp.clone();
    p.insertBefore(tp);
    Object.keys(v).forEach(function (k) {
      setField.call(p, k, v[k]);
    });
    p.attr('name', tp.attr('name').replace('-tp', '-data')).show();
  } catch (ex) {
    console.error('addSet exp.', {
      msg: ex.message
    });
  }
}
/**
 * 向 field 中添加值
 * @param {*} el 容器
 * @param {*} k 字段名称
 * @param {*} v 新增数据
 */


function addForm(v, n) {
  var el = this;
  if (!n) n = el.attr('name');
  setForm.call(el, v, n, true);
}
/**
 * 根据模板，添加数据节点
 * 添加钱，根据id 或 _id，删除相同已加载数据节点
 * 内部函数，被 setData 调用
 * @param {*} tp 模板
 * @param {*} k 字段名称
 * @param {*} r 数据，对象 或 值
 * @param {*} ns 已经存在的数据节点
 */


function addData(tp, k, r, ns) {
  try {
    if (!tp) return; // 排除已经存在的节点

    if ($.isObject(r)) {
      if (r.id !== undefined || r._id !== undefined) {
        var ds = ns.filter(function (i, n) {
          var $n = $(n);
          return r.id && $n.data('id') == r.id || r._id && $n.data('_id') == r._id;
        });
        if (ds.length) ds.remove();
      }

      var $n = $(eval('`' + tp.dom.outerHTML + '`'));
      if (r.id) $n.data('id', r.id);else if (r._id) $n.data('_id', r._id);
      $n.attr('name', k + "-data").insertBefore(tp).show();
    } else {
      // 非对象，简单值，直接使用模板，值作为 _id，避免重复添加
      var _ds = this.names(k + "-data");

      if (!_ds || !_ds.length || !_ds.some(function (d) {
        return $(d).data('_id') == r;
      })) {
        var tx = eval('`' + tp.dom.outerHTML + '`');
        $(tx).data('_id', r).attr('name', k + "-data").insertBefore(tp).show();
      }
    }
  } catch (ex) {
    console.error('addData exp.', {
      msg: ex.message
    });
  }
}
/**
 * 使用模板加载数据到页面
 * 内部函数，被 setField 调用，只管模板，不管input 和 form
 * 在非 form 和 input环境可用
 * @param {*} v 数据，对象或者对象数组
 * @param {*} k Namespaces，带模板名称空间
 */


function setData(k, v) {
  try {
    if (!k) return false;
    var el = this;
    if ($.isEmpty(v)) return false; // 按模板增加数据

    var tp = el.name(k + "-tp");

    if (tp.length) {
      var empty = el.names(k + "-data").length === 0; // chip

      var n = el.name(k).dom; // 如果 input存在，优先获取 input 中的 data

      if (n && n.type === 'hidden') {
        var val = n.value;
        if (!$.isEmpty(n.data)) v = n.data;else if (val) {
          v = val;
          if (val.indexOf(',') > -1) v = val.split(',');
        }
      }

      var ns = el.names(k + "-data");
      if ($.isArray(v)) v.forEach(function (r) {
        if (r) {
          empty = false;
          addData.call(el, tp, k, r, ns);
        }
      });else if (v) {
        empty = false;
        addData.call(el, tp, k, v, ns);
      } // 支持点击删除

      if (tp.hasClass('chip')) tp.parentNode().click(removeChip); // 如果数据节点为空，则显示空节点（存在则显示）

      if (empty) el.name(k + "-empty").show();else el.name(k + "-empty").hide();
    } else {
      // 没有模板，直接覆盖
      var _n = el.name("" + k);

      if (_n.length && _n.dom.type !== 'hidden' && _n.dom.type != 'text') {
        var r = v;

        var tx = _n.html();

        if (r && tx.indexOf('${') > -1) _n.html(eval('`' + tx + '`'));
      }
    }
  } catch (ex) {
    console.error('setData exp.', {
      msg: ex.message
    });
  }
}
/**
 * input 赋值时设置数据，自动去重
 * 内部函数，被 setInput调用
 * @param {*} n input Dom 实例
 * @param {*} v 值
 * @param {*} org 原来的值
 */


function getValue(n, v, org) {
  var R = v;

  try {
    // 对象需判断是否重复
    if ($.isObject(v)) {
      if ($.isObject(org)) {
        if (org.id && org.id == v.id || org._id && org._id == v._id) R = v;else R = [org, v];
      } else if ($.isArray(org)) {
        var rs = org.filter(function (o) {
          return !o.id && !o._id || o.id && o.id != v.id || o._id && o._id != v._id;
        });

        if (rs.length) {
          rs.push(v);
          R = rs;
        }
      }
    } else {
      // 值变量，直接使用 value 字符串方式存储
      var val = org + "," + v; // 去重

      if (val.indexOf(',') > -1) val = Array.from(new Set(val.split(','))).join(',');
      R = val;
    }
  } catch (e) {
    console.error('getValue exp.', {
      msg: e.message
    });
  }

  return R;
}
/**
 * 设置 input 的值
 * 如果带id，则检查是否已存在，避免重复添加
 * @param {*} k 字段名称
 * @param {*} v 值，接受字符串、对象 和 对象数组
 * 对象、对象数组 赋值到 data，值，值数组，赋值到 value
 */


function setInput(k, v) {
  try {
    var el = this;
    var n = el.name(k);
    if (!n.length) return;
    if ($.isEmpty(v)) return; // 没有id 和 _id，自动添加 _id，避免重复添加

    if ($.isObject(v) && v.id === undefined && v._id === undefined) v._id = $.num();else if ($.isArray(v)) {
      v.forEach(function (r) {
        if ($.isObject(r) && r.id === undefined && r._id === undefined) r._id = $.num();
      });
    }
    var org = n.dom.data;

    if (!org) {
      org = n.val(); // 隐藏域，还原对象

      if (n.dom.type === 'hidden' && /\s*[{[]/g.test(org)) {
        try {
          org = JSON.parse(org);
          n.dom.data = org;
          n.val('');
        } catch (e) {
          console.error('setInput exp.', {
            msg: e.message
          });
        }
      }
    }

    if ($.isEmpty(org)) {
      if ($.isVal(v)) n.val(v);else if ($.isArray(v) && $.isVal(v[0])) n.val(v.join(','));else n.dom.data = v;
    } else {
      if ($.isArray(v)) {
        v = v.reduce(function (pre, cur) {
          return getValue(n, cur, pre);
        }, org);

        if ($.hasVal(v) && $.isArray(v)) {
          v = Array.from(new Set(v));
        }
      } else v = getValue(n, v, org);

      if ($.hasVal(v)) {
        if ($.isVal(v)) n.val(v); // 值 数组
        else if ($.isArray(v) && $.isVal(v[0])) n.val(v.join(','));else n.dom.data = v;
      }
    }
  } catch (ex) {
    console.error('setInput exp.', {
      msg: ex.message
    });
  }
}
/**
 * 清除表单
 */


function clearForm() {
  try {
    var el = this; // 清除input值

    var es = el.find('input,textarea');
    es.forEach(function (e) {
      if (e.data) {
        e.data = null;
        delete e.data;
      }

      if (e.type !== 'checkbox') e.value = '';
    }); // 清除 模板数据

    el.find('[name$=-data]').remove();
    el.find('[name$=-empty]').show();
  } catch (e) {
    console.error("clearForm exp:" + e.message);
  }
}
/**
 * 清除字段
 */


function clearField(k) {
  try {
    var el = this; // 清除input值

    var es = el.names(k);
    es.forEach(function (e) {
      if (e.tagName.toLowerCase() === 'input' || e.tagName.toLowerCase() === 'textarea') {
        if (e.data) {
          e.data = null;
          delete e.data;
        }

        if (e.type !== 'checkbox') e.value = '';
      }
    }); // 清除 模板数据

    el.names(k + "-data").remove();
    el.name(k + "-empty").show();
  } catch (e) {
    console.error("clearField exp:" + e.message);
  }
}
/**
 * 读取整个页面数据，返回对象 或对象数组
 * 读取时，自动将所有隐藏域的data对象，转换为字符串，方便FormData 提交服务器。
 * @param {*} n 模板名称，不填与容器名称相同，可选参数
 */


function getForm(n) {
  var R = null;

  try {
    var el = this;
    el.find('input[type=hidden]').forEach(function (d) {
      if (!$.isEmpty(d.data)) d.value = JSON.stringify(d.data);
    });
    if (!n) n = el.attr('name');
    var tp = el.name(n + "-tp");
    var prev = null;

    if (tp.length) {
      prev = tp.prev();
      tp.remove();
    }

    var fd = new FormData(el.dom);
    if (tp.length) tp.insertAfter(prev);
    var rs = [];
    var last = null;
    var r = {}; // eslint-disable-next-line no-restricted-syntax

    for (var _iterator = fd.entries(), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
      var _ref;

      if (_isArray) {
        if (_i >= _iterator.length) break;
        _ref = _iterator[_i++];
      } else {
        _i = _iterator.next();
        if (_i.done) break;
        _ref = _i.value;
      }

      var e = _ref;
      var k = e[0];
      if (!last) last = k;else if (last === k) {
        if (!$.isEmpty(r)) rs.push(_extends({}, r));
        r = {};
      }
      var v = e[1]; // 还原对象

      try {
        if (/^\s*[{[]/.test(v)) v = JSON.parse(v);
      } catch (e) {
        console.error('getForm exp.', {
          msg: e.message
        });
      }

      r[k] = v;
    }

    if ($.hasVal(r)) rs.push(r);
    if (rs.length === 1) R = rs[0];else if (rs.length > 1) R = rs;
  } catch (ex) {
    console.error('getForm exp.', {
      msg: ex.message
    });
  }

  return R;
}
/**
 * 读取指定字段数据，返回 仅仅包含 指定字段的值，如果有data，则返回 对象
 * 读取时，自动将隐藏域的data对象，转换为字符串，方便FormData 提交服务器。
 * @param {*} k 字段名称
 */


function getField(k) {
  var R = null;

  try {
    var el = this;
    var n = el.name(k);

    if (n.length) {
      if ($.hasVal(n.data)) R = n.data;else R = n.val();
    }
  } catch (ex) {
    console.error('getForm exp.', {
      msg: ex.message
    });
  }

  return R;
} // export const fn = {
// Object.keys(fn).forEach(k => ($.fn[k] = fn[k]));

var Form = /*#__PURE__*/Object.freeze({
  __proto__: null,
  setForm: setForm,
  addForm: addForm,
  getForm: getForm,
  clearForm: clearForm,
  setField: setField,
  addField: addField,
  clearField: clearField,
  getField: getField
});

/**
 * 输出方法到 $.fn，用户对 $(dom) 对象操作
 * 相关方法与用法与 zepto、jQuery兼容。
 */
var $$1 = window.$;
[Methods, Scroll, Animate, Form, eventShortcuts].forEach(function (group) {
  Object.keys(group).forEach(function (methodName) {
    $$1.fn[methodName] = group[methodName];
  });
}); // export default $; // webpack中import，会导致default不存在访问错误！

exports.$ = $$1;
