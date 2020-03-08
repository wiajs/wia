/**
 * 动态加载扩展模块，被 App调用。
 * 通过写入页面标签实现动态加载js、css
 * wia base中已经实现了动态下载、加载模块功能，该模块应删除
 */

const fetchedModules = [];
function loadModule(moduleToLoad) {
  const App = this;

  return new Promise((resolve, reject) => {
    const app = App.instance;
    let modulePath;
    let moduleObj;
    let moduleFunc;
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
      const matchNamePattern = moduleToLoad.match(/([a-z0-9-]*)/i);
      if (
        moduleToLoad.indexOf('.') < 0 &&
        matchNamePattern &&
        matchNamePattern[0].length === moduleToLoad.length
      ) {
        if (!app || (app && !app.params.lazyModulesPath)) {
          reject(
            new Error(
              'Wia: "lazyModulesPath" app parameter must be specified to fetch module by name'
            )
          );
          return;
        }
        modulePath = `${app.params.lazyModulesPath}/${moduleToLoad}.js`;
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
      const module = moduleFunc(App, false);
      if (!module) {
        reject(new Error("Wia: Can't find Wia component in specified component function"));
        return;
      }
      // Check if it was added
      if (App.prototype.modules && App.prototype.modules[module.name]) {
        resolve();
        return;
      }
      // Install It
      install(module);

      resolve();
    }
    if (moduleObj) {
      const module = moduleObj;
      if (!module) {
        reject(new Error("Wia: Can't find Wia component in specified component"));
        return;
      }
      // Check if it was added
      if (App.prototype.modules && App.prototype.modules[module.name]) {
        resolve();
        return;
      }
      // Install It
      install(module);

      resolve();
    }
    if (modulePath) {
      if (fetchedModules.indexOf(modulePath) >= 0) {
        resolve();
        return;
      }
      fetchedModules.push(modulePath);
      // 动态加载 js 脚本
      const scriptLoad = new Promise((resolveScript, rejectScript) => {
        App.request.get(
          modulePath,
          scriptContent => {
            const id = $.id();
            const callbackLoadName = `wia_component_loader_callback_${id}`;

            const scriptEl = document.createElement('script');
            scriptEl.innerHTML = `window.${callbackLoadName} = function (Wia, WiaAutoInstallComponent) {return ${scriptContent.trim()}}`;
            // 动态加载 js
            $('head').append(scriptEl);

            const componentLoader = window[callbackLoadName];
            delete window[callbackLoadName];
            $(scriptEl).remove();

            const module = componentLoader(App, false);

            if (!module) {
              rejectScript(new Error(`Wia: Can't find Wia component in ${modulePath} file`));
              return;
            }

            // Check if it was added
            if (App.prototype.modules && App.prototype.modules[module.name]) {
              resolveScript();
              return;
            }

            // Install It
            install(module);

            resolveScript();
          },
          (xhr, status) => {
            rejectScript(xhr, status);
          }
        );
      });

      // 动态加载css样式
      const styleLoad = new Promise(resolveStyle => {
        App.request.get(
          modulePath.replace('.js', app.rtl ? '.rtl.css' : '.css'),
          styleContent => {
            const styleEl = document.createElement('style');
            styleEl.innerHTML = styleContent;
            $('head').append(styleEl);

            resolveStyle();
          },
          () => {
            resolveStyle();
          }
        );
      });

      Promise.all([scriptLoad, styleLoad])
        .then(() => {
          resolve();
        })
        .catch(err => {
          reject(err);
        });
    }
  });
}

export default loadModule;
