/*!
  * wia base v0.1.8
  * (c) 2020 Sibyl Yu
  * @license MIT
  */
'use strict';

var Support = function Support() {
  return {
    touch: function checkTouch() {
      return !!(window.navigator.maxTouchPoints > 0 || 'ontouchstart' in window || window.DocumentTouch && document instanceof window.DocumentTouch);
    }(),
    pointerEvents: !!window.PointerEvent,
    observer: function checkObserver() {
      return 'MutationObserver' in window || 'WebkitMutationObserver' in window;
    }(),
    passiveListener: function checkPassiveListener() {
      var supportsPassive = false;

      try {
        var opts = Object.defineProperty({}, 'passive', {
          // eslint-disable-next-line
          get: function get() {
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

/**
 * 引入全局变量$，wia app base.js的一部分，来源于zepto，每个微应用均需在index.html中引用base.js，
 * $之前主要为替代zepto、jQuery的dom操作引入的，因此基础文件也引入了几个简单的dom操作，
 * 更多类似jQuery操作需引用dom.js库。
 * 相关方法与用法与 zepto、jQuery兼容。
 */
var emptyArray = [],
    class2type = {},
    filter = emptyArray.filter,
    slice = emptyArray.slice,
    toString = class2type.toString,
    singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
    tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
    fragmentRE = /^\s*<(\w+|!)[^>]*>/,
    uniqueNumber = 1;

document.ready = function (cb) {
  // don't use "interactive" on IE <= 10 (it can fired premature)
  if (document.readyState === 'complete' || document.readyState !== 'loading' && !document.documentElement.doScroll) setTimeout(function () {
    cb($$1);
  }, 0);else {
    var handler = function handler() {
      document.removeEventListener('DOMContentLoaded', handler, false);
      window.removeEventListener('load', handler, false);
      cb($$1);
    };

    document.addEventListener('DOMContentLoaded', handler, false);
    window.addEventListener('load', handler, false);
  }
};
/**
 * Return collection with methods
 */


var D =
/*#__PURE__*/
function () {
  function D(dom, sel) {
    var len = dom ? dom.length : 0;

    for (var i = 0; i < len; i++) {
      this[i] = dom[i];
    }

    this.dom = dom ? dom[0] : null;
    this.length = len;
    this.selector = sel || '';
  }

  D.isD = function isD(d) {
    return d instanceof D;
  } // Classes and attributes
  ;

  var _proto = D.prototype;

  _proto.addClass = function addClass(className) {
    if (typeof className === 'undefined') {
      return this;
    }

    var classes = className.split(' ');

    for (var i = 0; i < classes.length; i += 1) {
      for (var j = 0; j < this.length; j += 1) {
        if (typeof this[j] !== 'undefined' && typeof this[j].classList !== 'undefined') this[j].classList.add(classes[i]);
      }
    }

    return this;
  };

  _proto.removeClass = function removeClass(className) {
    var classes = className.split(' ');

    for (var i = 0; i < classes.length; i += 1) {
      for (var j = 0; j < this.length; j += 1) {
        if (typeof this[j] !== 'undefined' && typeof this[j].classList !== 'undefined') this[j].classList.remove(classes[i]);
      }
    }

    return this;
  };

  _proto.hasClass = function hasClass(name) {
    return emptyArray.some.call(this, function (el) {
      return el.classList.contains(name);
    });
  };

  _proto.toggleClass = function toggleClass(className) {
    var classes = className.split(' ');

    for (var i = 0; i < classes.length; i += 1) {
      for (var j = 0; j < this.length; j += 1) {
        if (typeof this[j] !== 'undefined' && typeof this[j].classList !== 'undefined') this[j].classList.toggle(classes[i]);
      }
    }

    return this;
  };

  return D;
}();

function likeArray(obj) {
  var length = !!obj && 'length' in obj && obj.length,
      type = $$1.type(obj);
  return 'function' != type && !$$1.isWindow(obj) && ('array' == type || length === 0 || typeof length == 'number' && length > 0 && length - 1 in obj);
}

function compact(array) {
  return filter.call(array, function (item) {
    return item != null;
  });
}

function flatten(array) {
  return array.length > 0 ? $$1.fn.concat.apply([], array) : array;
} // `$.zepto.fragment` takes a html string and an optional tag name
// to generate DOM nodes from the given html string.
// The generated DOM nodes are returned as an array.
// This function can be overridden in plugins for example to make
// it compatible with browsers that don't support the DOM fully.


function fragment(html, name, properties) {
  var R; // A special case optimization for a single tag

  if (singleTagRE.test(html)) R = $$1(document.createElement(RegExp.$1));

  if (!R) {
    if (html.replace) html = html.replace(tagExpanderRE, '<$1></$2>');
    if (name === undefined) name = fragmentRE.test(html) && RegExp.$1;
    var containers = {
      tr: 'tbody',
      tbody: 'table',
      thead: 'table',
      tfoot: 'table',
      td: 'tr',
      th: 'tr',
      li: 'ul',
      option: 'select',
      '*': 'div'
    };
    if (!(name in containers)) name = '*';
    var container = document.createElement(containers[name]);
    container.innerHTML = '' + html;
    R = $$1.each(slice.call(container.childNodes), function () {
      container.removeChild(this);
    });
  }

  if ($$1.isPlainObject(properties)) {
    var nodes = $$1(R); // special attributes that should be get/set via method calls

    var methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'];
    $$1.each(properties, function (key, value) {
      if (methodAttributes.indexOf(key) > -1) nodes[key](value);else nodes.attr(key, value);
    });
  }

  return R;
}
/**
 * return D instance
 * @param {*} sel selector
 * @param {*} ctx context
 */


function $$1(sel, ctx) {
  var R = [];

  if (sel) {
    if (typeof sel === 'string') {
      sel = (sel || '').trim();

      if (sel[0] === '#') {
        var dom = document.getElementById(sel.substr(1));
        if (dom) R.push(dom);
      } else if (sel[0] === '<' && fragmentRE.test(sel)) R = fragment(sel, RegExp.$1, ctx), sel = null;else R = $$1.qsa(sel, ctx);
    } else if (sel.nodeType || sel === window || sel === document) {
      R = [sel];
      sel = null;
    } else if (D.isD(sel)) return sel;else if ($$1.isFunction(sel)) return document.ready(sel);else {
      // normalize array if an array of nodes is given
      if ($$1.isArray(sel)) R = compact(sel); // Wrap DOM nodes.
      //else if ($.isObject(sel))
      // If it's a html fragment, create nodes from it
      else if (fragmentRE.test(sel)) R = fragment(sel, RegExp.$1, ctx), sel = null; // // If there's a context, create a collection on that context first, and select
      // // nodes from there
      // else if (context !== undefined) return $(context).find(selector)
      // // And last but no least, if it's a CSS selector, use it to select nodes.
      // else ds = zepto.qsa(document, selector)
    }
  }

  return new D(R, sel);
} // plugin compatibility


$$1.uuid = 0;
$$1.expr = {};

$$1.noop = function () {};

$$1.support = Support; // 静态属性,可直接调用

$$1.type = function (obj) {
  return obj == null ? String(obj) : class2type[toString.call(obj)] || 'object';
}; // eslint-disable-next-line func-names


$$1.isWindow = function (o) {
  return o != null && o == o.window;
};

$$1.isObject = function (o) {
  return $$1.type(o) === 'object'; // && o !== null && o.constructor && o.constructor === Object;
};

$$1.isFunction = function (value) {
  return $$1.type(value) === 'function';
};

$$1.isDocument = function (o) {
  return o != null && o.nodeType == o.DOCUMENT_NODE;
};

$$1.isPlainObject = function (o) {
  return $$1.isObject(o) && !$$1.isWindow(o) && Object.getPrototypeOf(o) == Object.prototype;
};

$$1.isEmptyObject = function (o) {
  var name;

  for (name in o) {
    return false;
  }

  return true;
};

$$1.isArray = Array.isArray || function (object) {
  return object instanceof Array;
};

$$1.inArray = function (elem, array, i) {
  return emptyArray.indexOf.call(array, elem, i);
};

$$1.isNumeric = function (val) {
  var num = Number(val),
      type = typeof val;
  return val != null && type != 'boolean' && (type != 'string' || val.length) && !isNaN(num) && isFinite(num) || false;
};

$$1.trim = function (str) {
  return str == null ? '' : String.prototype.trim.call(str);
};

$$1.map = function (els, cb) {
  var value,
      values = [],
      i,
      key;
  if (likeArray(els)) for (i = 0; i < els.length; i++) {
    value = cb(els[i], i);
    if (value != null) values.push(value);
  } else for (key in els) {
    value = cb(els[key], key);
    if (value != null) values.push(value);
  }
  return flatten(values);
};

$$1.each = function (els, cb) {
  var i, key;

  if (likeArray(els)) {
    for (i = 0; i < els.length; i++) {
      if (cb.call(els[i], i, els[i]) === false) return els;
    }
  } else {
    for (key in els) {
      if (cb.call(els[key], key, els[key]) === false) return els;
    }
  }

  return els;
};

$$1.grep = function (els, cb) {
  return filter.call(els, cb);
}; // Populate the class2type map


$$1.each('Boolean Number String Function Array Date RegExp Object Error'.split(' '), function (i, name) {
  class2type['[object ' + name + ']'] = name.toLowerCase();
});

$$1.id = function (x) {
  return document.getElementById(x);
};

$$1.qu = function (sel, ctx) {
  if (ctx) return D.isD(ctx) ? ctx[0].querySelector(sel) : ctx.querySelector(sel);
  return document.querySelector(sel);
}; // 返回数组, 便于 forEach


$$1.qus = $$1.qsa = function (sel, ctx) {
  var R = null;
  if (ctx) R = D.isD(ctx) ? ctx[0].querySelectorAll(sel) : ctx.querySelectorAll(sel);else R = document.querySelectorAll(sel);
  if (R && R.length > 0) return slice.call(R);else return [];
};
/**
 * 通过name获得dom对象
 * getElementsByName 只能用于document全局，querySelector 可用于局部
 * @param {string} name
 * @param {object} ctx parent dom
 */


$$1.qn = function qn(name, ctx) {
  var sel = "[name=\"" + name + "\"]";
  return $$1.qu(sel, ctx);
}; // 返回指定name数组, 便于 forEach
// 效率高于qus


$$1.qns = function (sel, ctx) {
  var R = null;
  if (ctx) R = D.isD(ctx) ? ctx[0].getElementsByName(sel) : ctx.getElementsByName(sel);else R = document.getElementsByName(sel);
  if (R && R.length > 0) return slice.call(R);else return [];
}; // 返回指定class name数组, 便于 forEach
// 效率高于qus


$$1.qcs = function (sel, ctx) {
  var R = null;
  if (ctx) R = D.isD(ctx) ? ctx[0].getElementsByClassName(sel) : ctx.getElementsByClassName(sel);else R = document.getElementsByClassName(sel);
  if (R && R.length > 0) return slice.call(R);else return [];
}; // 返回指定tag name数组, 便于 forEach
// 效率高于qus


$$1.qts = function (sel, ctx) {
  var R = null;
  if (ctx) R = D.isD(ctx) ? ctx[0].getElementsByTagName(sel) : ctx.getElementsByTagName(sel);else R = document.getElementsByTagName(sel);
  if (R && R.length > 0) return slice.call(R);else return [];
};
/**
 * Copy all but undefined properties from one or more to dst
 * Object.assign 在安卓微信上低版本不支持
 * zepto 使用for in，包含继承属性，修改为只拷贝对象自有属性
 * @param to 拷贝目标
 * @param src 拷贝源
 * @param deep 是否深拷贝
 */


function assign(to, src, deep) {
  if (src !== undefined && src !== null) {
    var ks = Object.keys(Object(src)); //   for (key in src) {

    for (var i = 0, _len = ks.length; i < _len; i += 1) {
      var k = ks[i];
      var desc = Object.getOwnPropertyDescriptor(src, k);

      if (desc !== undefined && desc.enumerable) {
        if (deep && ($$1.isPlainObject(src[k]) || $$1.isArray(src[k]))) {
          if ($$1.isPlainObject(src[k]) && !$$1.isPlainObject(to[k])) to[k] = {};
          if ($$1.isArray(src[k]) && !$$1.isArray(to[k])) to[k] = [];
          assign(to[k], src[k], deep);
        } else to[k] = src[k];
      }
    }
  }
}
/**
 * Copy all but undefined properties from one or more
 * Object.assign 在部分安卓上不兼容，并且不支持深拷贝
 * 第一个参数为 true，为深拷贝，
 */


$$1.assign = function (to) {
  if (!to) return {};
  var deep;

  for (var _len2 = arguments.length, srcs = new Array(_len2 > 1 ? _len2 - 1 : 0), _key = 1; _key < _len2; _key++) {
    srcs[_key - 1] = arguments[_key];
  }

  if (typeof to === 'boolean') {
    deep = to;
    to = srcs.shift();
  }

  srcs.forEach(function (src) {
    assign(to, src, deep);
  });
  return to;
};

$$1.extend = $$1.assign;

$$1.merge = function () {
  for (var _len3 = arguments.length, args = new Array(_len3), _key2 = 0; _key2 < _len3; _key2++) {
    args[_key2] = arguments[_key2];
  }

  var to = args[0];
  args.splice(0, 1);
  args.forEach(function (src) {
    assign(to, src, false);
  });
  return to;
};

$$1.fastLink = function () {
  // a 标签加载 touchstart 事件,避免 300毫秒等待
  try {
    if (!$$1.support.touch) return;
    var links = $$1.qus('a');
    links.forEach(function (link) {
      if (link.hasAttribute('fastlink') || link.hasAttribute('fastLink')) {
        var startX;
        var startY;

        link.ontouchstart = function (ev) {
          ev.preventDefault();
          startX = ev.changedTouches[0].clientX;
          startY = ev.changedTouches[0].clientY;
        };

        link.ontouchend = function (ev) {
          if (Math.abs(ev.changedTouches[0].clientX - startX) <= 5 && Math.abs(ev.changedTouches[0].clientY - startY) <= 5) {
            ev.preventDefault();
            if (link.hasAttribute('back') || link.hasClass('back')) return window.history.back();
            if (link.href) window.location.href = link.href;
          }
        };
      }
    });
  } catch (e) {
    alert("fastLink exp: " + e.message);
  }
};

$$1.requestAnimationFrame = function (callback) {
  if (window.requestAnimationFrame) return window.requestAnimationFrame(callback);else if (window.webkitRequestAnimationFrame) return window.webkitRequestAnimationFrame(callback);
  return window.setTimeout(callback, 1000 / 60);
};

$$1.cancelAnimationFrame = function (id) {
  if (window.cancelAnimationFrame) return window.cancelAnimationFrame(id);else if (window.webkitCancelAnimationFrame) return window.webkitCancelAnimationFrame(id);
  return window.clearTimeout(id);
};

$$1.deleteProps = function (obj) {
  var object = obj;
  Object.keys(object).forEach(function (key) {
    try {
      object[key] = null;
    } catch (e) {// no setter for object
    }

    try {
      delete object[key];
    } catch (e) {// something got wrong
    }
  });
};

$$1.nextTick = function (cb, delay) {
  if (delay === void 0) {
    delay = 0;
  }

  return setTimeout(cb, delay);
};

$$1.nextFrame = function (cb) {
  return $$1.requestAnimationFrame(function () {
    $$1.requestAnimationFrame(cb);
  });
};

$$1.now = function () {
  return Date.now();
};

$$1.uniqueNumber = function () {
  uniqueNumber += 1;
  return uniqueNumber;
};

$$1.uid = function (mask, map) {
  if (mask === void 0) {
    mask = 'xxxxxxxxxx';
  }

  if (map === void 0) {
    map = '0123456789abcdef';
  }

  var _map = map,
      length = _map.length;
  return mask.replace(/x/g, function () {
    return map[Math.floor(Math.random() * length)];
  });
};

$$1.camelCase = function (str) {
  return str.toLowerCase().replace(/-+(.)/g, function (match, chr) {
    return chr ? chr.toUpperCase() : '';
  });
};

$$1.uniq = function (array) {
  return filter.call(array, function (item, idx) {
    return array.indexOf(item) === idx;
  });
};

$$1.promisify = function (f) {
  return function () {
    for (var _len4 = arguments.length, arg = new Array(_len4), _key3 = 0; _key3 < _len4; _key3++) {
      arg[_key3] = arguments[_key3];
    }

    return new Promise(function (res, rej) {
      f.apply(void 0, arg.concat([function (err, rs) {
        if (err) rej(err);else res(rs);
      }]));
    });
  };
};

$$1.urlParam = function (url) {
  var query = {};
  var urlToParse = url || window.location.href;
  var i;
  var params;
  var param;
  var length;

  if (typeof urlToParse === 'string' && urlToParse.length) {
    urlToParse = urlToParse.indexOf('?') > -1 ? urlToParse.replace(/\S*\?/, '') : '';
    params = urlToParse.split('&').filter(function (paramsPart) {
      return paramsPart !== '';
    });
    length = params.length;

    for (i = 0; i < length; i += 1) {
      param = params[i].replace(/#\S+/g, '').split('=');
      query[decodeURIComponent(param[0])] = typeof param[1] === 'undefined' ? undefined : decodeURIComponent(param.slice(1).join('=')) || '';
    }
  }

  return query;
};

$$1.ready = document.ready;
$$1.fn = D.prototype;
$$1.Class = D;
$$1.Dom = D; // ssr

$$1.window = window;
$$1.document = document;

/**
 * globle event 全局事件模块
 * 由于整个App有效，因此要求事件名称为 “模块名:函数名:事件名”，避免冲突。
 * 比如在 lazy模块中，通过 $.emit('lazy:src:before', node) 发射事件，
 * 引用该类代码，通过 $.on('lazy:src:before', fn) 获得事件触发回调。
 * 事件的每个回调函数，只能登记一次，事件触发时，函数被调用一次。
 * 避免一个函数多次重复登记，被多次调用。
 * 一个事件，可登记多个不同的函数，每个函数都会被调用。
 *
 * Released on: August 28, 2016
 *
 */
// 一个包中所有引用共享该变量!
var events = {};
/**
 * 响应事件函数登记，一个函数，在同一事件下只能登记一次，避免同一事件多次触发相同函数，被误判为多次事件
 * 事件触发时，调用一次
 * @param {*} event
 * @param {*} fn
 */

function on(event, fn) {
  events[event] = events[event] || [];
  if (!events[event].includes(fn)) events[event].push(fn);
  return this;
}
/**
 * 只触发一次，触发后删除登记的回调函数
 * 由于需标识执行一次的函数，不对原fn做任何修改，
 * 因此需包装一个新的回调函数，将原函数作为包装函数变量。
 * @param {*} event
 * @param {*} fn
 */


function once(event, fn) {
  var self = this;

  function oncefn() {
    $.off(event, fn);

    if (oncefn.proxy) {
      delete oncefn.proxy;
    }

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    fn.apply(self, args);
  }

  oncefn.proxy = fn;
  $.on(event, oncefn);
  return this;
}
/**
 * 删除事件
 * @param event
 * @param handler 缺少删除该事件, 指定处理函数,则只删除指定处理函数
 * @returns {off}
 */


function off(event, fn) {
  if (fn) {
    // 删除所有该函数的事件登记
    events[event].forEach(function (v, k) {
      if (v === fn || v.proxy && v.proxy === fn) {
        events[event].splice(k, 1);
      }
    });
  } else delete events[event]; // 删除所有该事件回调函数


  return this;
}
/**
 * 发射事件
 * @param event
 * @param args
 * @returns {emit}
 */


function emit(event) {
  var _this = this;

  for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    args[_key2 - 1] = arguments[_key2];
  }

  // cache the events, to avoid consequences of mutation
  var cache = events[event] && events[event].slice(); // only fire handlers if they exist

  if (cache) {
    cache.forEach(function (fn) {
      // set 'this' context, pass args to handlers
      fn.apply(_this, args);
    });
  }

  return this;
}

var Event = /*#__PURE__*/Object.freeze({
  __proto__: null,
  on: on,
  off: off,
  once: once,
  emit: emit
});

/**
 * 本地离线存储
 */

/**
 * 离线存储，缺省 30 天
 * @param {*} key 
 * @param {*} val 
 * @param {*} exp 过期时长，单位分钟，30天 x 24小时 x 60分 = 43200分 
 */
function set(key, val, exp) {
  var v = {
    exp: exp || 43200,
    time: Math.trunc(Date.now() / 1000),
    // 记录何时将值存入缓存，秒级
    val: val
  };
  if (!key || !localStorage) return;
  localStorage.setItem(key, JSON.stringify(v));
}

function get(key) {
  var R = '';
  if (!key || !localStorage) return '';
  var v = localStorage.getItem(key);

  try {
    v = JSON.parse(v);

    if (v) {
      var time = Math.trunc(Date.now() / 1000); // 秒

      if (v.time && v.exp) {
        var dur = time - v.time;

        if (dur > v.exp * 60) {
          localStorage.removeItem(key);
          console.info("store.get(" + key + ") dur:" + dur + " > exp:" + v.exp * 60);
        } else if (v.val) R = v.val;
      } else if (v.val) {
        console.error("store.get(" + key + ") no time and exp");
        R = v.val;
      }
    }
  } catch (e) {
    console.log("store.get exp:" + e.message);
  }

  return R;
}

function remove(key) {
  if (localStorage) localStorage.removeItem(key);
}

function clear() {
  if (localStorage) localStorage.clear();
}

function check() {
  if (localStorage) {
    for (var i = 0; i < localStorage.length; i++) {
      get(localStorage.key(i));
    }
  }
}

var Store = /*#__PURE__*/Object.freeze({
  __proto__: null,
  set: set,
  get: get,
  remove: remove,
  clear: clear,
  check: check
});

/**
 创建xmlHttpRequest,返回xmlHttpRequest实例,根据不同的浏览器做兼容
*/
function getXhr() {
  var rs = null;
  if (window.XMLHttpRequest) rs = new XMLHttpRequest();else if (window.ActiveXObject) rs = new ActiveXObject('Microsoft.XMLHTTP');
  return rs;
}
/**
 * xmlHttpRequest GET 方法
 * @param url get的URL地址
 * @param data 要get的数据
 * return Promise
 */


function get$1(url, param) {
  var pm = new Promise(function (res, rej) {
    var xhr = getXhr();

    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) res(xhr.responseText);else rej(new Error(xhr.statusText));
      }
    };

    if (param) xhr.open('GET', url + '?' + param, true);else xhr.open('GET', url, true); // xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    // xhr.setRequestHeader('Accept-Encoding', 'gzip');

    xhr.send(null);
  });
  return pm;
}

function post(url, data) {
  var pm = new Promise(function (res, rej) {
    var xhr = getXhr();

    xhr.onreadystatechange = function () {
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
    var param = data;
    if (typeof data === 'object') param = Object.keys(data).map(function (k) {
      return k + "=" + data[k];
    }).sort().join('&'); // 发送 FormData 数据, 会自动设置为 multipart/form-data

    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded'); // xhr.setRequestHeader('Content-Type', 'multipart/form-data; boundary=AaB03x');
    // alert(param);

    xhr.send(param);
  });
  return pm;
}

var Ajax = /*#__PURE__*/Object.freeze({
  __proto__: null,
  get: get$1,
  post: post
});

/*!*******************!*\
! ** * 动态模块管理 ** * !
\***********************/
// The module cache
var _c = {}; // 已执行并缓存的模块，提供了输出接口
// The modules object

var _m = {}; // 已下载的模块，在$.run()时被执行，并返回模块输出部分

/**
 * 加载、执行模块代码，返回模块输出部分
 * 类似 node.js 的 require函数
 * @param {*} id 模块id
 */

function load(id) {
  // Check if module is in cache
  if (_c[id]) {
    return _c[id].exports;
  } // Create a new module (and put it into the cache)


  var m = {
    i: id,
    l: false,
    exports: {}
  };
  _c[id] = m; // M.m 保存所有模块，需动态加载
  // Execute the module function
  // 执行每个模块的代码

  if (_m[id]) // m.exports 对象作为模块内 this 指针，而不是window
    // 比如 箭头函数内的this 
    _m[id].call(m.exports, m, m.exports, load);else alert("load module [" + id + "] not exist!"); // _m.m[id](m, m.exports, _m);
  // Flag the module as loaded

  m.l = true; // Return the exports of the module
  // 返回模块输出部分

  return m.exports;
} // object's OwnProperty
/**
 * 将模块代码作为函数体，加入到模块对象中
 * 从安全角度，用户不能覆盖系统模块!!!
 */


function add(ms) {
  Object.keys(ms).forEach(function (k) {
    if (k !== 'R' && k !== 'M') {
      // eslint-disable-next-line
      ms[k] = new Function('module', 'exports', '_m_', "'use strict';" + ms[k]); // if (!_m[k])
      // 覆盖下载的模块

      _m[k] = ms[k];
    }
  });
}
/**
 * 动态并发下载资源，涉及依赖，需按次序加载
 * load: ['/wia/wia.js?v=1.0.2', '/mall/page.js?v=ver']
 * @param {*} cos 资源下载网址
 * @param {*} fs 需加载文件数组
 */


function get$2(cos, fs) {
  // 获得一个promise数组
  var ps = fs.map(function (f) {
    // f = '/wia/wia.js?v=1.0.18';
    var pos = f.indexOf('?v=');
    var ver = f.substr(pos + 3);
    var key = "app " + f.substr(0, pos);
    console.log("get module key:" + key + " ver:" + ver);
    var js = $.store.get(key) || ''; // 如已经本地缓存，则直接加载

    if (js) {
      console.log("get module local key:" + key + " ok!");
      var jo = JSON.parse(js);

      if (!jo.R || !jo.R.ver || jo.R && jo.R.ver && jo.R.ver !== ver) {
        $.store.remove(key);
        js = '';
        console.log("get module local key:" + key + " ver:" + jo.R.ver + " != " + ver);
      }
    }

    if (js) return Promise.resolve(js);
    return $.get(cos + f).then(function (rs) {
      if (rs) {
        console.log("get module clound " + (cos + f) + " ok!");
        $.store.set(key, rs);
        return rs;
      }
    });
  });
  return Promise.all(ps).then(function (rs) {
    rs.forEach(function (r) {
      var js = r && JSON.parse(r);
      if (js) add(js);
    });
  });
} // public_path__

var Module = /*#__PURE__*/Object.freeze({
  __proto__: null,
  cache: _c,
  module: _m,
  load: load,
  add: add,
  get: get$2
});

var Device = function Device() {
  var platform = window.navigator.platform;
  var ua = window.navigator.userAgent;
  var device = {
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
  var screenWidth = window.screen.width;
  var screenHeight = window.screen.height;
  var android = ua.match(/(Android);?[\s\/]+([\d.]+)?/); // eslint-disable-line

  var ipad = ua.match(/(iPad).*OS\s([\d_]+)/);
  var ipod = ua.match(/(iPod)(.*OS\s([\d_]+))?/);
  var iphone = !ipad && ua.match(/(iPhone\sOS|iOS)\s([\d_]+)/);
  var ie = ua.indexOf('MSIE ') >= 0 || ua.indexOf('Trident/') >= 0;
  var edge = ua.indexOf('Edge/') >= 0;
  var firefox = ua.indexOf('Gecko/') >= 0 && ua.indexOf('Firefox/') >= 0;
  var windows = platform === 'Win32';
  var electron = ua.toLowerCase().indexOf('electron') >= 0;
  var macos = platform === 'MacIntel'; // iPadOs 13 fix

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

  var DARK = '(prefers-color-scheme: dark)';
  var LIGHT = '(prefers-color-scheme: light)';

  device.prefersColorScheme = function prefersColorTheme() {
    var theme;

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

/**
 * wia app基础文件，每个微应用均需在index.html中引用该文件，
 * 该文件创建了全局变量$，并挂在window对象之下，全局可用。
 * 需注意，jQuery、zepto等工具库也是要了$，所以wia微应用不能使用jQuery和zepto!!!
 * 由于wia app动态加载模块的，因此基础文件主要用于模块管理
 * 为方便操作，将模块管理挂在全局$之下，因此引入了全局变量$。
 * $之前主要为替代zepto、jQuery的dom操作引入的，因此基础文件也引入了几个简单的dom操作，
 * 更多类似jQuery操作需引用dom.js库。
 * 相关方法与用法与 zepto、jQuery兼容。
 */

window.$ === undefined && (window.$ = $$1);
$$1.device = Device; // 将 event 模块中的事件方法加载到 $

Object.keys(Event).forEach(function (k) {
  $$1[k] = Event[k];
}); // 将 ajax 模块中的异步方法加载到 $

Object.keys(Ajax).forEach(function (k) {
  $$1[k] = Ajax[k];
}); // 将 store 模块中的方法加载到 $.store

$$1.store = {};
Object.keys(Store).forEach(function (k) {
  $$1.store[k] = Store[k];
}); // 将 module 模块中的方法加载到 $.wms

$$1.M = {};
Object.keys(Module).forEach(function (k) {
  $$1.M[k] = Module[k];
});

module.exports = $$1;
