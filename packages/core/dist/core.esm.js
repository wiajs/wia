/*!
  * wia core v0.1.11
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
    domProp: 'f7Modal'
  }), {
    open: function open(el, animate) {
      var $el = $(el);
      var instance = $el[0].f7Modal;
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
      var instance = $el[0].f7Modal;
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

/**
 * document 绑定click事件
 * 支持touch则绑定touch，否则绑定click
 * 无论touch 还是 click事件，都会触发事件响应函数
 * @param {*} cb
 */
function bindClick(cb) {
  var touchStartX;
  var touchStartY;

  function touchStart(ev) {
    // ev.preventDefault();
    touchStartX = ev.changedTouches[0].clientX;
    touchStartY = ev.changedTouches[0].clientY;
  }

  function touchEnd(ev) {
    // ev.preventDefault();
    var x = Math.abs(ev.changedTouches[0].clientX - touchStartX);
    var y = Math.abs(ev.changedTouches[0].clientY - touchStartY); // console.log('touchEnd', {x, y});

    if (x <= 5 && y <= 5) {
      cb.call(this, ev);
    }
  } // 在捕捉时触发，不影响后续冒泡阶段再次触发


  if ($.support.touch) {
    // console.log('bind touch');
    document.addEventListener('touchstart', touchStart, true);
    document.addEventListener('touchend', touchEnd, true);
  } else {
    // console.log('bind click');
    document.addEventListener('click', cb, true);
  }
}

function initClicks(app) {
  function appClick(ev) {
    app.emit({
      events: 'click',
      data: [ev]
    });
  }

  function handleClicks(e) {
    var $clickedEl = $(e.target);
    var $clickedLinkEl = $clickedEl.closest('a');
    var isLink = $clickedLinkEl.length > 0;
    var url = isLink && $clickedLinkEl.attr('href'); // call Modules Clicks

    Object.keys(app.modules).forEach(function (moduleName) {
      var moduleClicks = app.modules[moduleName].clicks;
      if (!moduleClicks) return;
      if (e.preventF7Router) return;
      Object.keys(moduleClicks).forEach(function (clickSelector) {
        var matchingClickedElement = $clickedEl.closest(clickSelector).eq(0);

        if (matchingClickedElement.length > 0) {
          moduleClicks[clickSelector].call(app, matchingClickedElement, matchingClickedElement.dataset(), e);
        }
      });
    });
  } // 绑定click 或 touch 事件，触发时，发射click事件


  bindClick(appClick); // click event 响应

  app.on('click', handleClicks);
}

