/**
 * Wia App 基类，从 Module 和 Event 继承。
 */
// 使用 rollup打包注意
// dom 独立，不打入 core！！！
// import $ from '@wiajs/dom'; // dom操作库，这种引用，导致 dom的压缩、非压缩 common包都会打入 core
// const $ = require('@wiajs/dom'); // dom操作库，这种引用，导致 dom的压缩、非压缩 common包都不会打入 core，保留了 require

import Utils from './utils';

import Event from './event';
import Page from './page';
import Module from './module';
import Constructors from './constructors';
import Modals from './modals';
import loadModule from './loadModule';
import {jsx} from './jsx';

// Core Modules
import Resize from './resize';
import Click from './clicks'; // UI组件的点击（Click 或 Touch）事件
import Touch from './touch'; // UI组件的Touch事件

// ServiceWorker
import SW from './sw';

const {extend, nextFrame, colorThemeCSSStyles} = Utils;
const {support, device} = $;

// Default
const def = {
  version: '1.0.1',
  el: 'body',
  root: 'body',
  theme: 'auto',
  language: window.navigator.language,
  routes: [],
  name: 'App',
  lazyModulesPath: null,
  initOnDeviceReady: true,
  // init: true, // 路由加载应用时为true
  darkMode: undefined,
  iosTranslucentBars: true,
  iosTranslucentModals: true,
  component: undefined,
  componentUrl: undefined,
  userAgent: null,
  url: null,
  colors: {
    primary: '#007aff',
    red: '#ff3b30',
    green: '#4cd964',
    blue: '#2196f3',
    pink: '#ff2d55',
    yellow: '#ffcc00',
    orange: '#ff9500',
    purple: '#9c27b0',
    deeppurple: '#673ab7',
    lightblue: '#5ac8fa',
    teal: '#009688',
    lime: '#cddc39',
    deeporange: '#ff6b22',
    white: '#ffffff',
    black: '#000000',
  },
};

/**
 * 应用类，每个wia应用从该类继承，由 首页加载创建或者路由创建
 */
class App extends Module {
  static apps = {};
  constructor(opts = {}) {
    super(opts);
    // eslint-disable-next-line
    // 单例，只能一个
    if (App.instance && typeof window !== 'undefined') {
      throw new Error("App is already initialized and can't be initialized more than once");
    }

    const passedParams = extend({}, opts);

    const app = this;
    $.App = App;
    App.instance = app; // 控制单例
    app.device = device;
    app.support = support;
    console.log('App constructor', {Device: device, Support: support});

    // Extend defaults with modules params
    app.useModulesParams(def);

    // Extend defaults with passed params
    app.params = extend(def, opts);
    // 兼容 root
    if (opts.root && !opts.el) {
      app.params.el = opts.root;
    }

    // 判断Page、App实例
    $.isPage = p => p instanceof Page;
    $.isApp = p => p instanceof App;

    // 参数内容赋值给app 实例
    extend(app, {
      owner: app.params.owner, // 所有者
      name: app.params.name, // App Name
      id: `${app.params.owner}.${app.params.name}`, // App id
      version: app.params.version, // App version
      // Routes
      routes: app.params.routes,
      // Lang
      language: app.params.language,
      cfg: app.params.cfg, // app config
      api: app.params.api, // api config

      // Theme 主题
      theme: (() => {
        if (app.params.theme === 'auto') {
          if (device.ios) return 'ios';
          if (device.desktop) return 'pc';
          return 'md';
        }
        return app.params.theme;
      })(),

      // Initially passed parameters
      passedParams,
      online: window.navigator.onLine,
      colors: app.params.colors,
      darkMode: app.params.darkMode,
    });

    if (opts.store) app.params.store = params.store;

    // 触摸事件
    app.touchEvents = {
      start: support.touch ? 'touchstart' : support.pointerEvents ? 'pointerdown' : 'mousedown',
      move: support.touch ? 'touchmove' : support.pointerEvents ? 'pointermove' : 'mousemove',
      end: support.touch ? 'touchend' : support.pointerEvents ? 'pointerup' : 'mouseup',
    };

    // 插件：插入的模块类，每个模块作为app的一个属性，合并到实例。
    // 模块包括相关属性及方法（如：create、get、destroy）
    // 调用每个模块的 create 方法
    app.useModules();

    // 初始化数据，Init Data & Methods
    app.initData();

    // 应用初始化，路由跳转时不执行初始化
    if (app.params.init) {
      if (device.cordova && app.params.initOnDeviceReady) {
        $(document).on('deviceready', () => {
          app.init();
        });
      } else {
        app.init();
      }
    }

    // Return app instance
    return app;
  }

