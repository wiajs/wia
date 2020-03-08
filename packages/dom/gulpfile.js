const gulp = require('gulp');
const rollup = require('rollup');

const env = process.env.NODE_ENV || 'development';
const src = `./src`;
const out = `./dist`;
console.log(`env:${env} src:${src} out:${out}`);

const date = (function date() {
  return {
    year: new Date().getFullYear(),
    month: 'January February March April May June July August September October November December'.split(
      ' '
    )[new Date().getMonth()],
    day: new Date().getDate(),
  };
})();

const banner = `
/**
 * Dom 操作常用函数，从 Zepto 和 Dom7 中摘录
 * http://www.wia.pub/dom
 *
 * @license MIT
 * Released on: ${date.month} ${date.day}, ${date.year}
 */
`.trim();

// ES MODULE DIST
function es(cb) {
  console.log('es ...');

  let cbs = 0;

  rollup
    .rollup({
      input: `${src}/index.js`,
    })
    .then(bundle => {
      return bundle.write({
        strict: true,
        file: `${out}/dom.js`,
        format: 'es',
        name: 'Dom',
        sourcemap: env === 'development',
        // sourcemapFile: `${out}/dom.js.map`,
        banner,
      });
    })
    .then(() => {
      cbs += 1;
      if (cb && cbs === 2) cb();
    });

  rollup
    .rollup({
      input: `${src}/dom.m.js`,
    })
    .then(bundle => {
      return bundle.write({
        strict: true,
        file: `${out}/dom.m.js`,
        format: 'es',
        name: 'Dom',
        sourcemap: env === 'development',
        // sourcemapFile: `${out}/dom.m.js.map`,
        banner,
      });
    })
    .then(() => {
      cbs += 1;
      if (cb && cbs === 2) cb();
    });
}

gulp.task('build', cb => {
  console.log('build dom...');

  es(() => {
    cb();
  });
});

gulp.task('watch', () => {
  gulp.watch(`${src}/*.js`, gulp.series(['build']));
});
