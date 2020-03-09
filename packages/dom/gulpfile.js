const fs = require('fs');
const gulp = require('gulp');
const build = require('./build');
const configs = require('./config');

const env = process.env.NODE_ENV || 'development';
const src = './src';
const out = './dist';
console.log(`env:${env} src:${src} out:${out}`);

if (!fs.existsSync(out)) {
  fs.mkdirSync(out);
}

gulp.task('build', cb => {
  console.log('build ...');
  build(configs, cb);
});

gulp.task('watch', () => {
  gulp.watch(`${src}/*.js`, gulp.series(['build']));
});
