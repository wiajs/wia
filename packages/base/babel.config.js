/**
 * 代码转换时，控制语法转换与功能补全
 * 目标 node，超es6语法转换，不补全
 * 用于默认转换和eslint
 */
const loose = true;

const presets = [
  // '@babel/preset-react', // 支持 jsx 语法，如果前端项目中使用jsx，需安装并设置
  [
    '@babel/preset-env', // 预设，已经包含大部分新语法
    /*
      1、影响语法转换与功能补全，不指定则将代码转为ES5语法，补全由useBuiltIns决定
      2、指定目标targets，则目标环境已支持的语法、功能不转换、不补全，减少代码
      3、库、后端打包，无需考虑语法转换和补全，目标设置为node，转换、补全留给前端项目完成
      前端项目需考虑浏览器功能缺失，建议设置较低浏览器版本，避免功能不全报错
      后端项目或库，需支持特定node版本，可设置node版本，引入补全代码，可支持特定版本。
      */
    {
      loose,
      // targets: 'defaults', // '> 0.5%, last 2 versions, Firefox ESR, not dead'
      targets: {
        // 浏览器设置规则请参加：https://github.com/browserslist/browserslist
        // browsers: ['>1%', 'last 3 versions', 'Firefox ESR', 'ie >= 11'],
        node: 'current', // 按系统安装的node版本作为目标，后台项目
        // node: '14.0', // 指定兼容到node版本，避免低版本node无法运行，后端项目需要
      },
      /*
      1、用于补全，false不补全，由外部polyfill或runtime corejs补全，否则运行报错
      2、库、后端无需补全，但需开启runtime的 helpers，引用辅助函数代替内置，减少体积
      3、usage 通过自动添加使用方法的的corejs引用实现补全，用于前端项目打包
      如：require("core-js/modules/es.promise.js");
      4、需安装 core-js，属于替换全局的补全方案
      5、UMD页面加载库，需通过runtime的corejs补全，避免污染全局
      */
      // useBuiltIns: 'usage', // 'usage' | 'entry' | false, 缺省为 false
      // usage 需安装并配置corejs版本，defaults to "2.0"
      // corejs: `${require('core-js/package.json').version}`,
      /*
      1、是否将es6模块语法改成其他模块语法，如cjs
      2、false则保留es6语法，可以被rollup或webpack打包时摇树，减少包大小
      3、后端库不需要摇树，直接设置为cjs，除非前端库输出es6版本，方便用户输出时摇树
      */
      modules: false, // 'cjs' | 'auto' | false, 缺省 auto
    },
  ],
];

const plugins = [
  ['@babel/plugin-proposal-class-properties', {loose}],
  ['@babel/plugin-proposal-private-methods', {loose}],
  ['@babel/plugin-proposal-function-bind'],
  ['@babel/plugin-proposal-nullish-coalescing-operator'],
  ['@babel/plugin-proposal-optional-chaining'],
  [
    /* 
    1、将语法转换用到的辅助函数（包括异步await）从内置改为外部runtime引用，避免重复代码
    2、需安装 @babel/runtime-corejs3 是 @babel/runtime、runtime-corejs2 的升级版
    3、corejs: 3，所有用到的es6功能（不管targets），通过runtime-corejs3引用实现补全。
       umd打包页面加载库时，代替usage实现补全，不污染全局空间。
    4、与usage不同的是转换方法名称，不污染全局空间，usage 引用core-js/modules模块，如
      require("core-js/modules/es.promise.js"); 
      替换为：
      var _promise = require("@babel/runtime-corejs3/core-js-stable/promise");
    5、usage 与 corjs并存时，自动用runtime替换core-js/modules模块    
    6、usage时，不使用 runtime，文件引用大量 core-js/modules，使用后引用模块数大量减少
    */
    '@babel/plugin-transform-runtime',
    {
      // helpers: true, // 语法辅助函数，缺省 true，将内置改为对引用，减少文件大小
      // corejs: 3, // false, 2, 3, 缺省 false.
      // require("@babel/runtime/helpers/asyncToGenerator")
      // 设置为 true/false 好像无变化
      // regenerator: true, // asynt/await支持函数asyncToGenerator转换，缺省 true
      // absoluteRuntime: false, // runtime 路径，缺省false
      // 指定runtime 版本，如 runtime-corejs3@7.20.1，缺省 @babel/runtime@7.0.0
      version: `^${require('@babel/runtime-corejs3/package.json').version}`,
    },
  ],
];

module.exports = {
  presets,
  plugins,
  only: ['./src'],
  ignore: ['./dist', './lib'],
  sourceMaps: false, // boolean | "inline" | "both"
  sourceType: 'unambiguous', // "script" | "module" | "unambiguous" 缺省 "module"
  comments: true, // 保留备注 缺省 true
  minified: false, // Default: false，压缩代码
};
