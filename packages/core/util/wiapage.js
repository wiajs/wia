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

/**
 * 检查指定项目文件是否更新，如更新则重新打包，并自动部署到腾讯云CDN
 * @param {string} dir 路径
 */
async function pages(dir) {
  let R = '';

  try {
    const files = await getPage(dir);
    const pf = {}; // page file
    files.forEach(v => {
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
    });

    // page下的文件写入pages.js文件
    if (!_.isEmpty(pf)) R = makeFile(pf, 'pages', dir);
  } catch (err) {
    console.log(`pages exp:${err.message}`);
  }

  return R;
}

/**
 * webpack 打包文件，每个文件单独打包
 * @param {string} dir 路径
 * 返回 {'page/login': './src/page/login.js'}
 */
async function pack(dir) {
  const R = {};

  try {
    const files = await getPage(dir);
    files.forEach(v => {
      const fl = path.parse(v);
      const name = `${fl.dir}/${fl.name}`;
      R[name] = `./src/${v}`;
    });
  } catch (err) {
    console.log(`pack exp:${err.message}`);
  }

  return R;
}

/**
 * 获取指定路径中的js文件列表
 * @param {string} dir 路径
 */
async function getPage(dir) {
  let R = [];

  try {
    dir = dir || process.cwd();
    const src = path.join(dir, './src');
    _cfg = require(path.join(src, './config/app.js'));
    const rs = [];
    // 获取目标项目目录、子目录下的文件MD5对象
    await getFile(path.join(src, './page'), rs, src);

    // 有js文件变化，html、less 暂未处理
    if (!_.isEmpty(rs)) {
      const pf = {}; // page file
      // f.R.JS.forEach((v) => { // forEach 回调函数是同步执行的，不用担心jf没有准备好！

      // eslint-disable-next-line
      for (const v of rs) {
        let pk = false; // 是否需重新编译      console.log('pages', {js: f.R.JS});

        // eslint-disable-next-line
        for (let pf of _cfg.file) {
          // console.log({v, pf});
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
          for (let pf of _cfg.exclude) {
            if (
              (pf.includes('.js') && v === pf) ||
              (!pf.includes('.js') && new RegExp(`^${pf}/`, 'i').test(v))
            ) {
              pk = false;
              break;
            }
          }
        }
        // console.log('getPage', {pk, v});
        // 需编译文件
        if (pk) {
          R.push(v);
        }
      }
    }
  } catch (err) {
    console.log(`getPage exp:${err.message}`);
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
 * 也用来创建编译入口文件（entry.js），webpack最新5.xx版本自动将入口文件改为直接运行代码！
 * wia需要模块化，创建入口文件来解决该问题。
 * @param {*} pf
 */
function makeFile(pf, name, dir) {
  if (_.isEmpty(pf)) return '';

  dir = dir || process.cwd();
  const src = path.join(dir, './src');

  const p = [];
  Object.keys(pf).forEach(k => {
    const f = pf[k].replace(/.js$/, '');
    p.push(`import ${k} from '${f}';`);
  });

  const ns = [];
  Object.keys(pf).forEach(k => {
    const n = k[0].toLowerCase() + k.slice(1);
    ns.push(`    const ${n} = new ${k}();`);
  });

  p.push(`
export default class ${name[0].toUpperCase() + name.slice(1)} {
  init() {
${ns.join('\n')}
  }
}
`);

  // 将内容写入page.js 文件
  const ps = p.join('\n');
  if (!_.isEmpty(ps)) {
    const f = path.join(src, `./${name}.js`);
    // 获取当前页面共用模块
    let lastH = '';
    if (fs.existsSync(f)) {
      const tx = fs.readFileSync(f, 'utf8');
      lastH = hash(tx);
    }
    // 有变化，则更新pages文件
    if (hash(ps) !== lastH) {
      // console.log({f, ps});
      fs.writeFileSync(
        f,
        ps,
        e => e && console.log(`save ${f} exp:${e.message}`)
      );
  }
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
async function getFile(dir, rs, src) {
  const tree = {};
  try {
    // 获得当前文件夹下的所有的文件夹和文件，赋值给目录和文件数组变量
    const [dirs, files] = _(fs.readdirSync(dir)).partition(p =>
      fs.statSync(path.join(dir, p)).isDirectory()
    );

    // 对子文件夹进行递归，使用了Promise.all，并发执行
    const pms = [];
    dirs.forEach(v => pms.push(getFile(path.join(dir, v), rs, src)));
    await Promise.all(pms);

    // 当前目录下所有文件名进行同步hash计算
    // eslint-disable-next-line no-restricted-syntax
    files.forEach(f => {
      if (f.includes('.js') && rs) {
        let file = path.join(dir, f);
        // 去掉项目根路径
        file = file.replace(src, '');
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

function clear(dir) {
  try {
    dir = dir || process.cwd();
    const src = path.join(dir, './src');
    const ps = `
export default class Pages {
}
`;
    let lastH = '';
    const f = path.join(src, './pages.js');
    if (fs.existsSync(f)) {
      const tx = fs.readFileSync(f, 'utf8');
      lastH = hash(tx);
    }
    // 有变化，则更新pages文件
    if (hash(ps) !== lastH) {
      console.log('clear save...');
      // 将内容写入page.js 文件
      fs.writeFileSync(
        f,
        ps,
        e => e && console.log(`clear save ${f} exp:${e.message}`)
      );
    }
  } catch (err) {
    console.log(`clear exp:${err.message}`);
  }
}

// pages(); // 单独调试用

module.exports = {pages, pack, clear, makeFile};
