/**
 * 引入全局变量$，wia app base.js的一部分，来源于zepto，每个微应用均需在index.html中引用base.js，
 * $之前主要为替代zepto、jQuery的dom操作引入的，因此基础文件也引入了几个简单的dom操作，
 * 更多类似jQuery操作需引用dom.js库。
 * 相关方法与用法与 zepto、jQuery兼容。
 */

import support from './support';

var emptyArray = [],
  class2type = {},
  concat = emptyArray.concat,
  filter = emptyArray.filter,
  slice = emptyArray.slice,
  toString = class2type.toString,
  singleTagRE = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
  simpleSelectorRE = /^[\w-]*$/,
  tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
  rootNodeRE = /^(?:body|html)$/i,
  capitalRE = /([A-Z])/g,
  fragmentRE = /^\s*<(\w+|!)[^>]*>/,
  uniqueNumber = 1,
  tempParent = document.createElement('div');

document.ready = function (cb) {
  // don't use "interactive" on IE <= 10 (it can fired premature)
  if (
    document.readyState === 'complete' ||
    (document.readyState !== 'loading' && !document.documentElement.doScroll)
  )
    setTimeout(function () {
      cb($);
    }, 0);
  else {
    var handler = function () {
      document.removeEventListener('DOMContentLoaded', handler, false);
      window.removeEventListener('load', handler, false);
      cb($);
    };
    document.addEventListener('DOMContentLoaded', handler, false);
    window.addEventListener('load', handler, false);
  }
};

/**
 * Return collection with methods
 */
class D {
  /**
   * Dom封装
   * @param {*} doms dom节点数组
   * @param {*} sel 选择器
   * @param {*} name 将dom节点内有名节点加载到Dom对象实例，方便按名称直接调用
   */
  constructor(doms, sel, name) {
    const len = doms ? doms.length : 0;
    for (let i = 0; i < len; i++) this[i] = doms[i];

    this.dom = doms ? doms[0] : null;
    this.length = len;
    this.selector = sel || '';
    // 加载有name的dom节点到对象，方便按名称直接调用
    if (len && name) {
      doms.forEach(el => {
        const ns = $.qus('[name]', el);
        ns?.length &&
          ns.forEach(n => {
            const $n = $(n);
            const nm = $n.attr('name');
            if (!this.n) this.n = {};
            if (!this.n[nm] || this.n[nm].dom !== n) this.n[nm] = $n;
            if (!this[nm] || (D.isD(this[nm]) && this[nm].dom !== n)) this[nm] = $n;
          });
      });
    }
  }

  static isD(d) {
    return d instanceof D;
  }

  hasClass(name) {
    return emptyArray.some.call(this, function (el) {
      return el?.classList?.contains(name);
    });
  }

  /**
   * Add classes to the given element.
   * @param {string} value - The classes to be add.
   * @param {boolean} only - Delete all the styles in the same layer, used by tab
   */
  addClass(className, only) {
    if (typeof className === 'undefined') {
      return this;
    }
    const classes = className.split(' ');
    for (let i = 0; i < classes.length; i += 1) {
      for (let j = 0; j < this.length; j += 1) {
        const n = this[j];
        if (typeof n !== 'undefined' && typeof n.classList !== 'undefined') {
          if (arguments.length === 1) n.classList.add(classes[i]);
          else if (only) {
            // clear all
            $('.' + classes[i], n.parentNode).removeClass(classes[i]);
            // add one
            n.classList.add(classes[i]);
          }
        }
      }
    }
    return this;
  }

  removeClass(className) {
    const classes = className.split(' ');
    for (let i = 0; i < classes.length; i += 1) {
      for (let j = 0; j < this.length; j += 1) {
        if (typeof this[j] !== 'undefined' && typeof this[j].classList !== 'undefined')
          this[j].classList.remove(classes[i]);
      }
    }
    return this;
  }

  clearClass() {
    let n;
    for (let i = 0; i < this.length; i += 1) {
      if (typeof this[i] !== 'undefined' && typeof this[i].classList !== 'undefined') {
        n = this[i];
        for (let j = 0; j < n.classList.length; j++) n.classList.remove(n.classList.item(j));
      }
    }
    return this;
  }

