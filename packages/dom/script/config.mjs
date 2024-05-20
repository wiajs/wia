/* eslint-disable import/no-extraneous-dependencies */
import path from 'node:path'
import {builtinModules} from 'node:module' // node 内部库
import {fileURLToPath} from 'node:url'
// import babel from '@rollup/plugin-babel'; // 编译转换ES6语法
import swc from '@rollup/plugin-swc' // 编译转换ES6语法
import commonjs from '@rollup/plugin-commonjs' // CommonJS 模块转换成 ES6
import resolve from '@rollup/plugin-node-resolve' // 导入node_modules 中的 CommonJS 模块
import replace from '@rollup/plugin-replace' // 替换待打包文件里的一些变量，如 process在浏览器端是不存在的，需要被替换

import {getJsOpt, getTsOpt} from './swc.mjs'

import pkg from '../package.json' assert {type: 'json'}

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const version = process.env.VERSION || pkg.version
const name = '$' // umd 模式下的全局变量名

const banner = `/*!
  * wia dom v${version}
  * (c) 2015-${new Date().getFullYear()} Sibyl Yu and contributors
  * Released under the MIT License.
  */`

const env = process.env.NODE_ENV || 'development'
const isDev = env !== 'production'

const dir = _path => path.resolve(__dirname, '../', _path)

const input = dir('./src/index.js')

/**
 * 从 package.json 和 builtinModules 中获取不打包的引用库
 * 生成 node cjs 库时需要
 * umd 全部打包，不需要
 */
const external = [
  ...Object.keys(pkg.dependencies || {}),
  ...Object.keys(pkg.peerDependencies || {}),
  ...Object.keys(pkg.devdependencies || {}),
  ...builtinModules,
  ...builtinModules.map(m => `node:${m}`),
  /@babel\/runtime/, // babel helpers  @babel/runtime-corejs3/
]

const configs = [
  // browser dev
  {
    file: dir('dist/dom.cjs'), // cjs格式，后端打包，保留引用
    format: 'cjs',
    browser: false,
    external,
  },
  {
    file: dir('dist/dom.mjs'), // esm格式，后端打包，保留引用
    format: 'esm',
    exports: 'named', // 名称方式输出各个子模块
    browser: false,
    external,
  },
  {
    file: dir('dist/dom.js'), // umd格式，es5语法，web直接加载，合并引用
    format: 'umd',
    browser: true,
    es5: true, // 兼容旧版本浏览器
    name, // 全局名称，替换 window.name
    exports: 'default', // default 方式输出单一包
    external: [],
  },
].map(genConfig)

/**
 * 输出配置文件，只支持input 和 output，其他如 plugins、external 无效
 * plugins、external 需放入 input
 * @param {*} param0
 * @returns
 */
function genConfig({browser = true, es5 = false, ...cfg}) {
  const config = {
    input: {
      input,
      external: cfg.external, // 外部变量，不打入包中
      // 插件，从上向下顺序执行
      plugins: [
        // node_modules 中超ES6已转换为ES6
        resolve({browser}), // 从 node_modules 合并文件，pkg的browser文件替换 mainFields: ['browser']
        commonjs(), // common 转换为 es6，rollup 只支持 es6
        // 替换特定字符串
        replace({
          preventAssignment: true, // 避免赋值替换  xxx = false -> false = false
          'process.env.NODE_ENV': JSON.stringify(env),
          'process.env.NODE_TEST': JSON.stringify('false'),
          'process.browser': !!browser,
          __VERSION__: version,
        }),
        // 根据需要，将es6 转换为 es5，兼容所有浏览器，依赖@babel/runtime-corejs3 polyfill
        es5 && //swc(), // eslint-disable-line
          swc({swc: getJsOpt(false, false)}),
        // swc({swc: {jsc: {target: 'es5'}}}),
      ],
    },
    output: {
      file: cfg.file,
      format: cfg.format,
      sourcemap: isDev,
      banner,
      // name: '$$', // $ 会覆盖 window.$
      name: cfg.name ?? undefined,
      exports: cfg.exports ?? 'auto',
      globals: {}, // 全局变量
      generatedCode: {
        constBindings: cfg.format !== 'umd', // var -> const
      },
    },
  }

  return config
}

export default configs