  // 应用事件
  // 首次加载事件，全局只触发一次
  load(param) {
    this.emit('local::load appLoad', param);
  }

  // 从后台切换到前台显示事件
  show(url, data) {
    this.emit('local::show appShow', url, data);
  }

  // 从前台显示切换到后台事件
  hide() {
    this.emit('local::hide appHide');
  }

  // 卸载应用事件
  unload() {
    this.emit('local::unload appUnload');
  }

  setColorTheme(color) {
    if (!color) return;
    const app = this;
    app.colors.primary = color;
    app.setColors();
  }

  setColors() {
    const app = this;
    if (!app.colorsStyleEl) {
      app.colorsStyleEl = document.createElement('style');
      document.head.prepend(app.colorsStyleEl);
    }

    app.colorsStyleEl.textContent = colorThemeCSSStyles(app.colors);
  }

  /**
   * 绑定容器
   * 应用初始化时调用
   * @param {HTMLElement} rootEl
   */
  mount(rootEl) {
    const app = this;

    const $rootEl = $(rootEl || app.params.el).eq(0);
    extend(app, {
      // Root
      root: $rootEl,
      $el: $rootEl,
      el: $rootEl?.[0],
      // RTL
      rtl: $rootEl.css('direction') === 'rtl',
    });

    // Save Root
    if (app.root && app.root[0]) {
      app.root[0].wia = app;
    }
    if (app.$el && app.$el[0]) {
      app.$el[0].wia = app;
    }

    app.el.f7 = app;

    // 自动暗黑主题，Auto Dark Theme
    const DARK = '(prefers-color-scheme: dark)';
    const LIGHT = '(prefers-color-scheme: light)';
    app.mq = {};
    if (window.matchMedia) {
      app.mq.dark = window.matchMedia(DARK);
      app.mq.light = window.matchMedia(LIGHT);
    }

    app.colorSchemeListener = ({matches, media}) => {
      if (!matches) {
        return;
      }
      const html = document.querySelector('html');
      if (media === DARK) {
        html.classList.add('dark');
        app.darkMode = true;
        app.emit('darkModeChange', true);
      } else if (media === LIGHT) {
        html.classList.remove('dark');
        app.darkMode = false;
        app.emit('darkModeChange', false);
      }
    };
    app.emit('mount');
  }

  /**
   * 初始化数据
   */
  initData() {
    const app = this;

    // Data
    app.data = {};
    if (app.params.data && typeof app.params.data === 'function') {
      $.extend(app.data, app.params.data.bind(app)());
    } else if (app.params.data) {
      $.extend(app.data, app.params.data);
    }
    // Methods
    app.methods = {};
    if (app.params.methods) {
      Object.keys(app.params.methods).forEach(methodName => {
        if (typeof app.params.methods[methodName] === 'function') {
          app.methods[methodName] = app.params.methods[methodName].bind(app);
        } else {
          app.methods[methodName] = app.params.methods[methodName];
        }
      });
    }
  }

  enableAutoDarkTheme() {
    if (!window.matchMedia) return;

    const app = this;
    const html = document.querySelector('html');
    if (app.mq.dark && app.mq.light) {
      app.mq.dark.addEventListener('change', app.colorSchemeListener);
      app.mq.light.addEventListener('change', app.colorSchemeListener);
    }
    if (app.mq.dark && app.mq.dark.matches) {
      html.classList.add('dark');
      app.darkMode = true;
      app.emit('darkModeChange', true);
    } else if (app.mq.light && app.mq.light.matches) {
      html.classList.remove('dark');
      app.darkMode = false;
      app.emit('darkModeChange', false);
    }
  }

  disableAutoDarkTheme() {
    if (!window.matchMedia) return;

    const app = this;
    if (app.mq.dark) app.mq.dark.removeEventListener('change', app.colorSchemeListener);
    if (app.mq.light) app.mq.light.removeEventListener('change', app.colorSchemeListener);
  }

  setDarkMode(mode) {
    const app = this;
    if (mode === 'auto') {
      app.enableAutoDarkMode();
    } else {
      app.disableAutoDarkMode();
      $('html')[mode ? 'addClass' : 'removeClass']('dark');
      app.darkMode = mode;
    }
  }

  initAppComponent(callback) {
    const app = this;
    app.router.componentLoader(
      app.params.component,
      app.params.componentUrl,
      {componentOptions: {el: app.$el[0]}},
      el => {
        app.$el = $(el);
        app.$el[0].wia = app;
        app.$elComponent = el.f7Component;
        app.el = app.$el[0];
        if (callback) callback();
      },
      () => {}
    );
  }

