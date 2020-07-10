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
  tagExpanderRE = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
  rootNodeRE = /^(?:body|html)$/i,
  capitalRE = /([A-Z])/g,
  fragmentRE = /^\s*<(\w+|!)[^>]*>/,
  uniqueNumber = 1;

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
  constructor(doms, sel) {
    const len = doms ? doms.length : 0;
    for (let i = 0; i < len; i++) this[i] = doms[i];

    this.dom = doms ? doms[0] : null;
    this.length = len;
    this.selector = sel || '';
  }

  static isD(d) {
    return d instanceof D;
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
        if (
          typeof this[j] !== 'undefined' &&
          typeof this[j].classList !== 'undefined'
        )
          this[j].classList.remove(classes[i]);
      }
    }
    return this;
  }

  hasClass(name) {
    return emptyArray.some.call(this, function (el) {
      return el.classList.contains(name);
    });
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
        if (
          typeof this[j] !== 'undefined' &&
          typeof this[j].classList !== 'undefined'
        ) {
          if (arguments.length === 1) this[j].classList.toggle(classes[i]);
          else
            add
              ? this[j].classList.add(classes[i])
              : this[j].classList.remove(classes[i]);
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

function compact(array) {
  return filter.call(array, function (item) {
    return item != null;
  });
}

// `$.zepto.fragment` takes a html string and an optional tag name
// to generate DOM nodes from the given html string.
// The generated DOM nodes are returned as an array.
// This function can be overridden in plugins for example to make
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
    const methodAttributes = [
      'val',
      'css',
      'html',
      'text',
      'data',
      'width',
      'height',
      'offset',
    ];

    $.each(properties, (key, value) => {
      if (methodAttributes.indexOf(key) > -1) nodes[key](value);
      else nodes.attr(key, value);
    });
  }

  return R;
}

/**
 * return D instance
 * @param {*} sel selector
 * @param {*} ctx context
 */
function $(sel, ctx) {
  let R = [];

  if (sel) {
    if (typeof sel === 'string') {
      sel = (sel || '').trim();

      if (sel[0] === '#') {
        const dom = document.getElementById(sel.substr(1));
        if (dom) R.push(dom);
      } else if (sel[0] === '<' && fragmentRE.test(sel))
        (R = fragment(sel, RegExp.$1, ctx)), (sel = null);
      else R = $.qsa(sel, ctx);
    } else if (sel.nodeType || sel === window || sel === document) {
      R = [sel];
      sel = null;
    } else if (D.isD(sel)) return sel;
    else if ($.isFunction(sel)) return document.ready(sel);
    else {
      // normalize array if an array of nodes is given
      if ($.isArray(sel)) R = compact(sel);
      // Wrap DOM nodes.
      //else if ($.isObject(sel))
      // If it's a html fragment, create nodes from it
      else if (fragmentRE.test(sel))
        (R = fragment(sel, RegExp.$1, ctx)), (sel = null);
      // // If there's a context, create a collection on that context first, and select
      // // nodes from there
      // else if (context !== undefined) return $(context).find(selector)
      // // And last but no least, if it's a CSS selector, use it to select nodes.
      // else ds = zepto.qsa(document, selector)
    }
  }

  return new D(R, sel);
}

// plugin compatibility
$.uuid = 0;
$.expr = {};
$.noop = function () {};
$.support = support;

// 静态属性,可直接调用
$.type = function (obj) {
  return obj == null ? String(obj) : class2type[toString.call(obj)] || 'object';
};
// eslint-disable-next-line func-names
$.isWindow = function (o) {
  return o != null && o == o.window;
};
$.isObject = function (o) {
  return $.type(o) === 'object'; // && o !== null && o.constructor && o.constructor === Object;
};
$.isFunction = function (value) {
  return $.type(value) === 'function';
};
$.isDocument = function (o) {
  return o != null && o.nodeType == o.DOCUMENT_NODE;
};
$.isPlainObject = function (o) {
  return (
    $.isObject(o) &&
    !$.isWindow(o) &&
    Object.getPrototypeOf(o) == Object.prototype
  );
};
$.isEmptyObject = function (o) {
  var name;
  for (name in o) return false;
  return true;
};
$.isEmpty = function(o) {
	if ($.isObject(o)) return $.isEmptyObject(o);
	else if ($.isArray(o)) return o.length === 0;
	else return (o === '' || o === null || o === undefined);
};
$.hasVal = function(o) {
	return !$.isEmpty(o);
};
$.isArray =
  Array.isArray ||
  function (object) {
    return object instanceof Array;
  };
$.inArray = function (elem, array, i) {
  return emptyArray.indexOf.call(array, elem, i);
};
$.isNumeric = function (val) {
  var num = Number(val),
    type = typeof val;
  return (
    (val != null &&
      type != 'boolean' &&
      (type != 'string' || val.length) &&
      !isNaN(num) &&
      isFinite(num)) ||
    false
  );
};

$.isNumber = $.isNumeric;
$.isString = function (o) {
  return $.type(o) === 'string';
};

$.isDom = function(v) {
	return D.isD(v);
}

