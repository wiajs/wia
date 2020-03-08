const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const terser = require('terser');
const rollup = require('rollup');

const env = process.env.NODE_ENV || 'development';

const isProd = env === 'production';

function build(cfg, cb) {
  let built = 0;
  const total = cfg.length;
  const next = () => {
    buildEntry(cfg[built])
      .then(() => {
        built++;
        if (built < total) next();
        else cb && cb();
      })
      .catch(logError);
  };

  next();
}

function buildEntry({input, output}) {
  const {file, banner} = output;
  return rollup
    .rollup(input)
    .then(bundle => bundle.write(output)) // bundle.generate(output))
    .then(bundle => {
      // console.log(bundle)
      const {code} = bundle.output[0];
      report(code, file);

      if (isProd && output.format === 'umd') {
        const minified =
          // (banner ? banner + '\n' : '') +
          terser.minify(code, {
            toplevel: true,
            output: {
              ascii_only: true,
            },
            compress: {
              pure_funcs: ['makeMap'],
            },
          }).code;
        return write(file.replace('.js', '.min.js'), minified, true);
      }
      // else {
      //   return write(file, code);
      // }
    });
}

function report(code, dest, extra) {
  console.log(
    blue(path.relative(process.cwd(), dest)) +
      ' ' +
      getSize(code) +
      (extra || '')
  );
}

function write(dest, code, zip) {
  return new Promise((resolve, reject) => {
    fs.writeFile(dest, code, err => {
      if (err) return reject(err);
      if (zip) {
        zlib.gzip(code, (err, zipped) => {
          if (err) return reject(err);
          report(code, dest, ' (gzipped: ' + getSize(zipped) + ')');
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
  return (code.length / 1024).toFixed(2) + 'kb';
}

function logError(e) {
  console.log(e);
}

function blue(str) {
  return '\x1b[1m\x1b[34m' + str + '\x1b[39m\x1b[22m';
}

module.exports = build;
