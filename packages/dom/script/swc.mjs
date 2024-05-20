/**
 * 获取 swc 编译选项
 * @param {*} dev 开发模式
 * @param {*} cli 客户端
 * @returns
 */
const getOpt = (dev = false, cli = false) => {
  const opt = {
    jsc: {
      parser: {
        dynamicImport: false,
        privateMethod: true,
        functionBind: false,
        exportDefaultFrom: false,
        exportNamespaceFrom: false,
        decorators: false,
        decoratorsBeforeExport: false,
        topLevelAwait: false,
        importMeta: false,
        preserveAllComments: false, // 备注
      },
      transform: {
        legacyDecorator: true,
        decoratorMetadata: true,
        decoratorVersion: '2022-03', // "2021-12" (default)
        react: {
          runtime: 'classic', // automatic or classic
          throwIfNamespace: true,
          useBuiltins: true,
          development: dev,
        },
      },
      loose: true,
      target: 'es2022', // es5,es6,es2020,es2021,es2022
      externalHelpers: false,
      keepClassNames: true, // 保留原始类名
    },
    minify: false, // 压缩代码
    sourceMaps: false,
  };

  // 输出cjs，避免服务端拆分成chunks
  if (!cli) {
    // opt.module = {
    // type: 'commonjs', // 转换后输出格式 "commonjs", "es6", "amd", "umd"
    // ignoreDynamic: true,
    // };
  }

  // 非本地开发

  /* if (!dev) {
    opt.env = {
      mode: 'entry',
      coreJs: 3,
      forceAllTransforms: true,
      dynamicImport: true,
      // targets: {
      //  ...(isClient
      //    ? { browsers: pkg.browserslist }
      //    : { node: pkg.engines.node.match(/(\d+\.?)+/)[0] }),
      // },
    };
  }
 */
  return opt;
};

function getJsOpt(dev = false, cli = false) {
  const opt = getOpt(dev, cli);
  opt.jsc.parser.syntax = 'ecmascript';
  opt.jsc.parser.jsx = true;
  return opt;
}

const getTsOpt = (dev = false, cli = false) => {
  const opt = getOpt(dev, cli);
  opt.jsc.parser.syntax = 'typescript';
  opt.jsc.parser.tsx = true;
  return opt;
};

export {getTsOpt, getJsOpt};