  replaceClass(src, dst) {
    let n;
    for (let i = 0; i < this.length; i += 1) {
      if (typeof this[i] !== 'undefined' && typeof this[i].classList !== 'undefined') {
        n = this[i];
        if (n.contains(src)) n.classList.replace(src, dst);
        else n.classList.add(dst);
      }
    }
    return this;
  }

  /**
   * Add or remove classes from the given element.
   * @param {string} value - The classes to be toggled.
   * @param {boolean} add - add or remove.
   */
  toggleClass(className, add) {
    const classes = className.split(' ');
    for (let i = 0; i < classes.length; i += 1) {
      for (let j = 0; j < this.length; j += 1) {
        if (typeof this[j] !== 'undefined' && typeof this[j].classList !== 'undefined') {
          if (arguments.length === 1) this[j].classList.toggle(classes[i]);
          else add ? this[j].classList.add(classes[i]) : this[j].classList.remove(classes[i]);
        }
      }
    }
    return this;
  }
}

function likeArray(obj) {
  var length = !!obj && 'length' in obj && obj.length,
    type = $.type(obj);

  return (
    'function' != type &&
    !$.isWindow(obj) &&
    ('array' == type ||
      length === 0 ||
      (typeof length == 'number' && length > 0 && length - 1 in obj))
  );
}

// 去掉 null 节点
function compact(array) {
  return filter.call(array, function (item) {
    return item != null;
  });
}

function flatten(array) {
  return array.length > 0 ? $.fn.concat.apply([], array) : array;
}

// `$.zepto.fragment` takes a html string and an optional tag name
// to generate DOM nodes from the given html string.
// The generated DOM nodes are returned as an array.
// it compatible with browsers that don't support the DOM fully.
function fragment(html, name, properties) {
  let R;

  // A special case optimization for a single tag
  if (singleTagRE.test(html)) R = $(document.createElement(RegExp.$1));

  if (!R) {
    if (html.replace) html = html.replace(tagExpanderRE, '<$1></$2>');
    if (name === undefined) name = fragmentRE.test(html) && RegExp.$1;

    const containers = {
      tr: 'tbody',
      tbody: 'table',
      thead: 'table',
      tfoot: 'table',
      td: 'tr',
      th: 'tr',
      li: 'ul',
      option: 'select',
      '*': 'div',
    };

    if (!(name in containers)) name = '*';
    const container = document.createElement(containers[name]);
    container.innerHTML = '' + html;
    R = $.each(slice.call(container.childNodes), function () {
      container.removeChild(this);
    });
  }

  if ($.isPlainObject(properties)) {
    const nodes = $(R);
    // special attributes that should be get/set via method calls
    const methodAttributes = ['val', 'css', 'html', 'text', 'data', 'width', 'height', 'offset'];

    $.each(properties, (key, value) => {
      if (methodAttributes.indexOf(key) > -1) nodes[key](value);
      else nodes.attr(key, value);
    });
  }

  return R;
}

/**
 * 将选择器组件封装为Dom组件
 * @param {*} sel selector 选择器，支持点击事件对象自动转换为target
 * @param {*} ctx context or name
 * true：为 name
 * @param {boolean=} name 加载有名dom，默认为 false
 * @returns Dom实例，D instance
 */
function $(sel, ctx, name) {
  let R = [];

  if (sel) {
    if (!name && ctx === true) {
      name = true;
      ctx = null;
    }

    if (typeof sel === 'string') {
      sel = (sel || '').trim();

      if (sel[0] === '#') {
        const dom = document.getElementById(sel.substr(1));
        if (dom) R.push(dom);
      } else if (sel[0] === '<' && fragmentRE.test(sel))
        (R = fragment(sel, RegExp.$1, ctx)), (sel = null);
      else if (ctx) return $(ctx).find(sel);
      else R = $.qsa(sel);
    } else if (sel.nodeType || sel === window || sel === document) {
      R = [sel];
      sel = null;
    } else if (D.isD(sel)) return sel;
    else if ($.isFunction(sel)) return document.ready(sel);
    // 触摸或鼠标事件
    else if (
      $.isObject(sel) &&
      sel.target &&
      (sel.target.nodeType || sel.target === window || sel.target === document)
    ) {
      R = [sel.target];
      sel = null;
    } else {
      // normalize array if an array of nodes is given
      if ($.isArray(sel)) R = compact(sel);
      // Wrap DOM nodes.
      //else if ($.isObject(sel))
      // If it's a html fragment, create nodes from it
      else if (fragmentRE.test(sel)) (R = fragment(sel, RegExp.$1, ctx)), (sel = null);
      else if (ctx) return $(ctx).find(sel);
      else R = $.qsa(sel);
    }
  }

  return new D(R, sel, name);
}

