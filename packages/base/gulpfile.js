const fs = require('fs-extra');
const gulp = require('gulp');
const Terser = require('terser');
const rollup = require('rollup');
const resolve = require('rollup-plugin-node-resolve');
const buble = require('rollup-plugin-buble');
const pkg = require('./package.json');

const env = process.env.NODE_ENV || 'development';
const prj = 'base';
const src = `./src`;
const out = `./dist`;
const map = `./map`;
console.log(`env:${env} src:${src} out:${out} map:${map}`);

const banner = `/*!
  * wia base v${pkg.version}
  * (c) ${new Date().getFullYear()} Sibyl Yu
  * @license MIT
  */`;


// UMD DIST
function umd(cb) {
  console.log('umd ...');

  rollup
    .rollup({
      input: `${src}/index.js`,
      plugins: [resolve(), buble()],
    })
    .then(bundle => {
      return bundle.write({
        strict: true,
        file: `${out}/base.js`,
        format: 'umd',
        name: 'Base',
        sourcemap: env === 'development',
        // sourcemapFile: `${map}/base.js.map`,
        banner,
      });
    })
    .then(bundle => {
      if (env === 'development') {
        if (cb) cb();
        return;
      }

      // 压缩版本，用于生产
      /*     gulp.src(`${out}/base.js`)
      .pipe(sourcemaps.init())
      .pipe(uglify())
      .pipe(header(banner))
      .pipe(rename({suffix: '.min'}))
      .pipe(sourcemaps.write(map, {
        includeContent: false,
        sourceRoot: src})) // 调试需要
      .pipe(gulp.dest(out))
      .on('end', () => {
        if (cb)
          cb();
      });
 */

      const result = bundle.output[0];
      const minified = Terser.minify(result.code, {
        sourceMap: {
          filename: `${prj}.min.js`,
          url: `${prj}.min.js.map`,
        },
        output: {
          preamble: banner,
        },
      });

      fs.writeFileSync(`${out}/${prj}.min.js`, minified.code);
      fs.writeFileSync(`${out}/${prj}.min.js.map`, minified.map);
    })
    .catch(err => {
      console.log(err);
    });

  if (cb) cb();
}

gulp.task('build', cb => {
  console.log('build base...');

  umd(() => {
    cb();
  });
});

gulp.task('watch', () => {
  gulp.watch(`${src}/*.js`, gulp.series(['build']));
});