var Click = {
  name: 'clicks',
  params: {
    clicks: {
      // External Links
      externalLinks: '.ext'
    }
  },
  on: {
    // app 创建时被调用
    init: function init() {
      var app = this;
      initClicks(app);
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

var Support = $.support;
var Device = $.device;

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

    var passedParams = $.extend({}, params); // App Instance

    var app = _assertThisInitialized(_this);

    app.device = Device;
    app.support = Support;
    App.instance = app;
    $.app = app;
    $.App = App; // Default

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

    app.params = $.extend(defaults, params);
    var $rootEl = $(app.params.root);
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

    if (Device.ios && Device.webView) {
      // Strange hack required for iOS 8 webview to work on inputs
      window.addEventListener('touchstart', function () {});
    }

    app.touchEvents = {
      start: Support.touch ? 'touchstart' : Support.pointerEvents ? 'pointerdown' : 'mousedown',
      move: Support.touch ? 'touchmove' : Support.pointerEvents ? 'pointermove' : 'mousemove',
      end: Support.touch ? 'touchend' : Support.pointerEvents ? 'pointerup' : 'mouseup'
    }; // 加载use插入的模块类相关方法（如：create、get、destroy），Load Use Modules

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
        $(document).on('deviceready', function () {
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
        app.root = $(el);
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
      $.extend(app.data, app.params.data.bind(app)());
    } else if (app.params.data) {
      $.extend(app.data, app.params.data);
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
      $('html').attr('dir', 'rtl');
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

    $('html').removeClass('ios md aurora').addClass(app.theme); // iOS Translucent

    if (app.params.iosTranslucentBars && app.theme === 'ios' && Device.ios) {
      $('html').addClass('ios-translucent-bars');
    }

    if (app.params.iosTranslucentModals && app.theme === 'ios' && Device.ios) {
      $('html').addClass('ios-translucent-modals');
    } // Init class


    $.nextFrame(function () {
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
      return $;
    }
  }], [{
    key: "Dom",
    get: function get() {
      return $;
    }
  }, {
    key: "$",
    get: function get() {
      return $;
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
Click, // 触发UI组件的点击（Click 或 Touch）事件
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

var Page =
/*#__PURE__*/
function (_Event) {
  _inheritsLoose(Page, _Event);

  function Page(app, name, title, style) {
    var _this;

    _this = _Event.call(this, null, [app]) || this;
    _this.app = app;
    _this.cfg = app.cfg;
    _this.name = name; // 名称，支持带路径：admin/login

    _this.title = title; // 浏览器标题

    _this.style = style || "./page/" + name + ".css";
    _this.path = "" + name; // url 路径，不使用正则，直接查找

    _this.view = null; // 页面的div层Dom对象，router创建实例时赋值

    _this.html = ''; // 页面html文本，router创建实例时赋值

    _this.css = ''; // 页面css样式，router创建实例时赋值

    _this.js = ''; // 页面代码，router创建实例时赋值

    _this.data = {}; // 页面数据对象

    _this.param = {}; // 页面切换传递进来的参数对象，router创建实例时赋值

    return _this;
  }
  /**
   * 异步加载页面视图内容
   * 返回Promise对象
   * @param {*} param
   * @param {*} cfg
   */


  var _proto = Page.prototype;

  _proto.load = function load(param) {
    // $.assign(this.data, param);
    this.emit('local::load pageLoad', param);
  }
  /**
   * 在已经加载就绪的视图上操作
   * @param {*} view 页面层的 Dom 对象，已经使用`$(#page-name)`，做了处理
   * @param {*} param go 函数的参数，或 网址中 url 中的参数
   * @param {*} back 是否为回退，A->B, B->A，这种操作属于回退
   */
  ;

  _proto.ready = function ready(view, param, back) {
    // $.assign(this, {page, param, back});
    // $.assign(this.data, param);
    // 隐藏所有模板
    this.emit('local::ready pageReady', view, param, back);
    view.qus('[name$=-tp]').hide();
  } // 显示已加载的页面
  // view：页面Dom层，param：参数
  ;

  _proto.show = function show(view, param) {
    // 防止空链接，刷新页面
    view.qus('a[href=""]').attr('href', 'javascript:;');
    if (this.reset) this.reset();
    this.emit('local::show pageShow', view, param);
  } // 回退显示已加载的页面
  // view：页面Dom层，param：参数
  ;

  _proto.back = function back(view, param) {
    // 防止空链接，刷新页面
    view.qus('a[href=""]').attr('href', 'javascript:;');
    this.emit('local::back pageBack', view, param);
  };

  _proto.hide = function hide(view) {
    this.emit('local::hide pageHide', view);
  };

  return Page;
}(Event);

var openedModals = [];
var dialogsQueue = [];

function clearDialogsQueue() {
  if (dialogsQueue.length === 0) return;
  var dialog = dialogsQueue.shift();
  dialog.open();
}

var Modal =
/*#__PURE__*/
function (_Event) {
  _inheritsLoose(Modal, _Event);

  function Modal(app, params) {
    var _this;

    _this = _Event.call(this, params, [app]) || this;

    var modal = _assertThisInitialized(_this);

    var defaults = {};
    modal.params = Utils.extend(defaults, params);
    modal.opened = false;
    return _assertThisInitialized(_this) || _assertThisInitialized(_this);
  }

  var _proto = Modal.prototype;

  _proto.onOpen = function onOpen() {
    var modal = this;
    modal.opened = true;
    openedModals.push(modal);
    $('html').addClass("with-modal-" + modal.type.toLowerCase());
    modal.$el.trigger("modal:open " + modal.type.toLowerCase() + ":open");
    modal.emit("local::open modalOpen " + modal.type + "Open", modal);
  };

  _proto.onOpened = function onOpened() {
    var modal = this;
    modal.$el.trigger("modal:opened " + modal.type.toLowerCase() + ":opened");
    modal.emit("local::opened modalOpened " + modal.type + "Opened", modal);
  };

  _proto.onClose = function onClose() {
    var modal = this;
    modal.opened = false;
    if (!modal.type || !modal.$el) return;
    openedModals.splice(openedModals.indexOf(modal), 1);
    $('html').removeClass("with-modal-" + modal.type.toLowerCase());
    modal.$el.trigger("modal:close " + modal.type.toLowerCase() + ":close");
    modal.emit("local::close modalClose " + modal.type + "Close", modal);
  };

  _proto.onClosed = function onClosed() {
    var modal = this;
    if (!modal.type || !modal.$el) return;
    modal.$el.removeClass('modal-out');
    modal.$el.hide();
    modal.$el.trigger("modal:closed " + modal.type.toLowerCase() + ":closed");
    modal.emit("local::closed modalClosed " + modal.type + "Closed", modal);
  };

  _proto.open = function open(animateModal) {
    var modal = this;
    var app = modal.app,
        $el = modal.$el,
        type = modal.type,
        $backdropEl = modal.$backdropEl;
    var moveToRoot = modal.params.moveToRoot;
    var animate = true;
    if (typeof animateModal !== 'undefined') animate = animateModal;else if (typeof modal.params.animate !== 'undefined') {
      animate = modal.params.animate;
    }

    if (!$el || $el.hasClass('modal-in')) {
      return modal;
    }

    if (type === 'dialog' && app.params.modal.queueDialogs) {
      var pushToQueue;

      if ($('.dialog.modal-in').length > 0) {
        pushToQueue = true;
      } else if (openedModals.length > 0) {
        openedModals.forEach(function (openedModal) {
          if (openedModal.type === 'dialog') pushToQueue = true;
        });
      }

      if (pushToQueue) {
        dialogsQueue.push(modal);
        return modal;
      }
    }

    var $modalParentEl = $el.parent();
    var wasInDom = $el.parents(document).length > 0;

    if (moveToRoot && app.params.modal.moveToRoot && !$modalParentEl.is(app.root)) {
      app.root.append($el);
      modal.once(type + "Closed", function () {
        if (wasInDom) {
          $modalParentEl.append($el);
        } else {
          $el.remove();
        }
      });
    } // Show Modal


    $el.show();
    /* eslint no-underscore-dangle: ["error", { "allow": ["_clientLeft"] }] */

    modal._clientLeft = $el[0].clientLeft; // Modal

    function transitionEnd() {
      if ($el.hasClass('modal-out')) {
        modal.onClosed();
      } else if ($el.hasClass('modal-in')) {
        modal.onOpened();
      }
    }

    if (animate) {
      if ($backdropEl) {
        $backdropEl.removeClass('not-animated');
        $backdropEl.addClass('backdrop-in');
      }

      $el.animationEnd(function () {
        transitionEnd();
      });
      $el.transitionEnd(function () {
        transitionEnd();
      });
      $el.removeClass('modal-out not-animated').addClass('modal-in');
      modal.onOpen();
    } else {
      if ($backdropEl) {
        $backdropEl.addClass('backdrop-in not-animated');
      }

      $el.removeClass('modal-out').addClass('modal-in not-animated');
      modal.onOpen();
      modal.onOpened();
    }

    return modal;
  };

  _proto.close = function close(animateModal) {
    var modal = this;
    var $el = modal.$el;
    var $backdropEl = modal.$backdropEl;
    var animate = true;
    if (typeof animateModal !== 'undefined') animate = animateModal;else if (typeof modal.params.animate !== 'undefined') {
      animate = modal.params.animate;
    }

    if (!$el || !$el.hasClass('modal-in')) {
      if (dialogsQueue.indexOf(modal) >= 0) {
        dialogsQueue.splice(dialogsQueue.indexOf(modal), 1);
      }

      return modal;
    } // backdrop


    if ($backdropEl) {
      var needToHideBackdrop = true;

      if (modal.type === 'popup') {
        modal.$el.prevAll('.popup.modal-in').each(function (index, popupEl) {
          var popupInstance = popupEl.f7Modal;
          if (!popupInstance) return;

          if (popupInstance.params.closeByBackdropClick && popupInstance.params.backdrop && popupInstance.backdropEl === modal.backdropEl) {
            needToHideBackdrop = false;
          }
        });
      }

      if (needToHideBackdrop) {
        $backdropEl[animate ? 'removeClass' : 'addClass']('not-animated');
        $backdropEl.removeClass('backdrop-in');
      }
    } // Modal


    $el[animate ? 'removeClass' : 'addClass']('not-animated');

    function transitionEnd() {
      if ($el.hasClass('modal-out')) {
        modal.onClosed();
      } else if ($el.hasClass('modal-in')) {
        modal.onOpened();
      }
    }

    if (animate) {
      $el.animationEnd(function () {
        transitionEnd();
      });
      $el.transitionEnd(function () {
        transitionEnd();
      });
      $el.removeClass('modal-in').addClass('modal-out'); // Emit close

      modal.onClose();
    } else {
      $el.addClass('not-animated').removeClass('modal-in').addClass('modal-out'); // Emit close

      modal.onClose();
      modal.onClosed();
    }

    if (modal.type === 'dialog') {
      clearDialogsQueue();
    }

    return modal;
  };

  _proto.destroy = function destroy() {
    var modal = this;
    if (modal.destroyed) return;
    modal.emit("local::beforeDestroy modalBeforeDestroy " + modal.type + "BeforeDestroy", modal);

    if (modal.$el) {
      modal.$el.trigger("modal:beforedestroy " + modal.type.toLowerCase() + ":beforedestroy");

      if (modal.$el.length && modal.$el[0].f7Modal) {
        delete modal.$el[0].f7Modal;
      }
    }

    Utils.deleteProps(modal);
    modal.destroyed = true;
  };

  return Modal;
}(Event);

// export {default as Device} from './device';

var Support$1 = $.support;
var Device$1 = $.device;

export { Ajax, App, Constructors, Device$1 as Device, Event, Lazy, Modal, Modals, Module, Page, Resize, SW$1 as SW, Support$1 as Support, Utils, loadModule };
