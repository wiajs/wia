/********************
! ** * 动态模块管理 ** * !
***********************/
   
// The modules object
const _m = {}; // 已下载并缓存的模块，通过add添加，在load时被执行，并返回模块输出部分

// The module cache
const _c = {}; // 已执行并缓存的模块，已提供输出接口

/**
 * 执行模块代码，返回模块输出部分
 * 类似 node.js 的 require函数 "./owner/app/src/index.js"
 * @param {*} id 模块id，一般为
 */
function load(id) {
  // Check if module is in cache
  if (_c[id]) {
    return _c[id].exports;
  }

  // Create a new module (and put it into the cache)
  const m = {
    exports: {},
  };
  _c[id] = m;

  // M.m 保存所有模块，需动态加载
  // Execute the module function
  // 执行每个模块的代码
  if (_m[id])
    // 执行函数，this指针指向 window
    // 比如 箭头函数内的this 
    _m[id](m, m.exports, load);
  else alert(`load module [${id}] not exist!`);

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
      get: getter,
    });
  }
}

// define __esModule on exports
function setEsm(exports) {
  if (typeof Symbol !== 'undefined' && Symbol.toStringTag) {
    Object.defineProperty(exports, Symbol.toStringTag, {value: 'Module'});
  }
  Object.defineProperty(exports, '__esModule', {value: true});
}

// create a fake namespace object
// mode & 1: value is a module id, require it
// mode & 2: merge all properties of value into the ns
// mode & 4: return value when already ns object
// mode & 8|1: behave like require
function fakeNs(value, mode) {
  if (mode & 1)
    // eslint-disable-line
    value = load(value);
  
  if (mode & 8)
    // eslint-disable-line
    return value;
  
  if (
    mode & 4 && // eslint-disable-line
    typeof value === 'object' &&
    value &&
    value.__esModule
  )
    return value;

  const ns = Object.create(null);
  setEsm(ns);

  Object.defineProperty(ns, 'default', {
    enumerable: true,
    value,
  });

  if (mode & 2 && typeof value !== 'string')
    // eslint-disable-line
    for (let key in value) 
      addProp(
        ns,
        key,
        function (key) {
        return value[key];
        }.bind(null, key)
      );
  
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

  const getter = module && module.__esModule ? getDefault : getModuleExports;
  
  addProp(getter, 'a', getter);

  return getter;
}

/**
 * 将模块代码作为函数体，加入到模块对象中
 * 支持生产和开发模式生成的代码
 * 从安全角度，用户不能覆盖系统模块!!!
 */
function add(ms) {
  Object.keys(ms).forEach(k => {
    if (k !== 'R' && k !== 'M') {      
      let r = ms[k];
      // 函数
      const ps = r.match(
        /^function\s*\(\s*(\w+),?\s*(\w*)\s*,?\s*(\w*)\)\s*\{\s*(eval)\s*\(/
      );

      if (ps && ps[2] === '') {
        // 一个参数
        if (ps[4]) {
          const rg = new RegExp(
            `^function\\s*\\(\\s*${ps[1]}\\s*\\)\\s*\\{\\s*eval\\s*\\(\\s*["']`
          );
          r = r.replace(rg, '');
          r = r.substring(0, r.lastIndexOf('");'));
          r = JSON.parse(`{"m":"${r}"}`).m;
        } else {
          const rg = new RegExp(`^function\\s*\\(\\s*${ps[1]}\\s*\\)\\s*\\{`);
          r = r.replace(rg, '');
          r = r.substring(0, r.lastIndexOf('}'));
        }
        // eslint-disable-next-line
        r = new Function(ps[1], r);
      } else if (ps && ps[3] === '') {
        // 两个参数
        if (ps[4]) {
          const rg = new RegExp(
            `^function\\s*\\(\\s*${ps[1]},\\s*${ps[2]}\\s*\\)\\s*\\{\\s*eval\\s*\\(\\s*["']`
          );
          r = r.replace(rg, '');
          r = r.substring(0, r.lastIndexOf('");'));
          // eval中的代码字符串做了转义，需将转义字符还原成真实字符
          r = JSON.parse(`{"m":"${r}"}`).m;
        } else {
          const rg = new RegExp(
            `^function\\s*\\(\\s*${ps[1]},\\s*${ps[2]}\\s*\\)\\s*\\{`
          );
          r = r.replace(rg, '');
          r = r.substring(0, r.lastIndexOf('}'));
        }
      // eslint-disable-next-line
        r = new Function(ps[1], ps[2], r);
      } else if (ps && ps[3] !== '') {
        // 三个参数
        if (ps[4]) {
          const rg = new RegExp(
            `^function\\s*\\(\\s*${ps[1]},\\s*${ps[2]},\\s*${ps[3]}\\s*\\)\\s*\\{\\s*eval\\s*\\(\\s*["']`
          );
          r = r.replace(rg, '');
          r = r.substring(0, r.lastIndexOf('");'));
          r = JSON.parse(`{"m":"${r}"}`).m;
        } else {
          const rg = new RegExp(
            `^function\\s*\\(\\s*${ps[1]},\\s*${ps[2]},\\s*${ps[3]}\\s*\\)\\s*\\{`
          );
          r = r.replace(rg, '');
          r = r.substring(0, r.lastIndexOf('}'));
    }
        // eslint-disable-next-line
        r = new Function(ps[1], ps[2], ps[3], r);
}

      // 覆盖或添加到模块管理器
      _m[k] = r;
    }
  });
}

/**
 * 应用切换时，需清理缓存的 cache 和 模块
 * 从安全角度，用户不能覆盖系统模块!!!
 */
function clear() {}

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
    const key = `${f.substr(0, pos)}`;
    console.log(`get module key:${key} ver:${ver}`);

    let js = $.store.get(key) || '';
    // 如已经本地缓存，则直接加载
    if (js) {
      console.log(`get module local key:${key} ok!`);
      if (!js.R || !js.R.ver || (js.R && js.R.ver && js.R.ver !== ver)) {
        $.store.remove(key);
        console.log(`get module local key:${key} ver:${js.R.ver} != ${ver}`);
        js = '';
      }
    }

    if (js) return Promise.resolve(js);

    if (cos.endsWith('/')) cos = cos.substr(0, cos.length - 1);
    return $.get(`${cos}/${f}`).then(rs => {
      if (rs) {
        console.log(`get module clound ${cos + f} ok!`);
        $.store.set(key, rs);
        return rs;
      }
    });
  });

  return Promise.all(ps).then(rs => {    
    rs.forEach(r => {
      if (r) add(r);
    });
  });
}

// expose the modules object (__webpack_modules__)
// 与webpack编译代码兼容

load.m = _m;
// expose the module cache
load.c = _c;
load.d = addProp;
load.r = setEsm;
load.t = fakeNs;
load.n = getExport;
load.o = ownProp;

// 对外输出，可通过 $.M 访问，$.M 本身就是 load，$.M === $.M.load
export {_c as cache, _m as module, load, add, get};
