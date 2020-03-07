/*!*******************!*\
! ** * 动态模块管理 ** * !
\***********************/
   
// The module cache
const _c = {}; // 已执行并缓存的模块，提供了输出接口
// The modules object
const _m = {}; // 已下载的模块，在$.run()时被执行，并返回模块输出部分

/**
 * 加载、执行模块代码，返回模块输出部分
 * 类似 node.js 的 require函数
 * @param {*} id 模块id
 */
function load(id) {
  // Check if module is in cache
  if (_c[id]) {
    return _c[id].exports;
  }

  // Create a new module (and put it into the cache)
  const m = {
    i: id,
    l: false,
    exports: {}
  };
  _c[id] = m;

  // M.m 保存所有模块，需动态加载
  // Execute the module function
  // 执行每个模块的代码
  if (_m[id])
    // m.exports 对象作为模块内 this 指针，而不是window
    // 比如 箭头函数内的this 
    _m[id].call(m.exports, m, m.exports, load);
  else
    alert(`load module [${id}] not exist!`);
  // _m.m[id](m, m.exports, _m);

  // Flag the module as loaded
  m.l = true;

  // Return the exports of the module
  // 返回模块输出部分
  return m.exports;
}

// object's OwnProperty
// 对象自有属性
function ownProp(object, property) {
  return Object.prototype.hasOwnProperty.call(object, property);
}

// define getter function for harmony exports
// 将模块的输出函数、变量赋值到 exports 对象
function addProp(exports, name, getter) {
  if (!ownProp(exports, name)) {
    Object.defineProperty(exports, name, {
      enumerable: true,
      get: getter
    });
  }
}

// define __esModule on exports
function setEsm(exports) {
  if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
    Object.defineProperty(exports, Symbol.toStringTag, {
      value: 'Module'
    });
  }
  Object.defineProperty(exports, '__esModule', {
    value: true
  });
}

// create a fake namespace object
// mode & 1: value is a module id, require it
// mode & 2: merge all properties of value into the ns
// mode & 4: return value when already ns object
// mode & 8|1: behave like require
function fakeNs(value, mode) {
  if (mode & 1) // eslint-disable-line
    value = load(value);
  
  if (mode & 8) // eslint-disable-line
    return value;
  
  if ((mode & 4) // eslint-disable-line
    && typeof value === 'object'
    && value && value.__esModule)
    return value;

  const ns = Object.create(null);
  setEsm(ns);

  Object.defineProperty(ns, 'default', {
    enumerable: true,
    value
  });

  if (mode & 2 && typeof value !== 'string') // eslint-disable-line
    for (let key in value) 
      addProp(ns, key, function(key) {
        return value[key];
      }.bind(null, key));
  
  return ns;
}

// getDefaultExport function for compatibility with non-harmony modules
function getExport(module) {
  function getDefault() {
    return module.default;
  }
  function getModuleExports() {
    return module;
  }

  const getter = (module && module.__esModule)
    ? getDefault : getModuleExports;
  
  addProp(getter, 'a', getter);

  return getter;
}

/**
 * 将模块代码作为函数体，加入到模块对象中
 * 从安全角度，用户不能覆盖系统模块!!!
 */
function add(ms) {
  Object.keys(ms).forEach(k => {
    if (k !== 'R' && k !== 'M') {      
      // eslint-disable-next-line
      ms[k] = new Function('module', 'exports', '_m_', `'use strict';${ms[k]}`); 
      // if (!_m[k])
      // 覆盖下载的模块
      _m[k] = ms[k];
    }
  })
}

/**
 * 动态并发下载资源，涉及依赖，需按次序加载
 * load: ['/wia/wia.js?v=1.0.2', '/mall/page.js?v=ver']
 * @param {*} cos 资源下载网址
 * @param {*} fs 需加载文件数组
 */
function get(cos, fs) {
  // 获得一个promise数组
  const ps = fs.map(f => {
    // f = '/wia/wia.js?v=1.0.18';
    const pos = f.indexOf('?v=');
    const ver = f.substr(pos + 3);
    const key = `app ${f.substr(0, pos)}`;
    console.log(`get module key:${key} ver:${ver}`);

    let js = $.store.get(key) || '';
    // 如已经本地缓存，则直接加载
    if (js) {
      console.log(`get module local key:${key} ok!`);
      const jo = JSON.parse(js);
      if (!jo.R || !jo.R.ver || (jo.R && jo.R.ver && jo.R.ver !== ver)) {
        $.store.remove(key);
        js = '';
        console.log(`get module local key:${key} ver:${jo.R.ver} != ${ver}`);
      }
    }

    if (js)
      return (Promise.resolve(js));

    return $.get(cos + f).then(rs => {
      if (rs) {
        console.log(`get module clound ${cos + f} ok!`);
        $.store.set(key, rs);
        return rs
      }
    });
  });

  return Promise.all(ps).then(rs => {    
    rs.forEach(r => {
      const js = r && JSON.parse(r);
      if (js)
        add(js);
    });
  });
}

// public_path__
// let p = ''; // https://cos.wia.pub
// let s = ''; // 入口文件，第一个执行文件，默认为项目的 app.js

export {
  _c as cache, _m as module,
  load, add, get
};
