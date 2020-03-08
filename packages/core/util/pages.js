/* eslint-disable import/no-extraneous-dependencies */
/**
 * 自动根据page目录文件生成 src目录的pages.js 文件
 */
const _ = require('lodash');
const path = require('path');
const crypto = require('crypto');
const utils = require('utility');
const fs = require('fs');

let _cfg = {};
let _src = '';

/**
 * 检查指定项目文件是否更新，如更新则重新打包，并自动部署到腾讯云CDN
 * @param {* } prj 项目名称， 比如 ebx， 或 drone
 */
async function pages(dir) {
  let R = '';

  try {
    dir = dir || process.cwd();
    _src = path.join(dir, './src');
    _cfg = require(path.join(_src, './config.js'));
    const rs = [];
    // 获取目标项目目录、子目录下的文件MD5对象
    await getFile(path.join(_src, './page'), rs);

    // 有js文件变化，html、less 暂未处理
    if (!_.isEmpty(rs)) {
      const pf = {}; // page file
      // f.R.JS.forEach((v) => { // forEach 回调函数是同步执行的，不用担心jf没有准备好！

      // eslint-disable-next-line
      for (const v of rs) {
        let pk = false; // 是否需重新编译      console.log('pages', {js: f.R.JS});

        // eslint-disable-next-line
        for (let pf of _cfg.app.file) {
          // eslint-disable-line
          if (
            (pf.includes('.js') && v === pf) ||
            (!pf.includes('.js') && new RegExp(`^/?${pf}/`, 'i').test(v))
          ) {
            pk = true;
            break;
          }
        }

        // 排除
        if (pk) {
          // eslint-disable-next-line
          for (let pf of _cfg.app.exclude) {
            if (
              (pf.includes('.js') && v === pf) ||
              (!pf.includes('.js') && new RegExp(`^${pf}/`, 'i').test(v))
            ) {
              pk = false;
              break;
            }
          }
        }
        console.log('pages', {pk, v});
        // 需编译文件
        if (pk) {
          let name = '';
          const file = v;

          // 去掉包含page路径
          if (v.includes('page/')) {
            const fl = path.parse(v.replace('page/', ''));
            if (fl.dir) {
              name = `${fl.dir}/${fl.name}`;
              let ns = name.split('/');
              ns = ns.map(n => n[0].toUpperCase() + n.slice(1));
              name = ns.join('');
              pf[name] = `./${file}`;
            } else {
              name = fl.name[0].toUpperCase() + fl.name.slice(1);
              pf[name] = `./${file}`;
            }
          }
        }
      }

      // page下的文件写入pages.js文件
      if (!_.isEmpty(pf)) R = pagefile(pf);
    }
  } catch (err) {
    console.log(`pages exp:${err.message}`);
  }

  return R;
}

/**
 * 生成指定文件的 MD5值，用于判断文件内容是否变化
 * @param {*} file
 * @param {*} cb
 */
function hash(tx) {
  let R = crypto.createHash('md5');
  R.update(tx);
  R = R.digest('hex');
  return R;
}

/**
 * 将page中的js文件创建到pages.js中，方便调试
 * @param {*} pf
 */
function pagefile(pf) {
  if (_.isEmpty(pf)) return '';

  const p = [];
  Object.keys(pf).forEach(k => {
    const f = pf[k].replace(/.js$/, '');
    p.push(`import ${k} from '${f}';`);
  });

  const n = [];
  Object.keys(pf).forEach(k => {
    const name = k[0].toLowerCase() + k.slice(1);
    n.push(`    const ${name} = new ${k}();`);
  });

  p.push(`
export default class Pages {
  init() {
${n.join('\n')}
  }
}
`);

  // 将内容写入page.js 文件
  const ps = p.join('\n');
  if (!_.isEmpty(ps)) {
    const f = path.join(_src, './pages.js');
    // 获取当前页面共用模块
    let lastH = '';
    if (fs.existsSync(f)) {
      const tx = fs.readFileSync(f, 'utf8');
      lastH = hash(tx);
    }
    // 有变化，则更新pages文件
    if (hash(ps) !== lastH)
      fs.writeFileSync(
        f,
        ps,
        e => e && console.log(`save ${f} exp:${e.message}`)
      );
  }

  return ps;
}

/**
 * 对指定文件夹下的子文件夹和文件进行递归，生成带MD5的hash值列表对象
 * 对于子目录文件， 生成嵌套对象， 如
 * {项目目录: {子目录:{xxx:e8461954cbf736f2e1d71cb84c72c2b4}}
 * @param {*} dir 文件路径
 * @param {*} rs 上次更新的hash文件对象
 */
async function getFile(dir, rs) {
  const tree = {};
  try {
    // 获得当前文件夹下的所有的文件夹和文件，赋值给目录和文件数组变量
    const [dirs, files] = _(fs.readdirSync(dir)).partition(p =>
      fs.statSync(path.join(dir, p)).isDirectory()
    );

    // 对子文件夹进行递归，使用了Promise.all，并发执行
    const pms = [];
    dirs.forEach(v => pms.push(getFile(path.join(dir, v), rs)));
    await Promise.all(pms);

    // 当前目录下所有文件名进行同步hash计算
    // eslint-disable-next-line no-restricted-syntax
    files.forEach(f => {
      if (f.includes('.js') && rs) {
        let file = path.join(dir, f);
        // 去掉项目根路径
        file = file.replace(_src, '');
        if (file.startsWith(path.sep)) file = file.substr(1);

        if (path.sep !== '/') file = file.replace(/\\/gim, '/'); // 统一路径为/，方便处理

        rs.push(file);
      }
    });
  } catch (e) {
    console.log(`getFile exp:${e.message}`);
  }

  return tree;
}

// pages(); // 单独调试用

module.exports = pages;
