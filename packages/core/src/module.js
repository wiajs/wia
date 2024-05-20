/**
 * Wia app、router等继承类，通过模块化扩展类功能
 * 使用 use 装载，注解可能完成类似功能
 * 不装载则需在代码中按普通泪，单独引用、创建、使用
 * 装载的模块可能影响其他模块
 */
import Event from './event';

class Module extends Event {
  constructor(params = {}, parents = []) {
    super(params, parents);
    const self = this;
    self.params = params;
  }

  // eslint-disable-next-line
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
      const module = instance.modules[moduleName];
      // Extend params
      if (module.params) {
        $.extend(instanceParams, module.params);
      }
    });
  }

  /**
   * 将扩展模块的相关方法、事件加载到类实例
   * @param {*} moduleName 扩展模块名称
   * @param {*} moduleParams
   */
  useModule(moduleName = '', moduleParams = {}) {
    const instance = this;
    if (!instance.modules) return;

    // 从原型中获得的模块类引用
    const module = typeof moduleName === 'string' ? instance.modules[moduleName] : moduleName;
    if (!module) return;

    // 扩展实例的方法和属性，Extend instance methods and props
    if (module.instance) {
      Object.keys(module.instance).forEach(modulePropName => {
        const moduleProp = module.instance[modulePropName];
        if (typeof moduleProp === 'function') {
          instance[modulePropName] = moduleProp.bind(instance);
        } else {
          instance[modulePropName] = moduleProp;
        }
      });
    }

    // 将扩展模块中的on加载到实例的事件侦听中，比如 init 在实例初始化时被调用
    if (module.on && instance.on) {
      Object.keys(module.on).forEach(eventName => {
        // 避免模块事件异常溢出影响其他模块
        function fn(...args) {
          try {
            module.on[eventName].bind(this)(...args)
          } catch (e) {
            console.log(`${moduleName}.on${eventName} exp:${e.message}`)
          }
        }
        instance.on(eventName, fn)
      })
    }

    // 加载扩展模块的vnodeHooks，Add vnode hooks
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
    }

    // 执行模块的create方法，模块实例化回调，Module create callback
    if (module.create) {
      module.create.bind(instance)(moduleParams);
    }
  }

  /**
   * 实例创建初始化时，执行扩展模块中定义的相关回调
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
   * 将模块类装配到指定类的modules属性，用于扩展类
   * @param {*} module 模块类
   * @param  {...any} params 参数
   */
  static installModule(module, ...params) {
    const Class = this;
    if (!Class.prototype.modules) Class.prototype.modules = {};
    const name = module.name || `${Object.keys(Class.prototype.modules).length}_${$.now()}`;
    // 原型属性中引用该模块类，类实例
    Class.prototype.modules[name] = module;
    // 模块如果定义了原型，则将模块原型加载到类原型
    if (module.proto) {
      Object.keys(module.proto).forEach(key => {
        Class.prototype[key] = module.proto[key];
      });
    }
    // 加载静态属性
    if (module.static) {
      Object.keys(module.static).forEach(key => {
        Class[key] = module.static[key];
      });
    }
    // 执行加载回调函数
    if (module.install) {
      module.install.apply(Class, params);
    }
    return Class;
  }

  /**
   * 加载扩展模块到类
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

export default Module;