// plugin compatibility
$.uuid = 0;
$.expr = {};
$.noop = function () {};
$.support = support;
$.fragment = fragment;

const ObjToString = Object.prototype.toString;

function getTag(value) {
  if (value == null) {
    return value === undefined ? '[object Undefined]' : '[object Null]';
  }
  return ObjToString.call(value);
}

// 静态属性,可直接调用，识别 boolean、string、number、object、date、array、regexp、function
$.type = function (obj) {
  return obj == null ? String(obj) : class2type[toString.call(obj)] || 'object';
};
// eslint-disable-next-line func-names
$.isWindow = function (o) {
  return o != null && o == o.window;
};
// 纯对象变量，不包含函数、Date、正则、数组等对象
$.isObject = v => $.type(v) === 'object';
$.isMap = v => $.type(v) === 'Map';
$.isSet = v => $.type(v) === 'Set';
$.isRegExp = v => $.type(v) === 'RegExp';
$.isSymbol = v => $.type(v) === 'symbol';
$.isObj = $.isObject;
$.isPromise = val =>
  ($.isObject(val) || $.isFunction(val)) && $.isFunction(val.then) && $.isFunction(val.catch);

// 值变量
$.isValue = function (o) {
  return $.type(o) === 'string' || $.type(o) === 'number' || $.type(o) === 'boolean';
};
$.isVal = $.isValue;

// 函数变量
$.isFunction = function (value) {
  return $.type(value) === 'function';
};

$.isFun = $.isFunction;

$.isDocument = function (o) {
  return o != null && o.nodeType == o.DOCUMENT_NODE;
};
$.isDoc = $.isDocument;

$.isPlainObject = function (o) {
  return $.isObject(o) && !$.isWindow(o) && Object.getPrototypeOf(o) == Object.prototype;
};
$.isPlain = $.isPlainObject;

$.isEmptyObject = function (o) {
  var name;
  for (name in o) return false;
  return true;
};
$.isEmpty = function (o) {
  if ($.isObject(o)) return $.isEmptyObject(o);
  else if ($.isArray(o)) return o.length === 0;
  else return o === '' || o === null || o === undefined;
};

/**
 * undefined or null
 * @param {*} v
 * @returns
 */
$.isNull = function (v) {
  return v == null;
};

$.isBool = function (v) {
  return $.type(v) === 'boolean';
};

$.hasVal = function (v) {
  return !$.isEmpty(v);
};
$.isArray =
  Array.isArray ||
  function (object) {
    return object instanceof Array;
  };
$.inArray = function (elem, array, i) {
  return emptyArray.indexOf.call(array, elem, i);
};

// jQuery new Date() 判断为 数字
$.isNumeric = function (val) {
  return typeof val === 'number' || ($.isObject(val) && getTag(val) == '[object Number]');
};

$.isNumber = $.isNumeric;
$.isNum = $.isNumeric;
$.isString = v => $.type(v) === 'string';
$.isStr = $.isString;
$.isDom = v => D.isD(v);
$.isDate = v => $.type(v) === 'date';

$.isDateStr = function (v) {
  return Date.parse(v) > 0;
};

$.isNumStr = function (v) {
  return !Number.isNaN(Number(v));
};

$.funcArg = function (context, arg, idx, payload) {
  return $.isFunction(arg) ? arg.call(context, idx, payload) : arg;
};

$.contains = document.documentElement.contains
  ? function (parent, node) {
      return parent !== node && parent.contains(node);
    }
  : function (parent, node) {
      while (node && (node = node.parentNode)) if (node === parent) return true;
      return false;
    };

/**
 * 判断元素el是否匹配选择器sel
 */
$.matches = function (el, sel) {
  let R = false;

  try {
    if (!sel || !el) return false;

    if (sel === document) R = el === document;
    else if (sel === window) R = el === window;
    else if (sel.nodeType) R = el === sel;
    else if (sel instanceof D) R = ~sel.indexOf(el);
    else if (el.nodeType === 1 && typeof sel === 'string') {
      const match =
        el.matches ||
        el.webkitMatchesSelector ||
        el.mozMatchesSelector ||
        el.oMatchesSelector ||
        el.matchesSelector;

      if (match) R = match.call(el, sel);
      else {
        // fall back to performing a selector:
        let parent = el.parentNode;
        const temp = !parent;
        if (temp) (parent = tempParent).appendChild(el);
        R = ~$.qsa(sel, parent).indexOf(el);
        temp && tempParent.removeChild(el);
      }
    }
  } catch (e) {
    console.log('matches exp:', e.message);
  }

  return R;
};

