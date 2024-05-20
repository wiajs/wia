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
 * ���������������ļ�
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
      rt = await bundle.generate(output); // ��д���ļ�
    else rt = await bundle.write(output); // д���ļ�

    const {code} = rt.output[0];
    report(code, file); // �ļ��ߴ�

    // ������� ѹ���汾
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
 * ʹ��swc����ļ����ٶȿ�һ�������ѹ���ļ�ƫ��
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

    // // �첽д��
    // const ext = path.extname(file);
    // write(file.replace(ext, `.min${ext}`), minCode, true, true, true);
    R = true;
  } catch (e) {
    console.error(` exp:${e.message}`);
  }

  return R;
}

/**
 * ѹ��������ļ�
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
      toplevel: true, // ɾ��������������δ���ú����ͱ�����Ĭ��false
      output: {
        ascii_only: true, // ��asciiתΪ \u�ַ���Ĭ��false
      },
      compress: {
        pure_funcs: null, // ['makeMap', 'console.log'], �޸����ú�������ҡ��ɾ��
      },
    });

    minCode = (banner ? `${banner}\n` : '') + minCode;

    // �첽д��
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
 * д���ļ�
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
