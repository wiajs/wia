/**
 * Wia App 基类，从 Module 和 Event 继承。
 */
import $ from '@wiajs/dom'; // 必选，dom操作库

import Support from './support';
import Device from './device';
import Utils from './utils';

import Event from './event';
import Module from './module';
import Constructors from './constructors';
import Modals from './modals';
import loadModule from './loadModule';

// Core Modules
import Resize from './resize';
// ServiceWorker
import SW from './sw';

$.support = Support;
$.device = Device;

class App extends Module {
  constructor(params) {
    super(params);
    if (App.instance) {
      throw new Error(
        "App is already initialized and can't be initialized more than once"
      );
    }

    const passedParams = $.extend({}, params);

    // App Instance
    const app = this;
    App.instance = app;
    $.app = app;
    $.App = App;

    // Default
    const defaults = {
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
      componentUrl: undefined,
    };

    // Extend defaults with modules params
    app.useModulesParams(defaults);

    // Extend defaults with passed params
    app.params = $.extend(defaults, params);

    const $rootEl = $(app.params.root);

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
      cfg: app.params.cfg, // confg 配置
      // RTL
      rtl: $rootEl.css('direction') === 'rtl',
      // Theme
      theme: (function getTheme() {
        if (app.params.theme === 'auto') {
          if (Device.ios) return 'ios';
          if (Device.desktop && Device.electron) return 'aurora';
          return 'md';
        }
        return app.params.theme;
      })(),
      // Initially passed parameters
      passedParams,
      online: window.navigator.onLine,
    });

    // Save Root
    if (app.root && app.root[0]) {
      app.root[0].wia = app;
    }

    // 加载use插入的模块类相关方法，Load Use Modules
    app.useModules();

    // 初始化数据，Init Data & Methods
    app.initData();

    // 自动暗黑主题，Auto Dark Theme
    const DARK = '(prefers-color-scheme: dark)';
    const LIGHT = '(prefers-color-scheme: light)';
    app.mq = {};
    if (window.matchMedia) {
      app.mq.dark = window.matchMedia(DARK);
      app.mq.light = window.matchMedia(LIGHT);
    }
    app.colorSchemeListener = function({matches, media}) {
      if (!matches) {
        return;
      }
      const html = document.querySelector('html');
      if (media === DARK) {
        html.classList.add('theme-dark');
      } else if (media === LIGHT) {
        html.classList.remove('theme-dark');
      }
    };

    // app 初始化，Init
    function init() {
      if (Device.cordova && app.params.initOnDeviceReady) {
        $(document).on('deviceready', () => {
          app.init();
        });
      } else {
        app.init();
      }
    }
    if (app.params.component || app.params.componentUrl) {
      app.router.componentLoader(
        app.params.component,
        app.params.componentUrl,
        {componentOptions: {el: app.root[0]}},
        el => {
          app.root = $(el);
          app.root[0].f7 = app;
          app.rootComponent = el.f7Component;
          if (app.params.init) init();
        }
      );
    } else if (app.params.init) {
      init();
    }

    // Return app instance
    return app;
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
      app.mq.dark.addListener(app.colorSchemeListener);
      app.mq.light.addListener(app.colorSchemeListener);
    }
    if (app.mq.dark && app.mq.dark.matches) {
      html.classList.add('theme-dark');
    } else if (app.mq.light && app.mq.light.matches) {
      html.classList.remove('theme-dark');
    }
  }

  disableAutoDarkTheme() {
    if (!window.matchMedia) return;

    const app = this;
    if (app.mq.dark) app.mq.dark.removeListener(app.colorSchemeListener);
    if (app.mq.light) app.mq.light.removeListener(app.colorSchemeListener);
  }

  // 初始化
  init() {
    const app = this;
    if (app.initialized) return app;

    app.root.addClass('framework7-initializing');

    // RTL attr
    if (app.rtl) {
      $('html').attr('dir', 'rtl');
    }

    // Auto Dark Theme
    if (app.params.autoDarkTheme) {
      app.enableAutoDarkTheme();
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
    app.root.addClass('framework7-root');

    // Theme class
    $('html')
      .removeClass('ios md aurora')
      .addClass(app.theme);

    // iOS Translucent
    if (app.params.iosTranslucentBars && app.theme === 'ios' && Device.ios) {
      $('html').addClass('ios-translucent-bars');
    }
    if (app.params.iosTranslucentModals && app.theme === 'ios' && Device.ios) {
      $('html').addClass('ios-translucent-modals');
    }

    // Init class
    $.nextFrame(() => {
      app.root.removeClass('framework7-initializing');
    });

    initStyle();

    // Emit, init other modules
    app.initialized = true;

    app.emit('init');

    return app;
  }

  // eslint-disable-next-line
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
    Device.standalone &&
    Device.ios &&
    metaStatusbar &&
    metaStatusbar.content === 'black-translucent'
  ) {
    classNames.push('device-full-viewport');
  }

  // Pixel Ratio
  classNames.push(`device-pixel-ratio-${Math.floor(Device.pixelRatio)}`);
  // OS classes
  if (Device.os && !Device.desktop) {
    classNames.push(`device-${Device.os}`);
  } else if (Device.desktop) {
    classNames.push('device-desktop');
    if (Device.os) {
      classNames.push(`device-${Device.os}`);
    }
  }
  if (Device.cordova || Device.phonegap) {
    classNames.push('device-cordova');
  }

  // Add html classes
  classNames.forEach(className => {
    html.classList.add(className);
  });
}

App.ModalMethods = Modals;
App.ConstructorMethods = Constructors;
// 动态加载模块（base里面已经内置动态加载，这个方法应该用不上）
App.loadModule = loadModule;
App.loadModules = function loadModules(modules) {
  return Promise.all(modules.map(module => App.loadModule(module)));
};

// app 加载到 app实例的一些扩展模块
App.support = Support;
App.device = Device;
App.utils = Utils;

// 添加应用缺省模块
App.use([
  Resize, // 控制屏幕大小
  SW, // ServiceWorker

  //INSTALL_COMPONENTS
]);

export default App;