  // 初始化，包括控制 html 样式，wia app 启动时需要执行，切换app时，不需要
  init(rootEl) {
    const app = this;
    app.setColors();
    app.mount(rootEl);

    const init = () => {
      if (app.initialized) return app;

      app.$el.addClass('framework7-initializing');

      // RTL attr
      if (app.rtl) {
        $('html').attr('dir', 'rtl');
      }

      // Auto Dark Mode
      if (typeof app.params.darkMode === 'undefined') {
        app.darkMode = $('html').hasClass('dark');
      } else {
        app.setDarkMode(app.params.darkMode);
      }

      // Watch for online/offline state
      window.addEventListener('offline', () => {
        app.online = false;
        app.emit('offline');
        app.emit('connection', false);
      });

      window.addEventListener('online', () => {
        app.online = true;
        app.emit('online');
        app.emit('connection', true);
      });

      // Root class
      app.$el.addClass('framework7-root');

      // Theme class
      $('html').removeClass('ios md pc').addClass(app.theme);

      // iOS Translucent
      if (app.params.iosTranslucentBars && app.theme === 'ios') {
        $('html').addClass('ios-translucent-bars');
      }
      if (app.params.iosTranslucentModals && app.theme === 'ios') {
        $('html').addClass('ios-translucent-modals');
      }

      // Init class
      nextFrame(() => {
        app.$el.removeClass('framework7-initializing');
      });

      initStyle();

      // Emit, init other modules
      app.initialized = true;

      // 发起init 事件，模块 on 里面有 init方法的会被触发
      app.emit('init');
    };

    if (app.params.component || app.params.componentUrl) {
      app.initAppComponent(() => {
        init();
      });
    } else {
      init();
    }

    return app;
  }

  // eslint-disable-next-line
  // 加载模块
  loadModule(m) {
    App.loadModule(m);
    // 模块初始化
    if (this[m.name].init) this[m.name].init();
  }

  // eslint-disable-next-line
  loadModules(...args) {
    return App.loadModules(...args);
  }

  getVnodeHooks(hook, id) {
    const app = this;
    if (!app.vnodeHooks || !app.vnodeHooks[hook]) return [];
    return app.vnodeHooks[hook][id] || [];
  }

  // eslint-disable-next-line
  get $() {
    return $;
  }

  static get Dom() {
    return $;
  }

  static get $() {
    return $;
  }

  static get Module() {
    return Module;
  }

  static get Event() {
    return Event;
  }
  static get Class() {
    return Module;
  }

  static get Events() {
    return Event;
  }
}

/**
 * 初始化html样式
 * from device module
 */
function initStyle() {
  const classNames = [];
  const html = document.querySelector('html');
  const metaStatusbar = document.querySelector(
    'meta[name="apple-mobile-web-app-status-bar-style"]'
  );
  if (!html) return;
  if (
    device.standalone &&
    device.ios &&
    metaStatusbar &&
    metaStatusbar.content === 'black-translucent'
  ) {
    classNames.push('device-full-viewport');
  }

  // Pixel Ratio
  classNames.push(`device-pixel-ratio-${Math.floor(device.pixelRatio)}`);
  // OS classes
  if (device.os && !device.desktop) {
    classNames.push(`device-${device.os}`);
  } else if (device.desktop) {
    classNames.push('device-desktop');
    if (device.os) {
      classNames.push(`device-${device.os}`);
    }
  }
  if (device.cordova || device.phonegap) {
    classNames.push('device-cordova');
  }

  // Add html classes
  classNames.forEach(className => {
    html.classList.add(className);
    // console.log({className});
  });
}

// App 类 静态方法、属性

App.jsx = jsx;
App.ModalMethods = Modals;
App.ConstructorMethods = Constructors;
// 动态加载模块（base里面已经内置动态加载，这个方法应该用不上）
App.loadModule = loadModule;
App.loadModules = modules => {
  return Promise.all(modules.map(module => App.loadModule(module)));
};

// app 加载到 app实例的一些扩展模块
App.support = support;
App.device = device;
App.utils = Utils;

// 添加应用缺省模块
App.use([
  Resize, // 控制屏幕大小
  Click, // 触发UI组件的点击（Click 或 Touch）事件
  Touch, // 触发app.on(Touch事件)
  SW, // ServiceWorker

  //INSTALL_COMPONENTS
]);

export default App;