$.trim = function (str) {
  return str == null ? '' : String.prototype.trim.call(str);
};

// 遍历数组或对象元素，生成新的数组
$.map = function (els, cb) {
  const R = [];
  if (likeArray(els))
    for (let i = 0; i < els.length; i++) {
      try {
        const v = cb(els[i], i);
        if (v != null) R.push(v);
      } catch (e) {
        console.log('map exp:', e.message);
      }
    }
  else {
    els.keys.forEach(k => {
      try {
        const v = cb(els[k], k);
        if (v != null) R.push(v);
      } catch (e) {
        console.log('map exp:', e.message);
      }
    });
  }
  return flatten(R); // 拉平
};

// 数组中的节点元素作为this参数，传递到cb中，返回数组
$.each = function (els, cb) {
  var i, key;
  if (likeArray(els)) {
    for (i = 0; i < els.length; i++) if (cb.call(els[i], i, els[i]) === false) return els;
  } else {
    for (key in els) if (cb.call(els[key], key, els[key]) === false) return els;
  }

  return els;
};

$.forEach = function (els, cb) {
  var i, key;
  if (likeArray(els)) {
    for (i = 0; i < els.length; i++) if (cb.call(els[i], els[i], i) === false) return els;
  } else {
    for (key in els) if (cb.call(els[key], els[key], key) === false) return els;
  }

  return els;
};

$.grep = function (els, cb) {
  return filter.call(els, cb);
};

// Populate the class2type map
$.each(
  'Boolean Number String Function Array Date RegExp Object Error'.split(' '),
  function (i, name) {
    class2type['[object ' + name + ']'] = name.toLowerCase();
  }
);

$.id = function (x) {
  return document.getElementById(x);
};

$.qu = $.qs = function (sel, ctx) {
  var R = null;
  try {
    let el = ctx;
    if (!ctx) el = document;
    else if (D.isD(ctx)) el = ctx[0];

    var maybeID = sel[0] == '#',
      nameOnly = maybeID ? sel.slice(1) : sel, // Ensure that a 1 char tag name still gets checked
      isSimple = simpleSelectorRE.test(nameOnly);

    if (document.getElementById && isSimple && maybeID)
      // Safari DocumentFragment doesn't have getElementById
      R = document.getElementById(nameOnly);
    else R = el.querySelector(sel);
  } catch (e) {
    console.error('$.qu/qs exp:', e.message);
  }

  return R;
};

// `$.qsa` is Dom's CSS selector implementation which
// uses `.querySelectorAll` and optimizes for some special cases, like `#id`.
// 返回数组, 便于 forEach，参数与zepto参数相反
$.qus = $.qsa = function (sel, ctx) {
  var R = [];
  try {
    let el = ctx;
    if (!ctx) el = document;
    else if (D.isD(ctx)) el = ctx[0];

    var found,
      maybeID = sel[0] == '#',
      maybeClass = !maybeID && sel[0] == '.',
      nameOnly = maybeID || maybeClass ? sel.slice(1) : sel, // Ensure that a 1 char tag name still gets checked
      isSimple = simpleSelectorRE.test(nameOnly);

    if (document.getElementById && isSimple && maybeID)
      // Safari DocumentFragment doesn't have getElementById
      R = (found = document.getElementById(nameOnly)) ? [found] : [];
    else if (el.nodeType === 1 || el.nodeType === 9 || el.nodeType === 11) {
      try {
        const ns =
          isSimple && !maybeID && el.getElementsByClassName // DocumentFragment doesn't have getElementsByClassName/TagName
            ? maybeClass
              ? el.getElementsByClassName(nameOnly) // If it's simple, it could be a class
              : el.getElementsByTagName(sel) // Or a tag
            : el.querySelectorAll(sel); // Or it's not simple, and we need to query all

        if (ns && ns.length > 0) R = slice.call(ns);
      } catch (e) {
        console.error('$.qus/qsa exp:', e.message);
      }
    }
  } catch (e) {
    console.error('$.qus/qsa exp:', e.message);
  }

  return R;
};