$.contains = document.documentElement.contains
  ? function (parent, node) {
      return parent !== node && parent.contains(node);
    }
  : function (parent, node) {
      while (node && (node = node.parentNode)) if (node === parent) return true;
      return false;
    };

$.funcArg = function (context, arg, idx, payload) {
  return isFunction(arg) ? arg.call(context, idx, payload) : arg;
};

$.trim = function(str) {
  return str == null ? '' : String.prototype.trim.call(str);
};

/**
 * 去除字符串头部空格或指定字符
 */
$.trimStart = function(s, c) {
  if (!c) return String(s).replace(/(^\s*)/g, '');

  const rx = new RegExp(format('^%s*', c));
  return String(s).replace(rx, '');
}

/**
 * 去除字符串尾部空格或指定字符
 */
$.trimEnd = function(s, c) {
  if (!s) return '';

  if (!c) return String(s).replace(/(\s*$)/g, '');

  const rx = new RegExp(format('%s*$', c));
  return String(s).replace(rx, '');
}

$.map = function (els, cb) {
  var value,
    values = [],
    i,
    key;
  if (likeArray(els))
    for (i = 0; i < els.length; i++) {
      value = cb(els[i], i);
      if (value != null) values.push(value);
    }
  else
    for (key in els) {
      value = cb(els[key], key);
      if (value != null) values.push(value);
    }
  return values;
};

$.each = function (els, cb) {
  var i, key;
  if (likeArray(els)) {
    for (i = 0; i < els.length; i++)
      if (cb.call(els[i], i, els[i]) === false) return els;
  } else {
    for (key in els) if (cb.call(els[key], key, els[key]) === false) return els;
  }

  return els;
};

$.forEach = function (els, cb) {
  var i, key;
  if (likeArray(els)) {
    for (i = 0; i < els.length; i++)
      if (cb.call(els[i], els[i], i) === false) return els;
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

$.qu = function (sel, ctx) {
  if (ctx)
    return D.isD(ctx) ? ctx[0].querySelector(sel) : ctx.querySelector(sel);
  return document.querySelector(sel);
};

// 返回数组, 便于 forEach
$.qus = $.qsa = function (sel, ctx) {
  var R = null;
  if (ctx)
    R = D.isD(ctx) ? ctx[0].querySelectorAll(sel) : ctx.querySelectorAll(sel);
  else R = document.querySelectorAll(sel);
  if (R && R.length > 0) return slice.call(R);
  else return [];
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
$.qns = function (sel, ctx) {
  var R = null;
  if (ctx)
    R = D.isD(ctx) ? ctx[0].getElementsByName(sel) : ctx.getElementsByName(sel);
  else R = document.getElementsByName(sel);
  if (R && R.length > 0) return slice.call(R);
  else return [];
};

// 返回指定class name数组, 便于 forEach
// 效率高于qus
$.qcs = function (sel, ctx) {
  var R = null;
  if (ctx)
    R = D.isD(ctx)
      ? ctx[0].getElementsByClassName(sel)
      : ctx.getElementsByClassName(sel);
  else R = document.getElementsByClassName(sel);
  if (R && R.length > 0) return slice.call(R);
  else return [];
};

// 返回指定tag name数组, 便于 forEach
// 效率高于qus
$.qts = function (sel, ctx) {
  var R = null;
  if (ctx)
    R = D.isD(ctx)
      ? ctx[0].getElementsByTagName(sel)
      : ctx.getElementsByTagName(sel);
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
  if (!to) return {};
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
$.fastLink = function () {
  // a 标签加载 touchstart 事件,避免 300毫秒等待
  try {
    if (!$.support.touch) return;
    const links = $.qus('a');
    links.forEach(link => {
      if (link.hasAttribute('fastlink') || link.hasAttribute('fastLink')) {
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
            if (link.hasAttribute('back') || link.hasClass('back'))
              return window.history.back();
            if (link.href) window.location.href = link.href;
          }
        };
      }
    });
  } catch (e) {
    alert(`fastLink exp: ${e.message}`);
  }
};
$.requestAnimationFrame = function (callback) {
  if (window.requestAnimationFrame)
    return window.requestAnimationFrame(callback);
  else if (window.webkitRequestAnimationFrame)
    return window.webkitRequestAnimationFrame(callback);
  return window.setTimeout(callback, 1000 / 60);
};

$.cancelAnimationFrame = function (id) {
  if (window.cancelAnimationFrame) return window.cancelAnimationFrame(id);
  else if (window.webkitCancelAnimationFrame)
    return window.webkitCancelAnimationFrame(id);
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

$.nextTick = function (cb, delay = 0) {
  return setTimeout(cb, delay);
};
$.nextFrame = function (cb) {
  return $.requestAnimationFrame(() => {
    $.requestAnimationFrame(cb);
  });
};
$.now = function () {
  return Date.now();
};

$.uniqueNumber = function () {
  uniqueNumber += 1;
  return uniqueNumber;
};

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
    urlToParse =
      urlToParse.indexOf('?') > -1 ? urlToParse.replace(/\S*\?/, '') : '';
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

$.ready = document.ready;
$.fn = D.prototype;
$.Class = D;
$.Dom = D;
// ssr
$.window = window;
$.document = document;

export default $;
