const fs = require('node:fs');
const zlib = require('node:zlib');
const path = require('node:path');
const {minify} = require('terser');
const rollup = require('rollup');
const {transform} = require('@swc/core');

const {extname} = path;

const env = process.env.NODE_ENV || 'development';

const isProd = env === 'production';
const _startTk = Date.now();

if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

async function build(cfgs, cb) {
  const pms = [];
  for (let i = 0, len = cfgs.length; i < len; i++) {
    try {
      const cfg = cfgs[i];
      pms.push(buildEntry(cfg));
    } catch (e) {
      console.error(`build exp:${e.message}`);
    }
  }

  await Promise.all(pms);

  cb && cb();
}

/**
 * rollup warn
 * @param {*} param0
 */
function onwarn({loc, frame, message}) {
  if (loc) {
    console.warn(`${loc.file} (${loc.line}:${loc.column}) ${message}`);
    if (frame) console.warn(frame);
  } else {
    console.warn(message);
  }
}

/**
 * 根据配置输出打包文件
 * @param {*}
 */
async function buildEntry({swc, input, output}) {
  let bundle;
  try {
    input.onwarn = onwarn;
    bundle = await rollup.rollup(input);

    const {file, banner, format} = output;
    let rt;
    if (swc && output.format === 'umd')
      rt = await bundle.generate(output); // 不写入文件
    else rt = await bundle.write(output); // 写入文件

    const {code} = rt.output[0];
    report(code, file); // 文件尺寸

    // 生产输出 压缩版本
    if (format === 'umd') {
      if (swc) es5(code, banner, file);
      else min(code, banner, file);
    }
  } catch (e) {
    console.error(`buildEntry exp:${e.message}`);
  }

  if (bundle) await bundle.close();
}

/**
 * 使用swc输出文件，速度快一倍，打包压缩文件偏大
 * @param {*} code
 * @param {*} banner
 * @param {*} file
 * @returns
 */
async function es5(code, banner, file) {
  let R = null;

  try {
    const opt = {
      jsc: {
        parser: {
          syntax: 'ecmascript',
          jsx: false,
        },
        target: 'es5',
        loose: true,
        minify: {
          compress: false,
          mangle: false,
        },
      },
      module: {
        type: 'es6',
      },
      minify: false,
      isModule: true,
      sourceMaps: true,
    };

    const out = await transform(code, opt);
    write(file, `${banner}\n${out.code}//# sourceMappingURL=base.map`);
    write(`${file}.map`, out.map, false);

    min(out.code, banner, file);
    // opt.minify = true;
    // const out2 = await transform(code, opt);
    // const minCode = (banner ? `${banner}\n` : '') + out2.code;

    // // 异步写出
    // const ext = path.extname(file);
    // write(file.replace(ext, `.min${ext}`), minCode, true, true, true);
    R = true;
  } catch (e) {
    console.error(` exp:${e.message}`);
  }

  return R;
}

/**
 * 压缩输出到文件
 * @param {*} code
 * @param {*} banner
 * @param {*} file
 * @returns
 */
async function min(code, banner, file) {
  let R = null;

  try {
    let {code: minCode} = await minify(code, {
      sourceMap: false,
      toplevel: true, // 删除顶层作用域中未引用函数和变量，默认false
      output: {
        ascii_only: true, // 非ascii转为 \u字符，默认false
      },
      compress: {
        pure_funcs: null, // ['makeMap', 'console.log'], 无副作用函数，可摇树删除
      },
    });

    minCode = (banner ? `${banner}\n` : '') + minCode;

    // 异步写出
    const ext = path.extname(file);
    write(file.replace(ext, `.min${ext}`), minCode, true, true);

    R = true;
  } catch (e) {
    console.error(` exp:${e.message}`);
  }

  return R;
}

function report(code, dest, extra) {
  console.log(
    `${blue(path.relative(process.cwd(), dest))} ${getSize(code)}${extra || ''}`
  );
}

/**
 * 写入文件
 * @param {*} dest
 * @param {*} code
 * @param {*} zip
 * @returns
 */
function write(dest, code, rep = true, zip = false) {
  return new Promise((resolve, reject) => {
    fs.writeFile(dest, code, err => {
      if (err) return reject(err);
      if (!rep) resolve();
      else if (zip) {
        zlib.gzip(code, (err2, zipped) => {
          if (err2) return reject(err2);
          report(code, dest, ` (gzipped: ${getSize(zipped)})`);

          const spend = Date.now() - _startTk;
          console.log('build', {spend});

          resolve();
        });
      } else {
        report(code, dest);
        resolve();
      }
    });
  });
}

function getSize(code) {
  return `${(code.length / 1024).toFixed(2)}kb`;
}

function blue(str) {
  return `\x1b[1m\x1b[34m${str}\x1b[39m\x1b[22m`;
}

module.exports = build;