/**
 * 通过name获得dom对象
 * getElementsByName 只能用于document全局，querySelector 可用于局部
 * @param {string} name
 * @param {object} ctx parent dom
 */
$.qn = function qn(name, ctx) {
  const sel = `[name="${name}"]`;
  return $.qu(sel, ctx);
};

// 返回指定name数组, 便于 forEach
// 效率高于qus
$.qns = function (name, ctx) {
  var R = null;
  if (ctx) R = $.qus(`[name="${name}"]`, ctx);
  else {
    R = document.getElementsByName(name);
    if (R && R.length > 0) R = slice.call(R);
    else R = [];
  }

  return R;
};

// 返回指定class name数组, 便于 forEach
// 效率高于qus
$.qcs = function (sel, ctx) {
  var R = null;
  if (ctx) R = D.isD(ctx) ? ctx[0].getElementsByClassName(sel) : ctx.getElementsByClassName(sel);
  else R = document.getElementsByClassName(sel);
  if (R && R.length > 0) return slice.call(R);
  else return [];
};

// 返回指定tag name数组, 便于 forEach
// 效率高于qus
$.qts = function (sel, ctx) {
  var R = null;
  if (ctx) R = D.isD(ctx) ? ctx[0].getElementsByTagName(sel) : ctx.getElementsByTagName(sel);
  else R = document.getElementsByTagName(sel);
  if (R && R.length > 0) return slice.call(R);
  else return [];
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
    const ks = Object.keys(Object(src));
    //   for (key in src) {
    for (let i = 0, len = ks.length; i < len; i += 1) {
      const k = ks[i];
      const desc = Object.getOwnPropertyDescriptor(src, k);
      if (desc !== undefined && desc.enumerable) {
        if (deep && ($.isPlainObject(src[k]) || $.isArray(src[k]))) {
          if ($.isPlainObject(src[k]) && !$.isPlainObject(to[k])) to[k] = {};
          if ($.isArray(src[k]) && !$.isArray(to[k])) to[k] = [];
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
$.assign = function (to, ...srcs) {
  if (to === undefined || to === null) return {};

  let deep;
  if (typeof to === 'boolean') {
    deep = to;
    to = srcs.shift();
  }
  srcs.forEach(src => {
    assign(to, src, deep);
  });
  return to;
};

$.extend = $.assign;

$.merge = function (...args) {
  const to = args[0];
  args.splice(0, 1);
  args.forEach(src => {
    assign(to, src, false);
  });
  return to;
};

$.fastLink = function (ctx) {
  // fastLink a 标签加载 touchstart 事件,避免 300毫秒等待，带back attr，调用浏览器返回
  try {
    const links = $.qus('a[fastLink][fastlink][back]', ctx);
    links.forEach(link => {
      if ($.support.touch) {
        let startX;
        let startY;
        link.ontouchstart = ev => {
          startX = ev.changedTouches[0].clientX;
          startY = ev.changedTouches[0].clientY;
        };
        link.ontouchend = ev => {
          if (
            Math.abs(ev.changedTouches[0].clientX - startX) <= 5 &&
            Math.abs(ev.changedTouches[0].clientY - startY) <= 5
          ) {
            // ev.preventDefault();
            if (link.hasAttribute('back')) return window.history.back();
            if (link.href) window.location.href = link.href;
          }
        };
      } else if (link.hasAttribute('back')) {
        link.onclick = ev => {
          return window.history.back();
        };
      }
    });
  } catch (e) {
    alert(`fastLink exp: ${e.message}`);
  }
};

$.requestAnimationFrame = function (callback) {
  if (window.requestAnimationFrame) return window.requestAnimationFrame(callback);
  else if (window.webkitRequestAnimationFrame) return window.webkitRequestAnimationFrame(callback);
  return window.setTimeout(callback, 1000 / 60);
};

$.cancelAnimationFrame = function (id) {
  if (window.cancelAnimationFrame) return window.cancelAnimationFrame(id);
  else if (window.webkitCancelAnimationFrame) return window.webkitCancelAnimationFrame(id);
  return window.clearTimeout(id);
};
$.deleteProps = function (obj) {
  const object = obj;
  Object.keys(object).forEach(key => {
    try {
      object[key] = null;
    } catch (e) {
      // no setter for object
    }
    try {
      delete object[key];
    } catch (e) {
      // something got wrong
    }
  });
};

// 下个事件周期触发
$.nextTick = function (cb, delay = 0) {
  return setTimeout(cb, delay);
};

// 类似 setTimeout的精准动画帧时间出发
$.nextFrame = function (cb) {
  return $.requestAnimationFrame(() => {
    $.requestAnimationFrame(cb);
  });
};

$.now = function () {
  return Date.now();
};

$.exp = function (info, e) {
  console.error(`${info} exp:${e.message}`);
};

/**
 * 格式化日期，主要用于MongoDb数据库中返回的ISODate格式转换为本地时区指定字符串格式。
 * 或者将日期字符串转换为Date实例，主要修正yyyy-MM-dd这种格式的js bug，和日期加减
 * 由于字符串转换为Date时，会按时区加减时间，保存到 js 内的 Date对象，都是标准时间。
 * 标准时间转换为字符串时，js 内置函数会根据当前时区还原时间，也就是说Date内部实际上是统一的
 * 不同时区，转换为字符串时，显示不同。
 * 如果数据库使用Date对象保存时间字段，不会有问题
 * 如果使用字符串保存时间，'yyyy-MM-dd' 与 'yyyy/MM/dd' 保存到数据库里面的时间不一样。
 * 'yyyy/MM/dd' 会减8小时，'yyyy-MM-dd' 不会减。
 * '2022-02-10' 不会减8小时，'2022-2-10' 会减8小时。
 * '2022-02-10 12:00:00' 会减8小时。
 * '2022-12-10' 不会减8小时。
 * 这应该是 js的一个bug！！！
 * 因此，数据库查询与保存时，对日期类型，需谨慎操作！！！
 * 从数据库取出时，需加8小时，'yyyy-mm-dd'格式会多8小时。
 * 因此需将'yyyy-mm-dd'转换为'yyyy/MM/dd'标准时间保存
 * 标准时间转换
 * date('2022-02-10')，将-替换成/，返回Date对象
 * 格式化
 * date('yyyy-MM-dd hh:mm:ss')
 * date('yyyy-MM-dd hh:mm:ss.S')
 * date('yyyyMMddhhmmssS')
 * date('yy-M-d')
 * date('', 3) 当前日期加三天
 * date('', -3) 当前日期减三天
 * @param {string} fmt 缺省yyyy-MM-dd
 * @param {string|object} d
 *  UTC标准时间"2022-02-21T17:43:33.000Z"，或者 "2022-02-21 17:43:33"，
 *  标准时间格式会加8小时时区，普通时间不会加时区。
 *  或者 Date实例，缺省new Date()
 * @returns {string}
 *  fmt为格式，则返回字符串，
 *  fmt为日期，则返回Date实例
 */
$.date = function (fmt, d) {
  if (!fmt) fmt = 'yyyy-MM-dd';
  else if (/^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(fmt)) {
    //  2022-10-10 => 2022/10/10
    if (/^\d{4}[-]\d{1,2}[-]\d{1,2}$/.test(fmt)) fmt = fmt.replace(/-/g, '/');
    let R = new Date(fmt);
    if (d && $.isNumber(d))
      // 加减 天数
      R = new Date(R.getTime() + d * 86400000);
    return R;
  }

  if (!d) d = new Date();
  else if (typeof d === 'string') {
    //  2022-10-10 => 2022/10/10
    if (/^\d{4}[-]\d{1,2}[-]\d{1,2}$/.test(d)) d = d.replace(/-/g, '/');
    // 兼容标准时间字符串
    // .replace(/T/g, ' ')
    // .replace(/\.+[0-9]+[A-Z]$/, '');
    // 还原为标准时间，getTimezoneOffset UTC与当地时差分钟数，比如中国是 -480分钟
    // d = new Date(d).getTime() - 60000 * new Date().getTimezoneOffset();
    // Date自动处理时区，ISODate格式不处理时区，本地普通字符串格式-8小时
    d = new Date(d);
  } else if ($.isNumber(d))
    // 加减 天数
    d = new Date(Date.now() + d * 86400000);

  // Date.getXXX 函数会自动还原时区！！！
  const o = {
    y: d.getFullYear().toString(),
    M: d.getMonth() + 1, // 月份
    d: d.getDate(), // 日
    H: d.getHours(), // 小时
    h: d.getHours(), // 小时
    m: d.getMinutes(), // 分
    s: d.getSeconds(), // 秒
    q: Math.floor((d.getMonth() + 3) / 3), // 季度
    S: d.getMilliseconds().toString().padStart(3, '0'), // 毫秒
  };

  // yy几个就返回 几个数字，使用 slice -4 倒数4个，再往后
  fmt = fmt.replace(/(S+)/g, o.S).replace(/(y+)/gi, v => o.y.slice(-v.length));
  fmt = fmt.replace(/(M+|d+|h+|H+|m+|s+|q+)/g, v =>
    ((v.length > 1 ? '0' : '') + o[v.slice(-1)]).slice(-2)
  );

  return fmt.replace(/\s+00:00:00$/g, '');
};

$.uniqueNumber = function () {
  uniqueNumber += 1;
  return uniqueNumber;
};

$.num = $.uniqueNumber;

$.uid = function (mask = 'xxxxxxxxxx', map = '0123456789abcdef') {
  const {length} = map;
  return mask.replace(/x/g, () => map[Math.floor(Math.random() * length)]);
};

$.camelCase = function (str) {
  return str.toLowerCase().replace(/-+(.)/g, (match, chr) => {
    return chr ? chr.toUpperCase() : '';
  });
};

$.uniq = function (array) {
  return filter.call(array, (item, idx) => {
    return array.indexOf(item) === idx;
  });
};

// two params promisify
$.promisify = function (f) {
  return (...arg) =>
    new Promise((res, rej) => {
      f(...arg, (err, rs) => {
        if (err) rej(err);
        else res(rs);
      });
    });
};

// one param promisify
$.promise = function (f) {
  return (...arg) =>
    new Promise((res, rej) => {
      try {
        f(...arg, rs => {
          res(rs);
        });
      } catch (ex) {
        rej(ex.message);
      }
    });
};

$.urlParam = function (url) {
  const query = {};
  let urlToParse = url || window.location.href;
  let i;
  let params;
  let param;
  let length;
  if (typeof urlToParse === 'string' && urlToParse.length) {
    urlToParse = urlToParse.indexOf('?') > -1 ? urlToParse.replace(/\S*\?/, '') : '';
    params = urlToParse.split('&').filter(paramsPart => paramsPart !== '');
    length = params.length;

    for (i = 0; i < length; i += 1) {
      param = params[i].replace(/#\S+/g, '').split('=');
      query[decodeURIComponent(param[0])] =
        typeof param[1] === 'undefined'
          ? undefined
          : decodeURIComponent(param.slice(1).join('=')) || '';
    }
  }
  return query;
};

// "true"  => true
// "false" => false
// "null"  => null
// "42"    => 42
// "42.5"  => 42.5
// "08"    => "08"
// JSON    => parse if valid
// String  => self
$.deserializeValue = function (value) {
  try {
    return value
      ? value == 'true' ||
          (value == 'false'
            ? false
            : value == 'null'
            ? null
            : +value + '' == value
            ? +value
            : /^[\[\{]/.test(value)
            ? JSON.parse(value)
            : value)
      : value;
  } catch (e) {
    return value;
  }
};

$.fullScreen = function (el) {
  if (el.requestFullscreen) {
    el.requestFullscreen();
  } else if (el.mozRequestFullScreen) {
    el.mozRequestFullScreen();
  } else if (el.webkitRequestFullscreen) {
    el.webkitRequestFullscreen();
  } else if (el.msRequestFullscreen) {
    el.msRequestFullscreen();
  }
};

$.exitFullScreen = function () {
  if (document.exitFullScreen) {
    document.exitFullScreen();
  } else if (document.mozCancelFullScreen) {
    document.mozCancelFullScreen();
  } else if (document.webkitExitFullscreen) {
    document.webkitExitFullscreen();
  } else if (document.msExitFullscreen) {
    document.msExitFullscreen();
  }
};

$.isFullScreen = function () {
  return !!(
    document.fullscreen ||
    document.mozFullScreen ||
    document.webkitIsFullScreen ||
    document.webkitFullScreen ||
    document.msFullScreen
  );
};

$.ready = document.ready;
$.fn = D.prototype;
$.Class = D;
$.Dom = D;
// ssr
$.window = window;
$.document = document;

export default $;
