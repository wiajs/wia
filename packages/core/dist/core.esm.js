/*!
  * wia core v0.1.6
  * (c) 2020 Sibyl Yu
  * @license MIT
  */
/**
 * promise version ajax get、post
 * return Promise objext.
 * get move to base.js
 */
var Ajax =
/*#__PURE__*/
function () {
  function Ajax() {}

  var _proto = Ajax.prototype;

  _proto.post = function post(url, data) {
    var pm = new Promise(function (res, rej) {
      var xhr = $.getXhr();

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
  ;

  _proto.postForm = function postForm(url, data) {
    var pm = new Promise(function (res, rej) {
      var xhr = $.getXhr();

      xhr.onreadystatechange = function () {
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
  };

  _proto.get = function get(url, param) {
    return $.get(url, param);
  };

  return Ajax;
}();

function objToParam(obj) {
  var rs = '';
  var arr = [];

  for (var k in obj) {
    if (obj.hasOwnProperty(k)) {
      arr.push(k + "=" + obj[k]);
    } // rs += `${k}=${obj[k]}&`;

  } // 排序


  rs = arr.sort().join('&'); // alert(rs);

  return rs;
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _inheritsLoose(subClass, superClass) {
  subClass.prototype = Object.create(superClass.prototype);
  subClass.prototype.constructor = subClass;
  subClass.__proto__ = superClass;
}

function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

function isNativeReflectConstruct() {
  if (typeof Reflect === "undefined" || !Reflect.construct) return false;
  if (Reflect.construct.sham) return false;
  if (typeof Proxy === "function") return true;

  try {
    Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
    return true;
  } catch (e) {
    return false;
  }
}

function _construct(Parent, args, Class) {
  if (isNativeReflectConstruct()) {
    _construct = Reflect.construct;
  } else {
    _construct = function _construct(Parent, args, Class) {
      var a = [null];
      a.push.apply(a, args);
      var Constructor = Function.bind.apply(Parent, a);
      var instance = new Constructor();
      if (Class) _setPrototypeOf(instance, Class.prototype);
      return instance;
    };
  }

  return _construct.apply(null, arguments);
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var dom_common_min = createCommonjsModule(function (module) {

var t = $.Dom,
    e = [];
var n = Object.freeze({
  __proto__: null,
  attr: function attr(t, e) {
    if (1 === arguments.length && "string" == typeof t) return this[0] ? this[0].getAttribute(t) : void 0;

    for (var n = 0; n < this.length; n += 1) {
      if (2 === arguments.length) this[n].setAttribute(t, e);else for (var r in t) {
        this[n][r] = t[r], this[n].setAttribute(r, t[r]);
      }
    }

    return this;
  },
  removeAttr: function removeAttr(t) {
    for (var e = 0; e < this.length; e += 1) {
      this[e].removeAttribute(t);
    }

    return this;
  },
  prop: function prop(t, e) {
    if (1 !== arguments.length || "string" != typeof t) {
      for (var n = 0; n < this.length; n += 1) {
        if (2 === arguments.length) this[n][t] = e;else for (var r in t) {
          this[n][r] = t[r];
        }
      }

      return this;
    }

    if (this[0]) return this[0][t];
  },
  data: function data(t, e) {
    var n;

    if (void 0 !== e) {
      for (var r = 0; r < this.length; r += 1) {
        (n = this[r]).domElementDataStorage || (n.domElementDataStorage = {}), n.domElementDataStorage[t] = e;
      }

      return this;
    }

    if (n = this[0]) {
      if (n.domElementDataStorage && t in n.domElementDataStorage) return n.domElementDataStorage[t];
      var i = n.getAttribute("data-" + t);
      return i || void 0;
    }
  },
  removeData: function removeData(t) {
    for (var e = 0; e < this.length; e += 1) {
      var n = this[e];
      n.domElementDataStorage && n.domElementDataStorage[t] && (n.domElementDataStorage[t] = null, delete n.domElementDataStorage[t]);
    }
  },
  dataset: function dataset() {
    var t = this[0];

    if (t) {
      var e = {};
      if (t.dataset) for (var n in t.dataset) {
        e[n] = t.dataset[n];
      } else for (var r = 0; r < t.attributes.length; r += 1) {
        var i = t.attributes[r];
        i.name.indexOf("data-") >= 0 && (e[$.camelCase(i.name.split("data-")[1])] = i.value);
      }

      for (var o in e) {
        "false" === e[o] ? e[o] = !1 : "true" === e[o] ? e[o] = !0 : parseFloat(e[o]) === 1 * e[o] && (e[o] *= 1);
      }

      return e;
    }
  },
  val: function val(t) {
    if (void 0 !== t) {
      for (var e = 0; e < this.length; e += 1) {
        var n = this[e];
        if (Array.isArray(t) && n.multiple && "select" === n.nodeName.toLowerCase()) for (var r = 0; r < n.options.length; r += 1) {
          n.options[r].selected = t.indexOf(n.options[r].value) >= 0;
        } else n.value = t;
      }

      return this;
    }

    if (this[0]) {
      if (this[0].multiple && "select" === this[0].nodeName.toLowerCase()) {
        for (var i = [], o = 0; o < this[0].selectedOptions.length; o += 1) {
          i.push(this[0].selectedOptions[o].value);
        }

        return i;
      }

      return this[0].value;
    }
  },
  transform: function transform(t) {
    for (var e = 0; e < this.length; e += 1) {
      var n = this[e].style;
      n.webkitTransform = t, n.transform = t;
    }

    return this;
  },
  transition: function transition(t) {
    "string" != typeof t && (t += "ms");

    for (var e = 0; e < this.length; e += 1) {
      var n = this[e].style;
      n.webkitTransitionDuration = t, n.transitionDuration = t;
    }

    return this;
  },
  on: function on() {
    for (var t = arguments.length, e = new Array(t), n = 0; n < t; n++) {
      e[n] = arguments[n];
    }

    var r = e[0],
        i = e[1],
        o = e[2],
        a = e[3];

    function s(t) {
      var e = t.target;

      if (e) {
        var n = t.target.domEventData || [];
        if (n.indexOf(t) < 0 && n.unshift(t), $(e).is(i)) o.apply(e, n);else for (var r = $(e).parents(), a = 0; a < r.length; a += 1) {
          $(r[a]).is(i) && o.apply(r[a], n);
        }
      }
    }

    function l(t) {
      var e = t && t.target && t.target.domEventData || [];
      e.indexOf(t) < 0 && e.unshift(t), o.apply(this, e);
    }

    "function" == typeof e[1] && (r = e[0], o = e[1], a = e[2], i = void 0), a || (a = !1);

    for (var h, u = r.split(" "), f = 0; f < this.length; f += 1) {
      var c = this[f];
      if (i) for (h = 0; h < u.length; h += 1) {
        var d = u[h];
        c.domLiveListeners || (c.domLiveListeners = {}), c.domLiveListeners[d] || (c.domLiveListeners[d] = []), c.domLiveListeners[d].push({
          listener: o,
          proxyListener: s
        }), c.addEventListener(d, s, a);
      } else for (h = 0; h < u.length; h += 1) {
        var v = u[h];
        c.domListeners || (c.domListeners = {}), c.domListeners[v] || (c.domListeners[v] = []), c.domListeners[v].push({
          listener: o,
          proxyListener: l
        }), c.addEventListener(v, l, a);
      }
    }

    return this;
  },
  off: function off() {
    for (var t = arguments.length, e = new Array(t), n = 0; n < t; n++) {
      e[n] = arguments[n];
    }

    var r = e[0],
        i = e[1],
        o = e[2],
        a = e[3];
    "function" == typeof e[1] && (r = e[0], o = e[1], a = e[2], i = void 0), a || (a = !1);

    for (var s = r.split(" "), l = 0; l < s.length; l += 1) {
      for (var h = s[l], u = 0; u < this.length; u += 1) {
        var f = this[u],
            c = void 0;
        if (!i && f.domListeners ? c = f.domListeners[h] : i && f.domLiveListeners && (c = f.domLiveListeners[h]), c && c.length) for (var d = c.length - 1; d >= 0; d -= 1) {
          var v = c[d];
          o && v.listener === o || o && v.listener && v.listener.domproxy && v.listener.domproxy === o ? (f.removeEventListener(h, v.proxyListener, a), c.splice(d, 1)) : o || (f.removeEventListener(h, v.proxyListener, a), c.splice(d, 1));
        }
      }
    }

    return this;
  },
  once: function once() {
    for (var t = this, e = arguments.length, n = new Array(e), r = 0; r < e; r++) {
      n[r] = arguments[r];
    }

    var i = n[0],
        o = n[1],
        a = n[2],
        s = n[3];

    function l() {
      for (var e = arguments.length, n = new Array(e), r = 0; r < e; r++) {
        n[r] = arguments[r];
      }

      a.apply(this, n), t.off(i, o, l, s), l.domproxy && delete l.domproxy;
    }

    return "function" == typeof n[1] && (i = n[0], a = n[1], s = n[2], o = void 0), l.domproxy = a, t.on(i, o, l, s);
  },
  trigger: function trigger() {
    for (var t = arguments.length, e = new Array(t), n = 0; n < t; n++) {
      e[n] = arguments[n];
    }

    for (var r = e[0].split(" "), i = e[1], o = 0; o < r.length; o += 1) {
      for (var a = r[o], s = 0; s < this.length; s += 1) {
        var l = this[s],
            h = void 0;

        try {
          h = new window.CustomEvent(a, {
            detail: i,
            bubbles: !0,
            cancelable: !0
          });
        } catch (t) {
          (h = document.createEvent("Event")).initEvent(a, !0, !0), h.detail = i;
        }

        l.domEventData = e.filter(function (t, e) {
          return e > 0;
        }), l.dispatchEvent(h), l.domEventData = [], delete l.domEventData;
      }
    }

    return this;
  },
  transitionEnd: function transitionEnd(t) {
    var e,
        n = ["webkitTransitionEnd", "transitionend"],
        r = this;

    function i(o) {
      if (o.target === this) for (t.call(this, o), e = 0; e < n.length; e += 1) {
        r.off(n[e], i);
      }
    }

    if (t) for (e = 0; e < n.length; e += 1) {
      r.on(n[e], i);
    }
    return this;
  },
  animationEnd: function animationEnd(t) {
    var e,
        n = ["webkitAnimationEnd", "animationend"],
        r = this;

    function i(o) {
      if (o.target === this) for (t.call(this, o), e = 0; e < n.length; e += 1) {
        r.off(n[e], i);
      }
    }

    if (t) for (e = 0; e < n.length; e += 1) {
      r.on(n[e], i);
    }
    return this;
  },
  width: function width() {
    return this[0] === window ? window.innerWidth : this.length > 0 ? parseFloat(this.css("width")) : null;
  },
  outerWidth: function outerWidth(t) {
    if (this.length > 0) {
      if (t) {
        var e = this.styles();
        return this[0].offsetWidth + parseFloat(e.getPropertyValue("margin-right")) + parseFloat(e.getPropertyValue("margin-left"));
      }

      return this[0].offsetWidth;
    }

    return null;
  },
  height: function height() {
    return this[0] === window ? window.innerHeight : this.length > 0 ? parseFloat(this.css("height")) : null;
  },
  outerHeight: function outerHeight(t) {
    if (this.length > 0) {
      if (t) {
        var e = this.styles();
        return this[0].offsetHeight + parseFloat(e.getPropertyValue("margin-top")) + parseFloat(e.getPropertyValue("margin-bottom"));
      }

      return this[0].offsetHeight;
    }

    return null;
  },
  offset: function offset() {
    if (this.length > 0) {
      var t = this[0],
          e = t.getBoundingClientRect(),
          n = document.body,
          r = t.clientTop || n.clientTop || 0,
          i = t.clientLeft || n.clientLeft || 0,
          o = t === window ? window.scrollY : t.scrollTop,
          a = t === window ? window.scrollX : t.scrollLeft;
      return {
        top: e.top + o - r,
        left: e.left + a - i
      };
    }

    return null;
  },
  hide: function hide() {
    for (var t = 0; t < this.length; t += 1) {
      this[t].style.display = "none";
    }

    return this;
  },
  show: function show() {
    return this.each(function () {
      "none" === this.style.display && (this.style.display = ""), "none" === getComputedStyle(this, "").getPropertyValue("display") && (this.style.display = "block");
    });
  },
  styles: function styles() {
    return this[0] ? window.getComputedStyle(this[0], null) : {};
  },
  css: function css(t, e) {
    var n;

    if (1 === arguments.length) {
      if ("string" != typeof t) {
        for (n = 0; n < this.length; n += 1) {
          for (var r in t) {
            this[n].style[r] = t[r];
          }
        }

        return this;
      }

      if (this[0]) return window.getComputedStyle(this[0], null).getPropertyValue(t);
    }

    if (2 === arguments.length && "string" == typeof t) {
      for (n = 0; n < this.length; n += 1) {
        this[n].style[t] = e;
      }

      return this;
    }

    return this;
  },
  toArray: function toArray() {
    for (var t = [], e = 0; e < this.length; e += 1) {
      t.push(this[e]);
    }

    return t;
  },
  each: function each(t) {
    return e.some.call(this, function (e, n) {
      return !1 === t.call(e, n, e);
    }), this;
  },
  forEach: function forEach(t) {
    return e.some.call(this, function (e, n) {
      return !1 === t.call(e, e, n);
    }), this;
  },
  filter: function filter(e) {
    for (var n = [], r = 0; r < this.length; r += 1) {
      e.call(this[r], r, this[r]) && n.push(this[r]);
    }

    return new t(n);
  },
  map: function map(e) {
    for (var n = [], r = 0; r < this.length; r += 1) {
      n.push(e.call(this[r], r, this[r]));
    }

    return new t(n);
  },
  html: function html(t) {
    if (void 0 === t) return this[0] ? this[0].innerHTML : void 0;

    for (var e = 0; e < this.length; e += 1) {
      this[e].innerHTML = t;
    }

    return this;
  },
  text: function text(t) {
    if (void 0 === t) return this[0] ? this[0].textContent.trim() : null;

    for (var e = 0; e < this.length; e += 1) {
      this[e].textContent = t;
    }

    return this;
  },
  is: function is(e) {
    var n,
        r,
        i = this[0];
    if (!i || void 0 === e) return !1;

    if ("string" == typeof e) {
      if (i.matches) return i.matches(e);
      if (i.webkitMatchesSelector) return i.webkitMatchesSelector(e);
      if (i.msMatchesSelector) return i.msMatchesSelector(e);

      for (n = $(e), r = 0; r < n.length; r += 1) {
        if (n[r] === i) return !0;
      }

      return !1;
    }

    if (e === document) return i === document;
    if (e === window) return i === window;

    if (e.nodeType || e instanceof t) {
      for (n = e.nodeType ? [e] : e, r = 0; r < n.length; r += 1) {
        if (n[r] === i) return !0;
      }

      return !1;
    }

    return !1;
  },
  indexOf: function indexOf(t) {
    for (var e = 0; e < this.length; e += 1) {
      if (this[e] === t) return e;
    }

    return -1;
  },
  index: function index() {
    var t,
        e = this[0];

    if (e) {
      for (t = 0; null !== (e = e.previousSibling);) {
        1 === e.nodeType && (t += 1);
      }

      return t;
    }
  },
  eq: function eq(e) {
    if (void 0 === e) return this;
    var n,
        r = this.length;
    return new t(e > r - 1 ? [] : e < 0 ? (n = r + e) < 0 ? [] : [this[n]] : [this[e]]);
  },
  append: function append() {
    for (var e, n = 0; n < arguments.length; n += 1) {
      e = n < 0 || arguments.length <= n ? void 0 : arguments[n];

      for (var r = 0; r < this.length; r += 1) {
        if ("string" == typeof e) {
          var i = document.createElement("div");

          for (i.innerHTML = e; i.firstChild;) {
            this[r].appendChild(i.firstChild);
          }
        } else if (e instanceof t) for (var o = 0; o < e.length; o += 1) {
          this[r].appendChild(e[o]);
        } else this[r].appendChild(e);
      }
    }

    return this;
  },
  appendTo: function appendTo(t) {
    return $(t).append(this), this;
  },
  prepend: function prepend(e) {
    var n, r;

    for (n = 0; n < this.length; n += 1) {
      if ("string" == typeof e) {
        var i = document.createElement("div");

        for (i.innerHTML = e, r = i.childNodes.length - 1; r >= 0; r -= 1) {
          this[n].insertBefore(i.childNodes[r], this[n].childNodes[0]);
        }
      } else if (e instanceof t) for (r = 0; r < e.length; r += 1) {
        this[n].insertBefore(e[r], this[n].childNodes[0]);
      } else this[n].insertBefore(e, this[n].childNodes[0]);
    }

    return this;
  },
  prependTo: function prependTo(t) {
    return $(t).prepend(this), this;
  },
  insertBefore: function insertBefore(t) {
    for (var e = $(t), n = 0; n < this.length; n += 1) {
      if (1 === e.length) e[0].parentNode.insertBefore(this[n], e[0]);else if (e.length > 1) for (var r = 0; r < e.length; r += 1) {
        e[r].parentNode.insertBefore(this[n].cloneNode(!0), e[r]);
      }
    }
  },
  insertAfter: function insertAfter(t) {
    for (var e = $(t), n = 0; n < this.length; n += 1) {
      if (1 === e.length) e[0].parentNode.insertBefore(this[n], e[0].nextSibling);else if (e.length > 1) for (var r = 0; r < e.length; r += 1) {
        e[r].parentNode.insertBefore(this[n].cloneNode(!0), e[r].nextSibling);
      }
    }
  },
  next: function next(e) {
    return this.length > 0 ? e ? this[0].nextElementSibling && $(this[0].nextElementSibling).is(e) ? new t([this[0].nextElementSibling]) : new t([]) : this[0].nextElementSibling ? new t([this[0].nextElementSibling]) : new t([]) : new t([]);
  },
  nextAll: function nextAll(e) {
    var n = [],
        r = this[0];
    if (!r) return new t([]);

    for (; r.nextElementSibling;) {
      var i = r.nextElementSibling;
      e ? $(i).is(e) && n.push(i) : n.push(i), r = i;
    }

    return new t(n);
  },
  prev: function prev(e) {
    if (this.length > 0) {
      var n = this[0];
      return e ? n.previousElementSibling && $(n.previousElementSibling).is(e) ? new t([n.previousElementSibling]) : new t([]) : n.previousElementSibling ? new t([n.previousElementSibling]) : new t([]);
    }

    return new t([]);
  },
  prevAll: function prevAll(e) {
    var n = [],
        r = this[0];
    if (!r) return new t([]);

    for (; r.previousElementSibling;) {
      var i = r.previousElementSibling;
      e ? $(i).is(e) && n.push(i) : n.push(i), r = i;
    }

    return new t(n);
  },
  siblings: function siblings(t) {
    return this.nextAll(t).add(this.prevAll(t));
  },
  parent: function parent(t) {
    for (var e = [], n = 0; n < this.length; n += 1) {
      null !== this[n].parentNode && (t ? $(this[n].parentNode).is(t) && e.push(this[n].parentNode) : e.push(this[n].parentNode));
    }

    return $($.uniq(e));
  },
  parents: function parents(t) {
    for (var e = [], n = 0; n < this.length; n += 1) {
      for (var r = this[n].parentNode; r;) {
        t ? $(r).is(t) && e.push(r) : e.push(r), r = r.parentNode;
      }
    }

    return $($.uniq(e));
  },
  closest: function closest(e) {
    var n = this;
    return void 0 === e ? new t([]) : (n.is(e) || (n = n.parents(e).eq(0)), n);
  },
  find: function find(e) {
    for (var n = [], r = 0; r < this.length; r += 1) {
      for (var i = this[r].querySelectorAll(e), o = 0; o < i.length; o += 1) {
        n.push(i[o]);
      }
    }

    return new t(n);
  },
  hasChild: function hasChild() {
    return !!this.dom && this.dom.children.length > 0;
  },
  children: function children(e) {
    for (var n = [], r = 0; r < this.length; r += 1) {
      for (var i = this[r].childNodes, o = 0; o < i.length; o += 1) {
        e ? 1 === i[o].nodeType && $(i[o]).is(e) && n.push(i[o]) : 1 === i[o].nodeType && n.push(i[o]);
      }
    }

    return new t($.uniq(n));
  },
  firstChild: function firstChild() {
    return this.dom && 0 !== this.dom.children.length ? this.dom.children[0] : null;
  },
  lastChild: function lastChild() {
    return this.dom && 0 !== this.dom.children.length ? this.dom.children[this.dom.children.length - 1] : null;
  },
  nextNode: function nextNode() {
    var t = null;
    if (!this.dom || 0 === this.dom.children.length) return null;

    for (var e = this.dom.nextSibling; e;) {
      if (1 === e.nodeType) {
        t = e;
        break;
      }

      e = this.dom.nextSibling;
    }

    return t;
  },
  childCount: function childCount() {
    return this.dom ? this.dom.children.length : 0;
  },
  upperTag: function upperTag(t, e) {
    void 0 === e && (e = 10);
    var n = null;
    if (!this.dom) return null;

    for (var r = t.toUpperCase(), i = 0, o = this.dom; o && !(++i >= e);) {
      if (o.tagName && o.tagName.toUpperCase() === r) {
        n = o;
        break;
      }

      o = o.parentNode;
    }

    return n;
  },
  childTag: function childTag(t) {
    var e = null;
    if (!this.dom) return null;

    try {
      for (var n = 0, r = this.dom.children.length; n < r; n++) {
        var i = this.dom.children[n];

        if (i.tagName && i.tagName.toUpperCase() === t.toUpperCase()) {
          e = i;
          break;
        }
      }
    } catch (t) {
      alert("childTag exp:" + t.message);
    }

    return e;
  },
  cursorEnd: function cursorEnd() {
    if (!this.dom) return null;
    var t = this.dom;

    if (t.focus(), void 0 !== window.getSelection && void 0 !== document.createRange) {
      var e = document.createRange();
      e.selectNodeContents(t), e.collapse(!1);
      var n = window.getSelection();
      n.removeAllRanges(), n.addRange(e);
    } else if (void 0 !== document.body.createTextRangrge) {
      var r = document.body.createTextRange();
      r.moveToElementText(t), r.collapse(!1), r.select();
    }
  },
  getCursorPos: function getCursorPos() {
    var t = 0;
    if (!this.dom) return 0;
    var e = this.dom;
    if (e.selectionStart) t = e.selectionStart;else {
      var n = null;
      "textarea" === e.tagName.toLowerCase() ? (n = event.srcElement.createTextRange()).moveToPoint(event.x, event.y) : n = document.selection.createRange(), n.moveStart("character", -event.srcElement.value.length), t = n.text.length;
    }
    return t;
  },
  getCursorPosition: function getCursorPosition() {
    if (!this.dom) return 0;
    var t = this.dom,
        e = "@#%#^&#*$",
        n = document.selection.createRange();
    n.text = e;
    var r = t.value.indexOf(e);
    return n.moveStart("character", -e.length), n.text = "", r;
  },
  setCursorPos: function setCursorPos(t) {
    if (this.dom) {
      var e = this.dom.createTextRange();
      e.collapse(!0), e.moveStart("character", t), e.select();
    }
  },
  moveFirst: function moveFirst() {
    this.rowindex = 0;
  },
  remove: function remove() {
    for (var t = 0; t < this.length; t += 1) {
      this[t].parentNode && this[t].parentNode.removeChild(this[t]);
    }

    return this;
  },
  detach: function detach() {
    return this.remove();
  },
  add: function add() {
    for (var t, e, n = this, r = arguments.length, i = new Array(r), o = 0; o < r; o++) {
      i[o] = arguments[o];
    }

    for (t = 0; t < i.length; t += 1) {
      var a = $(i[t]);

      for (e = 0; e < a.length; e += 1) {
        n[n.length] = a[e], n.length += 1;
      }
    }

    return n;
  },
  empty: function empty() {
    for (var t = 0; t < this.length; t += 1) {
      var e = this[t];

      if (1 === e.nodeType) {
        for (var n = 0; n < e.childNodes.length; n += 1) {
          e.childNodes[n].parentNode && e.childNodes[n].parentNode.removeChild(e.childNodes[n]);
        }

        e.textContent = "";
      }
    }

    return this;
  }
});
var r = Object.freeze({
  __proto__: null,
  scrollTo: function scrollTo() {
    for (var t = arguments.length, e = new Array(t), n = 0; n < t; n++) {
      e[n] = arguments[n];
    }

    var r = e[0],
        i = e[1],
        o = e[2],
        a = e[3],
        s = e[4];
    return 4 === e.length && "function" == typeof a && (s = a, r = e[0], i = e[1], o = e[2], s = e[3], a = e[4]), void 0 === a && (a = "swing"), this.each(function () {
      var t,
          e,
          n,
          l,
          h,
          u,
          f,
          c,
          d = this,
          v = i > 0 || 0 === i,
          g = r > 0 || 0 === r;

      if (void 0 === a && (a = "swing"), v && (t = d.scrollTop, o || (d.scrollTop = i)), g && (e = d.scrollLeft, o || (d.scrollLeft = r)), o) {
        v && (n = d.scrollHeight - d.offsetHeight, h = Math.max(Math.min(i, n), 0)), g && (l = d.scrollWidth - d.offsetWidth, u = Math.max(Math.min(r, l), 0));
        var m = null;
        v && h === t && (v = !1), g && u === e && (g = !1), $.requestAnimationFrame(function n(r) {
          void 0 === r && (r = new Date().getTime()), null === m && (m = r);
          var i,
              l = Math.max(Math.min((r - m) / o, 1), 0),
              p = "linear" === a ? l : .5 - Math.cos(l * Math.PI) / 2;
          v && (f = t + p * (h - t)), g && (c = e + p * (u - e)), v && h > t && f >= h && (d.scrollTop = h, i = !0), v && h < t && f <= h && (d.scrollTop = h, i = !0), g && u > e && c >= u && (d.scrollLeft = u, i = !0), g && u < e && c <= u && (d.scrollLeft = u, i = !0), i ? s && s() : (v && (d.scrollTop = f), g && (d.scrollLeft = c), $.requestAnimationFrame(n));
        });
      }
    });
  },
  scrollTop: function scrollTop() {
    for (var t = arguments.length, e = new Array(t), n = 0; n < t; n++) {
      e[n] = arguments[n];
    }

    var r = e[0],
        i = e[1],
        o = e[2],
        a = e[3];
    3 === e.length && "function" == typeof o && (r = e[0], i = e[1], a = e[2], o = e[3]);
    var s = this;
    return void 0 === r ? s.length > 0 ? s[0].scrollTop : null : s.scrollTo(void 0, r, i, o, a);
  },
  scrollLeft: function scrollLeft() {
    for (var t = arguments.length, e = new Array(t), n = 0; n < t; n++) {
      e[n] = arguments[n];
    }

    var r = e[0],
        i = e[1],
        o = e[2],
        a = e[3];
    3 === e.length && "function" == typeof o && (r = e[0], i = e[1], a = e[2], o = e[3]);
    var s = this;
    return void 0 === r ? s.length > 0 ? s[0].scrollLeft : null : s.scrollTo(r, void 0, i, o, a);
  }
});

$.getTranslate = function (t, e) {
  var n, r, i;
  void 0 === e && (e = "x");
  var o = window.getComputedStyle(t, null);
  return window.WebKitCSSMatrix ? ((r = o.transform || o.webkitTransform).split(",").length > 6 && (r = r.split(", ").map(function (t) {
    return t.replace(",", ".");
  }).join(", ")), i = new window.WebKitCSSMatrix("none" === r ? "" : r)) : n = (i = o.MozTransform || o.OTransform || o.MsTransform || o.msTransform || o.transform || o.getPropertyValue("transform").replace("translate(", "matrix(1, 0, 0, 1,")).toString().split(","), "x" === e && (r = window.WebKitCSSMatrix ? i.m41 : 16 === n.length ? parseFloat(n[12]) : parseFloat(n[4])), "y" === e && (r = window.WebKitCSSMatrix ? i.m42 : 16 === n.length ? parseFloat(n[13]) : parseFloat(n[5])), r || 0;
};

var i = Object.freeze({
  __proto__: null,
  animate: function animate(t, e) {
    var n,
        r = this,
        i = {
      props: Object.assign({}, t),
      params: Object.assign({
        duration: 300,
        easing: "swing"
      }, e),
      elements: r,
      animating: !1,
      que: [],
      easingProgress: function easingProgress(t, e) {
        return "swing" === t ? .5 - Math.cos(e * Math.PI) / 2 : "function" == typeof t ? t(e) : e;
      },
      stop: function stop() {
        i.frameId && $.cancelAnimationFrame(i.frameId), i.animating = !1, i.elements.each(function (t, e) {
          delete e.dom7AnimateInstance;
        }), i.que = [];
      },
      done: function done(t) {
        if (i.animating = !1, i.elements.each(function (t, e) {
          delete e.domAnimateInstance;
        }), t && t(r), i.que.length > 0) {
          var e = i.que.shift();
          i.animate(e[0], e[1]);
        }
      },
      animate: function animate(t, e) {
        if (i.animating) return i.que.push([t, e]), i;
        var n = [];
        i.elements.each(function (e, r) {
          var o, a, s, l, h;
          r.dom7AnimateInstance || (i.elements[e].domAnimateInstance = i), n[e] = {
            container: r
          }, Object.keys(t).forEach(function (i) {
            o = window.getComputedStyle(r, null).getPropertyValue(i).replace(",", "."), a = parseFloat(o), s = o.replace(a, ""), l = parseFloat(t[i]), h = t[i] + s, n[e][i] = {
              initialFullValue: o,
              initialValue: a,
              unit: s,
              finalValue: l,
              finalFullValue: h,
              currentValue: a
            };
          });
        });
        var o,
            a,
            s = null,
            l = 0,
            h = 0,
            u = !1;
        return i.animating = !0, i.frameId = $.requestAnimationFrame(function f() {
          var c, d;
          o = new Date().getTime(), u || (u = !0, e.begin && e.begin(r)), null === s && (s = o), e.progress && e.progress(r, Math.max(Math.min((o - s) / e.duration, 1), 0), s + e.duration - o < 0 ? 0 : s + e.duration - o, s), n.forEach(function (r) {
            var u = r;
            a || u.done || Object.keys(t).forEach(function (r) {
              if (!a && !u.done) {
                c = Math.max(Math.min((o - s) / e.duration, 1), 0), d = i.easingProgress(e.easing, c);
                var f = u[r],
                    v = f.initialValue,
                    g = f.finalValue,
                    m = f.unit;
                u[r].currentValue = v + d * (g - v);
                var p = u[r].currentValue;
                (g > v && p >= g || g < v && p <= g) && (u.container.style[r] = g + m, (h += 1) === Object.keys(t).length && (u.done = !0, l += 1), l === n.length && (a = !0)), a ? i.done(e.complete) : u.container.style[r] = p + m;
              }
            });
          }), a || (i.frameId = $.requestAnimationFrame(f));
        }), i;
      }
    };
    if (0 === i.elements.length) return r;

    for (var o = 0; o < i.elements.length; o += 1) {
      i.elements[o].domAnimateInstance ? n = i.elements[o].domAnimateInstance : i.elements[o].domAnimateInstance = i;
    }

    return n || (n = i), "stop" === t ? n.stop() : n.animate(i.props, i.params), r;
  },
  stop: function stop() {
    for (var t = 0; t < this.length; t += 1) {
      this[t].domAnimateInstance && this[t].domAnimateInstance.stop();
    }
  },
  getTranslate: function getTranslate(t) {
    void 0 === t && (t = "x");
    var e = 0;
    return this && this.dom && (e = $.getTranslate(this.dom, t)), e;
  }
}),
    o = "resize scroll".split(" ");

function a(t) {
  for (var e = arguments.length, n = new Array(e > 1 ? e - 1 : 0), r = 1; r < e; r++) {
    n[r - 1] = arguments[r];
  }

  if (void 0 === n[0]) {
    for (var i = 0; i < this.length; i += 1) {
      o.indexOf(t) < 0 && (t in this[i] ? this[i][t]() : $(this[i]).trigger(t));
    }

    return this;
  }

  return this.on.apply(this, [t].concat(n));
}

[n, r, i, Object.freeze({
  __proto__: null,
  click: function click() {
    for (var t = arguments.length, e = new Array(t), n = 0; n < t; n++) {
      e[n] = arguments[n];
    }

    return a.bind(this).apply(void 0, ["click"].concat(e));
  },
  blur: function blur() {
    for (var t = arguments.length, e = new Array(t), n = 0; n < t; n++) {
      e[n] = arguments[n];
    }

    return a.bind(this).apply(void 0, ["blur"].concat(e));
  },
  focus: function focus() {
    for (var t = arguments.length, e = new Array(t), n = 0; n < t; n++) {
      e[n] = arguments[n];
    }

    return a.bind(this).apply(void 0, ["focus"].concat(e));
  },
  focusin: function focusin() {
    for (var t = arguments.length, e = new Array(t), n = 0; n < t; n++) {
      e[n] = arguments[n];
    }

    return a.bind(this).apply(void 0, ["focusin"].concat(e));
  },
  focusout: function focusout() {
    for (var t = arguments.length, e = new Array(t), n = 0; n < t; n++) {
      e[n] = arguments[n];
    }

    return a.bind(this).apply(void 0, ["focusout"].concat(e));
  },
  keyup: function keyup() {
    for (var t = arguments.length, e = new Array(t), n = 0; n < t; n++) {
      e[n] = arguments[n];
    }

    return a.bind(this).apply(void 0, ["keyup"].concat(e));
  },
  keydown: function keydown() {
    for (var t = arguments.length, e = new Array(t), n = 0; n < t; n++) {
      e[n] = arguments[n];
    }

    return a.bind(this).apply(void 0, ["keydown"].concat(e));
  },
  keypress: function keypress() {
    for (var t = arguments.length, e = new Array(t), n = 0; n < t; n++) {
      e[n] = arguments[n];
    }

    return a.bind(this).apply(void 0, ["keypress"].concat(e));
  },
  submit: function submit() {
    for (var t = arguments.length, e = new Array(t), n = 0; n < t; n++) {
      e[n] = arguments[n];
    }

    return a.bind(this).apply(void 0, ["submit"].concat(e));
  },
  change: function change() {
    for (var t = arguments.length, e = new Array(t), n = 0; n < t; n++) {
      e[n] = arguments[n];
    }

    return a.bind(this).apply(void 0, ["change"].concat(e));
  },
  mousedown: function mousedown() {
    for (var t = arguments.length, e = new Array(t), n = 0; n < t; n++) {
      e[n] = arguments[n];
    }

    return a.bind(this).apply(void 0, ["mousedown"].concat(e));
  },
  mousemove: function mousemove() {
    for (var t = arguments.length, e = new Array(t), n = 0; n < t; n++) {
      e[n] = arguments[n];
    }

    return a.bind(this).apply(void 0, ["mousemove"].concat(e));
  },
  mouseup: function mouseup() {
    for (var t = arguments.length, e = new Array(t), n = 0; n < t; n++) {
      e[n] = arguments[n];
    }

    return a.bind(this).apply(void 0, ["mouseup"].concat(e));
  },
  mouseenter: function mouseenter() {
    for (var t = arguments.length, e = new Array(t), n = 0; n < t; n++) {
      e[n] = arguments[n];
    }

    return a.bind(this).apply(void 0, ["mouseenter"].concat(e));
  },
  mouseleave: function mouseleave() {
    for (var t = arguments.length, e = new Array(t), n = 0; n < t; n++) {
      e[n] = arguments[n];
    }

    return a.bind(this).apply(void 0, ["mouseleave"].concat(e));
  },
  mouseout: function mouseout() {
    for (var t = arguments.length, e = new Array(t), n = 0; n < t; n++) {
      e[n] = arguments[n];
    }

    return a.bind(this).apply(void 0, ["mouseout"].concat(e));
  },
  mouseover: function mouseover() {
    for (var t = arguments.length, e = new Array(t), n = 0; n < t; n++) {
      e[n] = arguments[n];
    }

    return a.bind(this).apply(void 0, ["mouseover"].concat(e));
  },
  touchstart: function touchstart() {
    for (var t = arguments.length, e = new Array(t), n = 0; n < t; n++) {
      e[n] = arguments[n];
    }

    return a.bind(this).apply(void 0, ["touchstart"].concat(e));
  },
  touchend: function touchend() {
    for (var t = arguments.length, e = new Array(t), n = 0; n < t; n++) {
      e[n] = arguments[n];
    }

    return a.bind(this).apply(void 0, ["touchend"].concat(e));
  },
  touchmove: function touchmove() {
    for (var t = arguments.length, e = new Array(t), n = 0; n < t; n++) {
      e[n] = arguments[n];
    }

    return a.bind(this).apply(void 0, ["touchmove"].concat(e));
  },
  resize: function resize() {
    for (var t = arguments.length, e = new Array(t), n = 0; n < t; n++) {
      e[n] = arguments[n];
    }

    return a.bind(this).apply(void 0, ["resize"].concat(e));
  },
  scroll: function scroll() {
    for (var t = arguments.length, e = new Array(t), n = 0; n < t; n++) {
      e[n] = arguments[n];
    }

    return a.bind(this).apply(void 0, ["scroll"].concat(e));
  }
})].forEach(function (t) {
  Object.keys(t).forEach(function (e) {
    $.fn[e] = t[e];
  });
}), module.exports = $;
});

/*!
  * wia dom v0.1.5
  * (c) 2020 Sibyl Yu
  * @license MIT
  */

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

var Methods =
/*#__PURE__*/
Object.freeze({
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

var Scroll =
/*#__PURE__*/
Object.freeze({
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

var Animate =
/*#__PURE__*/
Object.freeze({
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

var eventShortcuts =
/*#__PURE__*/
Object.freeze({
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
var dom_common = $;

var dom = createCommonjsModule(function (module) {
{
  module.exports = dom_common_min;
}
});

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

/* eslint no-control-regex: "off" */
var _uniqueNumber = 1;
var Utils = {
  uniqueNumber: function uniqueNumber() {
    _uniqueNumber += 1;
    return _uniqueNumber;
  },
  id: function id(mask, map) {
    if (mask === void 0) {
      mask = 'xxxxxxxxxx';
    }

    if (map === void 0) {
      map = '0123456789abcdef';
    }

    return $.uid(mask, map);
  },
  mdPreloaderContent: "\n    <span class=\"preloader-inner\">\n      <span class=\"preloader-inner-gap\"></span>\n      <span class=\"preloader-inner-left\">\n          <span class=\"preloader-inner-half-circle\"></span>\n      </span>\n      <span class=\"preloader-inner-right\">\n          <span class=\"preloader-inner-half-circle\"></span>\n      </span>\n    </span>\n  ".trim(),
  iosPreloaderContent: ("\n    <span class=\"preloader-inner\">\n      " + [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map(function () {
    return '<span class="preloader-inner-line"></span>';
  }).join('') + "\n    </span>\n  ").trim(),
  auroraPreloaderContent: "\n    <span class=\"preloader-inner\">\n      <span class=\"preloader-inner-circle\"></span>\n    </span>\n  ",
  eventNameToColonCase: function eventNameToColonCase(eventName) {
    var hasColon;
    return eventName.split('').map(function (char, index) {
      if (char.match(/[A-Z]/) && index !== 0 && !hasColon) {
        hasColon = true;
        return ":" + char.toLowerCase();
      }

      return char.toLowerCase();
    }).join('');
  },
  deleteProps: function deleteProps(obj) {
    $.deleteProps(obj);
  },
  nextTick: function nextTick(callback, delay) {
    if (delay === void 0) {
      delay = 0;
    }

    return setTimeout(callback, delay);
  },
  nextFrame: function nextFrame(cb) {
    return $.nextFrame(cb);
  },
  now: function now() {
    return Date.now();
  },
  requestAnimationFrame: function requestAnimationFrame(cb) {
    return $.requestAnimationFrame(cb);
  },
  cancelAnimationFrame: function cancelAnimationFrame(id) {
    return $.cancelAnimationFrame(id);
  },
  parseUrlQuery: function parseUrlQuery(url) {
    return $.urlParam(url);
  },
  getTranslate: function getTranslate(el, axis) {
    if (axis === void 0) {
      axis = 'x';
    }

    return $.getTranslate(el, axis);
  },
  serializeObject: function serializeObject(obj, parents) {
    if (parents === void 0) {
      parents = [];
    }

    if (typeof obj === 'string') return obj;
    var resultArray = [];
    var separator = '&';
    var newParents;

    function varName(name) {
      if (parents.length > 0) {
        var parentParts = '';

        for (var j = 0; j < parents.length; j += 1) {
          if (j === 0) parentParts += parents[j];else parentParts += "[" + encodeURIComponent(parents[j]) + "]";
        }

        return parentParts + "[" + encodeURIComponent(name) + "]";
      }

      return encodeURIComponent(name);
    }

    function varValue(value) {
      return encodeURIComponent(value);
    }

    Object.keys(obj).forEach(function (prop) {
      var toPush;

      if (Array.isArray(obj[prop])) {
        toPush = [];

        for (var i = 0; i < obj[prop].length; i += 1) {
          if (!Array.isArray(obj[prop][i]) && typeof obj[prop][i] === 'object') {
            newParents = parents.slice();
            newParents.push(prop);
            newParents.push(String(i));
            toPush.push(Utils.serializeObject(obj[prop][i], newParents));
          } else {
            toPush.push(varName(prop) + "[]=" + varValue(obj[prop][i]));
          }
        }

        if (toPush.length > 0) resultArray.push(toPush.join(separator));
      } else if (obj[prop] === null || obj[prop] === '') {
        resultArray.push(varName(prop) + "=");
      } else if (typeof obj[prop] === 'object') {
        // Object, convert to named array
        newParents = parents.slice();
        newParents.push(prop);
        toPush = Utils.serializeObject(obj[prop], newParents);
        if (toPush !== '') resultArray.push(toPush);
      } else if (typeof obj[prop] !== 'undefined' && obj[prop] !== '') {
        // Should be string or plain value
        resultArray.push(varName(prop) + "=" + varValue(obj[prop]));
      } else if (obj[prop] === '') resultArray.push(varName(prop));
    });
    return resultArray.join(separator);
  },
  isObject: function isObject(o) {
    return typeof o === 'object' && o !== null && o.constructor && o.constructor === Object;
  },
  merge: function merge() {
    var _$;

    return (_$ = $).merge.apply(_$, arguments);
  },
  extend: function extend() {
    var _$2;

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var to = args[0];
    args.splice(0, 1);
    return (_$2 = $).assign.apply(_$2, [to].concat(args));
  },
  colorHexToRgb: function colorHexToRgb(hex) {
    var h = hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, function (m, r, g, b) {
      return r + r + g + g + b + b;
    });
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(h);
    return result ? result.slice(1).map(function (n) {
      return parseInt(n, 16);
    }) : null;
  },
  colorRgbToHex: function colorRgbToHex(r, g, b) {
    var result = [r, g, b].map(function (n) {
      var hex = n.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join('');
    return "#" + result;
  },
  colorRgbToHsl: function colorRgbToHsl(r, g, b) {
    r /= 255; // eslint-disable-line

    g /= 255; // eslint-disable-line

    b /= 255; // eslint-disable-line

    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var d = max - min;
    var h;
    if (d === 0) h = 0;else if (max === r) h = (g - b) / d % 6;else if (max === g) h = (b - r) / d + 2;else if (max === b) h = (r - g) / d + 4;
    var l = (min + max) / 2;
    var s = d === 0 ? 0 : d / (1 - Math.abs(2 * l - 1));
    if (h < 0) h = 360 / 60 + h;
    return [h * 60, s, l];
  },
  colorHslToRgb: function colorHslToRgb(h, s, l) {
    var c = (1 - Math.abs(2 * l - 1)) * s;
    var hp = h / 60;
    var x = c * (1 - Math.abs(hp % 2 - 1));
    var rgb1;

    if (Number.isNaN(h) || typeof h === 'undefined') {
      rgb1 = [0, 0, 0];
    } else if (hp <= 1) rgb1 = [c, x, 0];else if (hp <= 2) rgb1 = [x, c, 0];else if (hp <= 3) rgb1 = [0, c, x];else if (hp <= 4) rgb1 = [0, x, c];else if (hp <= 5) rgb1 = [x, 0, c];else if (hp <= 6) rgb1 = [c, 0, x];

    var m = l - c / 2;
    return rgb1.map(function (n) {
      return Math.max(0, Math.min(255, Math.round(255 * (n + m))));
    });
  },
  colorHsbToHsl: function colorHsbToHsl(h, s, b) {
    var HSL = {
      h: h,
      s: 0,
      l: 0
    };
    var HSB = {
      h: h,
      s: s,
      b: b
    };
    HSL.l = (2 - HSB.s) * HSB.b / 2;
    HSL.s = HSL.l && HSL.l < 1 ? HSB.s * HSB.b / (HSL.l < 0.5 ? HSL.l * 2 : 2 - HSL.l * 2) : HSL.s;
    return [HSL.h, HSL.s, HSL.l];
  },
  colorHslToHsb: function colorHslToHsb(h, s, l) {
    var HSB = {
      h: h,
      s: 0,
      b: 0
    };
    var HSL = {
      h: h,
      s: s,
      l: l
    };
    var t = HSL.s * (HSL.l < 0.5 ? HSL.l : 1 - HSL.l);
    HSB.b = HSL.l + t;
    HSB.s = HSL.l > 0 ? 2 * t / HSB.b : HSB.s;
    return [HSB.h, HSB.s, HSB.b];
  },
  colorThemeCSSProperties: function colorThemeCSSProperties() {
    var hex;
    var rgb;

    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    if (args.length === 1) {
      hex = args[0];
      rgb = Utils.colorHexToRgb(hex);
    } else if (args.length === 3) {
      rgb = args;
      hex = Utils.colorRgbToHex.apply(Utils, rgb);
    }

    if (!rgb) return {};
    var hsl = Utils.colorRgbToHsl.apply(Utils, rgb);
    var hslShade = [hsl[0], hsl[1], Math.max(0, hsl[2] - 0.08)];
    var hslTint = [hsl[0], hsl[1], Math.max(0, hsl[2] + 0.08)];
    var shade = Utils.colorRgbToHex.apply(Utils, Utils.colorHslToRgb.apply(Utils, hslShade));
    var tint = Utils.colorRgbToHex.apply(Utils, Utils.colorHslToRgb.apply(Utils, hslTint));
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
var Event =
/*#__PURE__*/
function () {
  function Event(params, parents) {
    if (params === void 0) {
      params = {};
    }

    if (parents === void 0) {
      parents = [];
    }

    var self = this;
    self.params = params;
    self.eventsParents = parents;
    self.eventsListeners = {}; // 通过 params 中的 on 加载事件响应

    if (self.params && self.params.on) {
      Object.keys(self.params.on).forEach(function (eventName) {
        self.on(eventName, self.params.on[eventName]);
      });
    }
  }

  var _proto = Event.prototype;

  _proto.on = function on(events, handler, priority) {
    var self = this;
    if (typeof handler !== 'function') return self;
    var method = priority ? 'unshift' : 'push';
    events.split(' ').forEach(function (event) {
      if (!self.eventsListeners[event]) self.eventsListeners[event] = [];
      self.eventsListeners[event][method](handler);
    });
    return self;
  };

  _proto.once = function once(events, handler, priority) {
    var self = this;
    if (typeof handler !== 'function') return self;

    function onceHandler() {
      self.off(events, onceHandler);

      if (onceHandler.proxy) {
        delete onceHandler.proxy;
      }

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      handler.apply(self, args);
    }

    onceHandler.proxy = handler;
    return self.on(events, onceHandler, priority);
  };

  _proto.off = function off(events, handler) {
    var self = this;
    if (!self.eventsListeners) return self;
    events.split(' ').forEach(function (event) {
      if (typeof handler === 'undefined') {
        self.eventsListeners[event] = [];
      } else if (self.eventsListeners[event]) {
        self.eventsListeners[event].forEach(function (eventHandler, index) {
          if (eventHandler === handler || eventHandler.proxy && eventHandler.proxy === handler) {
            self.eventsListeners[event].splice(index, 1);
          }
        });
      }
    });
    return self;
  };

  _proto.emit = function emit() {
    var self = this;
    if (!self.eventsListeners) return self;
    var events;
    var data;
    var context;
    var eventsParents;

    for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

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

    var eventsArray = Array.isArray(events) ? events : events.split(' ');
    var localEvents = eventsArray.map(function (eventName) {
      return eventName.replace('local::', '');
    });
    var parentEvents = eventsArray.filter(function (eventName) {
      return eventName.indexOf('local::') < 0;
    });
    localEvents.forEach(function (event) {
      if (self.eventsListeners && self.eventsListeners[event]) {
        var handlers = [];
        self.eventsListeners[event].forEach(function (eventHandler) {
          handlers.push(eventHandler);
        });
        handlers.forEach(function (eventHandler) {
          eventHandler.apply(context, data);
        });
      }
    });

    if (eventsParents && eventsParents.length > 0) {
      eventsParents.forEach(function (eventsParent) {
        eventsParent.emit.apply(eventsParent, [parentEvents].concat(data));
      });
    }

    return self;
  };

  return Event;
}();

var Module =
/*#__PURE__*/
function (_Event) {
  _inheritsLoose(Module, _Event);

  function Module(params, parents) {
    if (params === void 0) {
      params = {};
    }

    if (parents === void 0) {
      parents = [];
    }

    return _Event.call(this, params, parents) || this;
  } // eslint-disable-next-line


  var _proto = Module.prototype;

  _proto.useModuleParams = function useModuleParams(module, instanceParams) {
    if (module.params) {
      var originalParams = {};
      Object.keys(module.params).forEach(function (paramKey) {
        if (typeof instanceParams[paramKey] === 'undefined') return;
        originalParams[paramKey] = $.extend({}, instanceParams[paramKey]);
      });
      $.extend(instanceParams, module.params);
      Object.keys(originalParams).forEach(function (paramKey) {
        $.extend(instanceParams[paramKey], originalParams[paramKey]);
      });
    }
  };

  _proto.useModulesParams = function useModulesParams(instanceParams) {
    var instance = this;
    if (!instance.modules) return;
    Object.keys(instance.modules).forEach(function (moduleName) {
      var module = instance.modules[moduleName]; // Extend params

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
  ;

  _proto.useModule = function useModule(moduleName, moduleParams) {
    if (moduleName === void 0) {
      moduleName = '';
    }

    if (moduleParams === void 0) {
      moduleParams = {};
    }

    var instance = this;
    if (!instance.modules) return; // 从原型中获得的模块类引用

    var module = typeof moduleName === 'string' ? instance.modules[moduleName] : moduleName;
    if (!module) return; // 扩展实例的方法和属性，Extend instance methods and props

    if (module.instance) {
      Object.keys(module.instance).forEach(function (modulePropName) {
        var moduleProp = module.instance[modulePropName];

        if (typeof moduleProp === 'function') {
          instance[modulePropName] = moduleProp.bind(instance);
        } else {
          instance[modulePropName] = moduleProp;
        }
      });
    } // 将扩展模块中的on加载到事件侦听中，Add event listeners


    if (module.on && instance.on) {
      Object.keys(module.on).forEach(function (moduleEventName) {
        instance.on(moduleEventName, module.on[moduleEventName]);
      });
    } // 加载扩展模块的vnodeHooks，Add vnode hooks


    if (module.vnode) {
      if (!instance.vnodeHooks) instance.vnodeHooks = {};
      Object.keys(module.vnode).forEach(function (vnodeId) {
        Object.keys(module.vnode[vnodeId]).forEach(function (hookName) {
          var handler = module.vnode[vnodeId][hookName];
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
  ;

  _proto.useModules = function useModules(modulesParams) {
    if (modulesParams === void 0) {
      modulesParams = {};
    }

    var instance = this;
    if (!instance.modules) return;
    Object.keys(instance.modules).forEach(function (moduleName) {
      var moduleParams = modulesParams[moduleName] || {};
      instance.useModule(moduleName, moduleParams);
    });
  };

  /**
   * 将模块类加载到指定类上，用于扩展类
   * @param {*} module 模块类
   * @param  {...any} params 参数
   */
  Module.installModule = function installModule(module) {
    var Class = this;
    if (!Class.prototype.modules) Class.prototype.modules = {};
    var name = module.name || Object.keys(Class.prototype.modules).length + "_" + $.now(); // 原型属性中引用该模块类，类实例

    Class.prototype.modules[name] = module; // 模块如果定义了原型，则将模块原型加载到类原型

    if (module.proto) {
      Object.keys(module.proto).forEach(function (key) {
        Class.prototype[key] = module.proto[key];
      });
    } // 加载静态属性


    if (module.static) {
      Object.keys(module.static).forEach(function (key) {
        Class[key] = module.static[key];
      });
    } // 执行加载回调函数


    if (module.install) {
      for (var _len = arguments.length, params = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        params[_key - 1] = arguments[_key];
      }

      module.install.apply(Class, params);
    }

    return Class;
  }
  /**
   * 加载类扩展模块到类
   * @param {*} module 
   * @param  {...any} params 
   */
  ;

  Module.use = function use(module) {
    var Class = this;

    if (Array.isArray(module)) {
      module.forEach(function (m) {
        return Class.installModule(m);
      });
      return Class;
    }

    for (var _len2 = arguments.length, params = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      params[_key2 - 1] = arguments[_key2];
    }

    return Class.installModule.apply(Class, [module].concat(params));
  };

  _createClass(Module, null, [{
    key: "components",
    set: function set(components) {
      var Class = this;
      if (!Class.use) return;
      Class.use(components);
    }
  }]);

  return Module;
}(Event);

/**
 * 扩展构造函数
 * @param {*} parameters 
 */
function Constructors (parameters) {
  if (parameters === void 0) {
    parameters = {};
  }

  var _parameters = parameters,
      defaultSelector = _parameters.defaultSelector,
      constructor = _parameters.constructor,
      domProp = _parameters.domProp,
      app = _parameters.app,
      addMethods = _parameters.addMethods;
  var methods = {
    create: function create() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      if (app) return _construct(constructor, [app].concat(args));
      return _construct(constructor, args);
    },
    get: function get(el) {
      if (el === void 0) {
        el = defaultSelector;
      }

      if (el instanceof constructor) return el;
      var $el = $(el);
      if ($el.length === 0) return undefined;
      return $el[0][domProp];
    },
    destroy: function destroy(el) {
      var instance = methods.get(el);
      if (instance && instance.destroy) return instance.destroy();
      return undefined;
    }
  };

  if (addMethods && Array.isArray(addMethods)) {
    addMethods.forEach(function (methodName) {
      methods[methodName] = function (el) {
        if (el === void 0) {
          el = defaultSelector;
        }

        var instance = methods.get(el);

        for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          args[_key2 - 1] = arguments[_key2];
        }

        if (instance && instance[methodName]) return instance[methodName].apply(instance, args);
        return undefined;
      };
    });
  }

  return methods;
}

function Modals (parameters) {
  if (parameters === void 0) {
    parameters = {};
  }

  var _parameters = parameters,
      defaultSelector = _parameters.defaultSelector,
      constructor = _parameters.constructor,
      app = _parameters.app;
  var methods = $.extend(Constructors({
    defaultSelector: defaultSelector,
    constructor: constructor,
    app: app,
    domProp: 'wiaModal'
  }), {
    open: function open(el, animate) {
      var $el = $(el);
      var instance = $el[0].wiaModal;
      if (!instance) instance = new constructor(app, {
        el: $el
      });
      return instance.open(animate);
    },
    close: function close(el, animate) {
      if (el === void 0) {
        el = defaultSelector;
      }

      var $el = $(el);
      if ($el.length === 0) return undefined;
      var instance = $el[0].wiaModal;
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
var fetchedModules = [];

function loadModule(moduleToLoad) {
  var App = this;
  return new Promise(function (resolve, reject) {
    var app = App.instance;
    var modulePath;
    var moduleObj;
    var moduleFunc;

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
      var matchNamePattern = moduleToLoad.match(/([a-z0-9-]*)/i);

      if (moduleToLoad.indexOf('.') < 0 && matchNamePattern && matchNamePattern[0].length === moduleToLoad.length) {
        if (!app || app && !app.params.lazyModulesPath) {
          reject(new Error('Wia: "lazyModulesPath" app parameter must be specified to fetch module by name'));
          return;
        }

        modulePath = app.params.lazyModulesPath + "/" + moduleToLoad + ".js";
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
      var module = moduleFunc(App, false);

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
      var _module = moduleObj;

      if (!_module) {
        reject(new Error("Wia: Can't find Wia component in specified component"));
        return;
      } // Check if it was added


      if (App.prototype.modules && App.prototype.modules[_module.name]) {
        resolve();
        return;
      } // Install It


      install(_module);
      resolve();
    }

    if (modulePath) {
      if (fetchedModules.indexOf(modulePath) >= 0) {
        resolve();
        return;
      }

      fetchedModules.push(modulePath); // 动态加载 js 脚本

      var scriptLoad = new Promise(function (resolveScript, rejectScript) {
        App.request.get(modulePath, function (scriptContent) {
          var id = $.id();
          var callbackLoadName = "wia_component_loader_callback_" + id;
          var scriptEl = document.createElement('script');
          scriptEl.innerHTML = "window." + callbackLoadName + " = function (Wia, WiaAutoInstallComponent) {return " + scriptContent.trim() + "}"; // 动态加载 js

          $('head').append(scriptEl);
          var componentLoader = window[callbackLoadName];
          delete window[callbackLoadName];
          $(scriptEl).remove();
          var module = componentLoader(App, false);

          if (!module) {
            rejectScript(new Error("Wia: Can't find Wia component in " + modulePath + " file"));
            return;
          } // Check if it was added


          if (App.prototype.modules && App.prototype.modules[module.name]) {
            resolveScript();
            return;
          } // Install It


          install(module);
          resolveScript();
        }, function (xhr, status) {
          rejectScript(xhr, status);
        });
      }); // 动态加载css样式

      var styleLoad = new Promise(function (resolveStyle) {
        App.request.get(modulePath.replace('.js', app.rtl ? '.rtl.css' : '.css'), function (styleContent) {
          var styleEl = document.createElement('style');
          styleEl.innerHTML = styleContent;
          $('head').append(styleEl);
          resolveStyle();
        }, function () {
          resolveStyle();
        });
      });
      Promise.all([scriptLoad, styleLoad]).then(function () {
        resolve();
      }).catch(function (err) {
        reject(err);
      });
    }
  });
}

var Resize = {
  name: 'resize',
  instance: {
    getSize: function getSize() {
      var app = this;
      if (!app.root[0]) return {
        width: 0,
        height: 0,
        left: 0,
        top: 0
      };
      var offset = app.root.offset();
      var _ref = [app.root[0].offsetWidth, app.root[0].offsetHeight, offset.left, offset.top],
          width = _ref[0],
          height = _ref[1],
          left = _ref[2],
          top = _ref[3];
      app.width = width;
      app.height = height;
      app.left = left;
      app.top = top;
      return {
        width: width,
        height: height,
        left: left,
        top: top
      };
    }
  },
  on: {
    init: function init() {
      var app = this; // Get Size

      app.getSize(); // Emit resize

      window.addEventListener('resize', function () {
        app.emit('resize');
      }, false); // Emit orientationchange

      window.addEventListener('orientationchange', function () {
        app.emit('orientationchange');
      });
    },
    orientationchange: function orientationchange() {
      var app = this; // Fix iPad weird body scroll

      if (app.device.ipad) {
        document.body.scrollLeft = 0;
        setTimeout(function () {
          document.body.scrollLeft = 0;
        }, 0);
      }
    },
    resize: function resize() {
      var app = this;
      app.getSize();
    }
  }
};

var SW = {
  registrations: [],
  register: function register(path, scope) {
    var app = this;

    if (!('serviceWorker' in window.navigator) || !app.serviceWorker.container) {
      return new Promise(function (resolve, reject) {
        reject(new Error('Service worker is not supported'));
      });
    }

    return new Promise(function (resolve, reject) {
      app.serviceWorker.container.register(path, scope ? {
        scope: scope
      } : {}).then(function (reg) {
        SW.registrations.push(reg);
        app.emit('serviceWorkerRegisterSuccess', reg);
        resolve(reg);
      }).catch(function (error) {
        app.emit('serviceWorkerRegisterError', error);
        reject(error);
      });
    });
  },
  unregister: function unregister(registration) {
    var app = this;

    if (!('serviceWorker' in window.navigator) || !app.serviceWorker.container) {
      return new Promise(function (resolve, reject) {
        reject(new Error('Service worker is not supported'));
      });
    }

    var registrations;
    if (!registration) registrations = SW.registrations;else if (Array.isArray(registration)) registrations = registration;else registrations = [registration];
    return Promise.all(registrations.map(function (reg) {
      return new Promise(function (resolve, reject) {
        reg.unregister().then(function () {
          if (SW.registrations.indexOf(reg) >= 0) {
            SW.registrations.splice(SW.registrations.indexOf(reg), 1);
          }

          app.emit('serviceWorkerUnregisterSuccess', reg);
          resolve();
        }).catch(function (error) {
          app.emit('serviceWorkerUnregisterError', reg, error);
          reject(error);
        });
      });
    }));
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
  create: function create() {
    var app = this;
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
    init: function init() {
      if (!('serviceWorker' in window.navigator)) return;
      var app = this;
      if (!app.serviceWorker.container) return;
      var paths = app.params.serviceWorker.path;
      var scope = app.params.serviceWorker.scope;
      if (!paths || Array.isArray(paths) && !paths.length) return;
      var toRegister = Array.isArray(paths) ? paths : [paths];
      toRegister.forEach(function (path) {
        app.serviceWorker.register(path, scope);
      });
    }
  }
};

dom.support = Support;
dom.device = Device;

var App =
/*#__PURE__*/
function (_Module) {
  _inheritsLoose(App, _Module);

  function App(params) {
    var _this;

    _this = _Module.call(this, params) || this;

    if (App.instance) {
      throw new Error("App is already initialized and can't be initialized more than once");
    }

    var passedParams = dom.extend({}, params); // App Instance

    var app = _assertThisInitialized(_this);

    App.instance = app;
    dom.app = app;
    dom.App = App; // Default

    var defaults = {
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

    app.params = dom.extend(defaults, params);
    var $rootEl = dom(app.params.root);
    dom.extend(app, {
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
      // app config
      api: app.params.api,
      // api config
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
      passedParams: passedParams,
      online: window.navigator.onLine
    }); // Save Root

    if (app.root && app.root[0]) {
      app.root[0].wia = app;
    }

    app.touchEvents = {
      start: Support.touch ? 'touchstart' : Support.pointerEvents ? 'pointerdown' : 'mousedown',
      move: Support.touch ? 'touchmove' : Support.pointerEvents ? 'pointermove' : 'mousemove',
      end: Support.touch ? 'touchend' : Support.pointerEvents ? 'pointerup' : 'mouseup'
    }; // 加载use插入的模块类相关方法，Load Use Modules

    app.useModules(); // 初始化数据，Init Data & Methods

    app.initData(); // 自动暗黑主题，Auto Dark Theme

    var DARK = '(prefers-color-scheme: dark)';
    var LIGHT = '(prefers-color-scheme: light)';
    app.mq = {};

    if (window.matchMedia) {
      app.mq.dark = window.matchMedia(DARK);
      app.mq.light = window.matchMedia(LIGHT);
    }

    app.colorSchemeListener = function (_ref) {
      var matches = _ref.matches,
          media = _ref.media;

      if (!matches) {
        return;
      }

      var html = document.querySelector('html');

      if (media === DARK) {
        html.classList.add('theme-dark');
      } else if (media === LIGHT) {
        html.classList.remove('theme-dark');
      }
    }; // app 初始化，Init


    function init() {
      if (Device.cordova && app.params.initOnDeviceReady) {
        dom(document).on('deviceready', function () {
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
      }, function (el) {
        app.root = dom(el);
        app.root[0].f7 = app;
        app.rootComponent = el.f7Component;
        if (app.params.init) init();
      });
    } else if (app.params.init) {
      init();
    } // Return app instance


    return app || _assertThisInitialized(_this);
  }
  /**
   * 初始化数据
   */


  var _proto = App.prototype;

  _proto.initData = function initData() {
    var app = this; // Data

    app.data = {};

    if (app.params.data && typeof app.params.data === 'function') {
      dom.extend(app.data, app.params.data.bind(app)());
    } else if (app.params.data) {
      dom.extend(app.data, app.params.data);
    } // Methods


    app.methods = {};

    if (app.params.methods) {
      Object.keys(app.params.methods).forEach(function (methodName) {
        if (typeof app.params.methods[methodName] === 'function') {
          app.methods[methodName] = app.params.methods[methodName].bind(app);
        } else {
          app.methods[methodName] = app.params.methods[methodName];
        }
      });
    }
  };

  _proto.enableAutoDarkTheme = function enableAutoDarkTheme() {
    if (!window.matchMedia) return;
    var app = this;
    var html = document.querySelector('html');

    if (app.mq.dark && app.mq.light) {
      app.mq.dark.addListener(app.colorSchemeListener);
      app.mq.light.addListener(app.colorSchemeListener);
    }

    if (app.mq.dark && app.mq.dark.matches) {
      html.classList.add('theme-dark');
    } else if (app.mq.light && app.mq.light.matches) {
      html.classList.remove('theme-dark');
    }
  };

  _proto.disableAutoDarkTheme = function disableAutoDarkTheme() {
    if (!window.matchMedia) return;
    var app = this;
    if (app.mq.dark) app.mq.dark.removeListener(app.colorSchemeListener);
    if (app.mq.light) app.mq.light.removeListener(app.colorSchemeListener);
  } // 初始化
  ;

  _proto.init = function init() {
    var app = this;
    if (app.initialized) return app;
    app.root.addClass('framework7-initializing'); // RTL attr

    if (app.rtl) {
      dom('html').attr('dir', 'rtl');
    } // Auto Dark Theme


    if (app.params.autoDarkTheme) {
      app.enableAutoDarkTheme();
    } // Watch for online/offline state


    window.addEventListener('offline', function () {
      app.online = false;
      app.emit('offline');
      app.emit('connection', false);
    });
    window.addEventListener('online', function () {
      app.online = true;
      app.emit('online');
      app.emit('connection', true);
    }); // Root class

    app.root.addClass('framework7-root'); // Theme class

    dom('html').removeClass('ios md aurora').addClass(app.theme); // iOS Translucent

    if (app.params.iosTranslucentBars && app.theme === 'ios' && Device.ios) {
      dom('html').addClass('ios-translucent-bars');
    }

    if (app.params.iosTranslucentModals && app.theme === 'ios' && Device.ios) {
      dom('html').addClass('ios-translucent-modals');
    } // Init class


    dom.nextFrame(function () {
      app.root.removeClass('framework7-initializing');
    });
    initStyle(); // Emit, init other modules

    app.initialized = true;
    app.emit('init');
    return app;
  } // eslint-disable-next-line
  ;

  _proto.loadModule = function loadModule(m) {
    App.loadModule(m); // 模块初始化

    if (this[m.name].init) this[m.name].init();
  } // eslint-disable-next-line
  ;

  _proto.loadModules = function loadModules() {
    return App.loadModules.apply(App, arguments);
  };

  _proto.getVnodeHooks = function getVnodeHooks(hook, id) {
    var app = this;
    if (!app.vnodeHooks || !app.vnodeHooks[hook]) return [];
    return app.vnodeHooks[hook][id] || [];
  } // eslint-disable-next-line
  ;

  _createClass(App, [{
    key: "$",
    get: function get() {
      return dom;
    }
  }], [{
    key: "Dom",
    get: function get() {
      return dom;
    }
  }, {
    key: "$",
    get: function get() {
      return dom;
    }
  }, {
    key: "Module",
    get: function get() {
      return Module;
    }
  }, {
    key: "Event",
    get: function get() {
      return Event;
    }
  }]);

  return App;
}(Module);
/**
 * 初始化html样式
 * from device module
 */


function initStyle() {
  var classNames = [];
  var html = document.querySelector('html');
  var metaStatusbar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]');
  if (!html) return;

  if (Device.standalone && Device.ios && metaStatusbar && metaStatusbar.content === 'black-translucent') {
    classNames.push('device-full-viewport');
  } // Pixel Ratio


  classNames.push("device-pixel-ratio-" + Math.floor(Device.pixelRatio)); // OS classes

  if (Device.os && !Device.desktop) {
    classNames.push("device-" + Device.os);
  } else if (Device.desktop) {
    classNames.push('device-desktop');

    if (Device.os) {
      classNames.push("device-" + Device.os);
    }
  }

  if (Device.cordova || Device.phonegap) {
    classNames.push('device-cordova');
  } // Add html classes


  classNames.forEach(function (className) {
    html.classList.add(className);
  });
}

App.ModalMethods = Modals;
App.ConstructorMethods = Constructors; // 动态加载模块（base里面已经内置动态加载，这个方法应该用不上）

App.loadModule = loadModule;

App.loadModules = function loadModules(modules) {
  return Promise.all(modules.map(function (module) {
    return App.loadModule(module);
  }));
}; // app 加载到 app实例的一些扩展模块


App.support = Support;
App.device = Device;
App.utils = Utils; // 添加应用缺省模块

App.use([Resize, // 控制屏幕大小
SW$1 // ServiceWorker
//INSTALL_COMPONENTS
]);

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
var _opts = {
  normal: 'nor',
  // 'data-normal' 普通图片
  retina: 'ret',
  // 'data-retina',
  srcset: 'set',
  // 'data-srcset', 浏览器根据宽、高和像素密度来加载相应的图片资源
  threshold: 0
};

var _opt;

var _ticking;

var _nodes;

var _windowHeight = window.innerHeight;

var _root; // private


var _prevLoc = getLoc(); // feature detection
// https://github.com/Modernizr/Modernizr/blob/master/feature-detects/img/srcset.js


var _srcset = document.body.classList.contains('srcset') || 'srcset' in document.createElement('img'); // 设备分辨率
// not supported in IE10 - https://msdn.microsoft.com/en-us/library/dn265030(v=vs.85).aspx


var _dpr = window.devicePixelRatio || window.screen.deviceXDPI / window.screen.logicalXDPI;
/**
 * 输外部可调用的类
 * 类外面的变量、函数作为模块内部私有属性、方法，外部无法调用
 * 如果全部放入类中，属性、函数相互调用，都需要 this，非常麻烦！
 * 也可以直接使用 export default (options = {}) => {} 输出一个函数！
 * 函数内部反而不需要this，比较方便。
 */


var Lazy =
/*#__PURE__*/
function () {
  // 实例属性
  function Lazy(opt) {
    _opt = $.assign({}, _opts, opt);
  } // API
  //----------------------------------------
  // dom 就绪后 start，dom 更新后，需 update

  /**
   * 启动延迟加载, 加载事件, dom ready时调用!
   * @param root 根对象, scroll的目标对象，错了无法触发scroll 事件！
   * @returns {init}
   */


  var _proto = Lazy.prototype;

  _proto.start = function start(root) {
    // sui window scroll event invalid!!!
    // ['scroll', 'resize'].forEach(event => window[action](event, requestScroll));
    ['scroll', 'resize'].forEach(function (event) {
      return root['addEventListener'](event, requestScroll);
    });
    _root = root;
    return this;
  }
  /**
   * 停止延迟加载,卸载事件!
   * @param root 根对象, scroll的目标对象
   * @returns {init}
   */
  ;

  _proto.stop = function stop() {
    // sui window scroll event invalid!!!
    // ['scroll', 'resize'].forEach(event => window[action](event, requestScroll));
    ['scroll', 'resize'].forEach(function (event) {
      return _root['removeEventListener'](event, requestScroll);
    });
    return this;
  };

  _proto.update = function update() {
    setTimeout(function () {
      _update();

      check();
    }, 1);
  };

  return Lazy;
}();

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
    window.requestAnimationFrame(function () {
      return check();
    });
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
  var viewTop = _prevLoc; // 视口顶部坐标

  var viewBot = viewTop + _windowHeight; // 视口底部坐标
  // console.log(`viewTop:${viewTop} viewBot:${viewBot}`);
  // 节点坐标

  var nodeTop = getOffset(node);
  var nodeBot = nodeTop + node.offsetHeight; // console.log(`nodeTop:${nodeTop} nodeBot:${nodeBot}`);

  var offset = _opt.threshold / 100 * _windowHeight; // 节点在可视范围内

  var rc = nodeBot >= viewTop - offset && nodeTop <= viewBot + offset; // if (rc)
  //   console.log(`nodeBot:${nodeBot} >= view:${viewTop - offset} nodeTop:${nodeTop} <= view:${viewBot + offset}`);

  return rc;
} // source helper


function setSource(node) {
  $.emit('lazy:src:before', node); // prefer srcset, fallback to pixel density

  if (_srcset && node.hasAttribute(_opt.srcset)) {
    node.setAttribute('srcset', node.getAttribute(_opt.srcset));
  } else {
    var retina = _dpr > 1 && node.getAttribute(_opt.retina);
    var src = retina || node.getAttribute(_opt.normal);
    node.setAttribute('src', src);
    console.log("set src:" + src);
  }

  $.emit('lazy:src:after', node); // 删除懒加载属性，避免重复加载

  [_opt.normal, _opt.retina, _opt.srcset].forEach(function (attr) {
    return node.removeAttribute(attr);
  });

  _update();
}
/**
 * 检查是否可视,如果可视则更改图片src，加载图片
 * @returns {check}
 */


function check() {
  if (!_nodes) return;
  _windowHeight = window.innerHeight;

  _nodes.forEach(function (node) {
    return inViewport(node) && setSource(node);
  });

  _ticking = false;
  return this;
}
/**
 * 新的图片加入dom，需重新获取属性为nor的图片节点，
 * @returns {update}
 */


function _update(root) {
  if (root) _nodes = Array.prototype.slice.call(root.querySelectorAll("[" + _opt.normal + "]"));else _nodes = Array.prototype.slice.call(document.querySelectorAll("[" + _opt.normal + "]"));
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
var Page =
/*#__PURE__*/
function () {
  function Page(app, name, title, style) {
    this.app = app;
    this.cfg = app.cfg;
    this.name = name; // 名称，支持带路径：admin/login

    this.title = title; // 浏览器标题

    this.style = style || "./page/" + name + ".css";
    this.path = "" + name; // url 路径，不使用正则，直接查找

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


  var _proto = Page.prototype;

  _proto.load = function load(param) {
    this.param = param; // $.assign(this.data, param);
  }
  /**
   * 在已经加载就绪的视图上操作
   * @param {*} view 页面层的 Dom 对象，已经使用`$(#page-name)`，做了处理
   * @param {*} param go 函数的参数，或 网址中 url 中的参数
   * @param {*} back 是否为回退，A->B, B->A，这种操作属于回退
   */
  ;

  _proto.ready = function ready(view, param, back) {
    $.assign(this, {
      view: view,
      param: param,
      back: back
    }); // $.assign(this.data, param);
  } // 在已经加载的视图上操作
  // dv：页面层，param：参数
  ;

  _proto.show = function show(view, param, back) {
    $.assign(this, {
      view: view,
      param: param,
      back: back
    }); // $.assign(this.data, param);
  };

  return Page;
}();

export { Ajax, App, Constructors, Device, Event, Lazy, Modals, Module, Page, Resize, SW$1 as SW, Support, Utils, loadModule };
