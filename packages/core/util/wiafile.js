/* eslint-disable import/no-extraneous-dependencies */
/**
 * 自动根据src、dist目录文件生成 wiafile.yml 文件映射
 */
const _ = require('lodash');
const path = require('path');
const crypto = require('crypto');
const utils = require('utility');
const fs = require('fs');
const yaml = require('js-yaml');

let _cfg = {};
let _src = '';

function promisify(f) {
  return (...arg) =>
    new Promise((res, rej) => {
      f(...arg, (err, rs) => {
        if (err) rej(err);
        else res(rs);
      });
    });
}

/**
 * 获取wia文件，保存到 wiafile.yml 文件，返回 update，便于编译或者发布。
 * @param {*} dir 文件map路径
 * @param {*} act build or pub，build 时，读取src，pub时，读取 dist
 */
async function make(dir, act = 'build') {
  let R = {};

  try {
    dir = dir || process.cwd(); // 默认指向运行目录
    _src = act === 'pub' ? path.join(dir, './dist') : path.join(dir, './src');
    _cfg = require(path.join(dir, './wiaconfig.js')); // eslint-disable-line

    const {ver} = _cfg;
    // const rs = await getFiles(dir, ver); // 获得该项目所有文件，变化的文件放入f.R 中
    // 获取上次自动上传文件清单
    const f = path.resolve(dir, './wiafile.yml');
    let rs = {};
    let r = {};
    if (fs.existsSync(f)) r = yaml.safeLoad(fs.readFileSync(f, 'utf8')); // eslint-disable-line
    // r = yaml.safeLoad(fs.readFileSync(file, 'utf8'));
    // if (checkVer(r, ver))
    //   rs = {};
    let skip = false;
    if (r) {
      if (r.pub && r.pub.pubing && act === 'pub') {
        R = r.pub.update || {};
        skip = true;
      } else if (r.local && r.local.building && act === 'build')
        skip = true;

      // 重新扫描文件，去掉之前的 update
      if (!skip) {
        if (act === 'build') {
          if (r.local) {
            delete r.local.update;
            rs = r.local;
          }
        } else if (act === 'pub') {
          if (r.pub) {
            delete r.pub.update;
            rs = r.pub;
          }
        }
      }
    }

    if (!skip) {
      // 获取目标项目目录、子目录下的文件MD5对象
      await getFile(_src, rs, act);
      console.log('wiafile make getFile', {dir, rs, act});

      if (!_.isEmpty(rs)) {
        R = rs.update || {};
        if (act === 'build') rs = {local: rs, wia: r && r.pub ? r.pub : {}};
        else rs = {pub: rs, local: r && r.local ? r.local : {}};
        console.log('wiafile', {dir, rs, act});
        save(rs, f);
      }
    }
  } catch (ex) {
    console.log(`wiafile make exp:${ex.message}`);
  }

  return R;
}

/**
 * 处理js更新文件
 * @param {*} rs
 */
function js(rs) {
  // 有js文件变化，html、less 暂未处理
  if (rs && rs.R && !_.isEmpty(rs.R.JS)) {
    const pf = {}; // page file
    // f.R.JS.forEach((v) => { // forEach 回调函数是同步执行的，不用担心jf没有准备好！
    for (let v of rs.R.JS) {
      // eslint-disable-line
      let pk = false; // 是否需重新编译      console.log('pages', {js: f.R.JS});

      for (let pf of _cfg.file) {
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
        for (let pf of _cfg.exclude) {
          // eslint-disable-line
          if (
            (pf.includes('.js') && v === pf) ||
            (!pf.includes('.js') && new RegExp(`^${pf}/`, 'i').test(v))
          ) {
            pk = false;
            break;
          }
        }
      }

      // 需编译文件
      if (pk) {
        let name = '';
        let file = v;
        if (v.includes('/')) {
          const dir = path.dirname(v);
          file = path.basename(v);
          name = `${prj}/${dir}/${file.substring(0, file.indexOf('.'))}`;
          uf[name] = `./src/${prj}/${dir}/${file}`;
        } else {
          name = `${prj}/${file.substring(0, file.indexOf('.'))}`;
          uf[name] = `./src/${prj}/${file}`;
        }

        // 去掉包含page路径
        /*           if (v.includes('page/')) {
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
*/
      }
    }

    // 有更新则发布
    if (!_.isEmpty(uf)) {
      R.f = rs;
    }
    // page下的文件写入pages.js文件
    //if (!_.isEmpty(pf))
    //  R = pagefile(pf);
  }
}

function checkVer(rs, ver) {
  let R = false;
  // 比较主、中版本号，发现config.js与wiamap.js中的不一致，则全部重新发布！
  if (rs && ver) {
    if (rs.R && rs.R.ver) {
      let rg = /(\d*)\.(\d*)\.(\d+)/.exec(rs.R.ver);
      const rv = (rg && `${rg[1]}.${rg[2]}`) || '';
      rg = /(\d*)\.(\d*)\.(\d+)/.exec(ver);
      const pv = (rg && `${rg[1]}.${rg[2]}`) || '';
      if (rv !== pv) rs = {};
    } else {
      R = true;
    }
  }
}

/**
 * 增加版本号
 * @param {*} prj 项目名称
 */
async function addVer(prj, rf, ver) {
  let R = '';

  try {
    // 参数配置文件
    const f = path.join(__dirname, '/src/config/app.js');
    const rv = /(\d*)\.(\d*)\.(\d+)/.exec(ver);
    const nv = (rv && `${rv[1]}.${rv[2]}.${parseInt(rv[3], 10) + 1}`) || '';
    if (nv) {
      const re = new RegExp(`ver\\s*:\\s*['"]${ver}['"]`, 'i');
      let pcs = fs.readFileSync(f, 'utf8');
      pcs = pcs.replace(re, `ver: '${nv}'`);
      fs.writeFileSync(
        f,
        pcs,
        e => e && console.log(`save ${f} exp:${e.message}`)
      );

      // 更新配置文件后，更新f，便于后续处理
      if (rf) {
        rf['config.js'] = await promisify(hashFile)(f);
        // // config.js 必须包含在 app.js 中！
        // if (rf.R && rf.R.JS.includes('config.js'))
        //   delete rf.R.JS['config.js'];
      }

      console.warn(`addVer config ${ver} -> ${nv}`);
      R = nv;
    }
  } catch (e) {
    console.log(` exp:${e.message}`);
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
 * 通过比较当前项目文件和文件记录中的文件MD5值，
 * 将变化的文件放入update，用于build or publish
 * @param {*} dir 文件路径
 * @param {*} rs 上次更新的hash文件对象
 * @param {*} act build or pub操作，最新的文件列表写入building or pubing
 */
async function getFile(dir, rs, act) {
  const tree = {};
  try {
    // 获得当前文件夹下的所有的文件夹和文件，赋值给目录和文件数组变量
    const [dirs, files] = _(fs.readdirSync(dir)).partition(p =>
      fs.statSync(path.join(dir, p)).isDirectory()
    );

    // 对子文件夹进行递归，使用了await，串行同步执行
    let pms = [];
    for (let i = 0, ilen = dirs.length; i < ilen; i++) {
      const d = dirs[i];
      // eslint-disable-line
      let pk = true;
      // 排除根目录
      if (dir === _src && _cfg.exclude) {
        for (let j = 0, jlen = _cfg.exclude.length; j < jlen; j++) {
          const pf = _cfg.exclude[j];
          // eslint-disable-line
          if (
            !pf.includes('*.') &&
            !pf.includes('.js') &&
            new RegExp(`^${pf}$`, 'i').test(d)
          ) {
            pk = false;
            break;
          }
        }
      }
      if (pk) {
        // tree[d] = await getDir(path.join(dir, d), last); // 路径创建对象
        pms.push(getFile(path.join(dir, d), rs, act));
      }
    }
    let r = await Promise.all(pms);

    pms = [];
    // 当前目录下所有文件名进行同步hash计算
    // eslint-disable-next-line no-restricted-syntax
    for (const f of files) {
      // (pf.includes('.js') && v === pf)
      // tree[f] = await promisify(hashFile)(path.join(dir, f), rs, last); // eslint-disable-line
      let pk = true;
      // 排除根目录
      if (_cfg.exclude) {
        for (let j = 0, jlen = _cfg.exclude.length; j < jlen; j++) {
          const pf = _cfg.exclude[j];
          // eslint-disable-line
          if (
            pf.includes('*.') &&
            new RegExp(`${pf.replace('*.', '[\\s\\S]+\\.')}$`, 'i').test(f)
          ) {
            console.log('getFile', {pf, f});
            pk = false;
            break;
          }
        }
      }
      if (pk) pms.push(hashFile(path.join(dir, f), rs, act));
    }
    r = await Promise.all(pms);
  } catch (e) {
    console.log(`getFile exp:${e.message}`);
  }

  return tree;
}

/**
 * 设置变更文件列表
 * @param {*} rs 写入数据集，变更文件写入 rs.update
 * @param {*} f 当前文件，含路径，含后缀，不含src 根路径
 */
function setUpdate(rs, f) {
  let R = null;

  if (!rs) return null;

  try {
    if (!rs.update) rs.update = {time: utils.logDate(), tick: Date.now()};

    let r = rs.update;
    r.js = r.js || [];
    r.html = r.html || [];
    r.css = r.css || [];
    r.less = r.less || [];
    r.img = r.img || [];
    r.asset = r.asset || [];

    // 'mall/page/login': './src/mall/page/login.js'
    switch (path.extname(f).toLowerCase()) {
      case '.js':
        r = r.js;
        break;
      case '.html':
        r = r.html;
        break;
      case '.less':
        r = r.less;
        break;
      case '.css':
        r = r.css;
        break;
      case '.jpg':
        r = r.img;
        break;
      case '.png':
        r = r.img;
        break;
      default:
        r = r.asset;
    }

    if (r) r.push(f);

    R = r;
  } catch (e) {
    console.log(`setUpdate exp:${e.message}`);
  }

  return R;
}

/**
 * 生成指定文件的 MD5值，写入rs.cur对象，用于判断文件是否变化
 * 变化文件，写入 rs.update
 * @param {*} f 文件
 * @param {*} rs 写入的数据集
 */
function hashFile(f, rs, act = 'build') {
  return new Promise((res, rej) => {
    const r = fs.createReadStream(f);
    const md5 = crypto.createHash('md5');
    let hex = '';

    r.on('data', md5.update.bind(md5));
    r.on('end', () => {
      hex = md5.digest('hex');
      if (rs) {
        // 去掉项目根路径
        f = f.replace(_src, '');
        if (f.startsWith(path.sep)) f = f.substr(1);

        if (path.sep !== '/') f = f.replace(/\\/gim, '/'); // 统一路径为/，方便处理

        // console.log('hashFile', {file, act});
        let hs = null;
        switch (act) {
          case 'build': {
            if (!rs.building)
              rs.building = {
                time: utils.logDate(),
                tick: Date.now(),
              };
            rs.building[f] = hex;
            hs = rs.build || {};
            break;
          }

          case 'pub': {
            if (!rs.pubing)
              rs.pubing = {
                time: utils.logDate(),
                tick: Date.now(),
              };
            rs.pubing[f] = hex;
            hs = rs.pub || {};
            break;
          }

          // 默认放入 last
          default: {
            break;
          }
        }

        const h = hs && hs[f];
        // getLastHash(last, f);
        // 变化的文件，记录到update中
        if (!h || h !== hex) setUpdate(rs, f);
      }
      res(hex);
    });
  });
}

/**
 * 按yaml格式存储到指定文件
 * @param {object} rs
 * @param {string} f
 */
function save(rs, f) {
  const yml = yaml.safeDump(rs);
  fs.writeFileSync(f, yml, err => {
    if (err) console.log(`save exp:${err.message}`);
  });
}

/**
 * 编译完成，building文件列表变为build或删除
 * 之前的build清除
 * @param {*} dir
 */
function builded(dir, succ = true) {
  let R = {};
  try {
    dir = dir || process.cwd(); // 默认指向运行目录
    const f = path.resolve(dir, './wiafile.yml');
    let r = {};
    if (fs.existsSync(f)) r = yaml.safeLoad(fs.readFileSync(f, 'utf8')); // require(file); // eslint-disable-line
    if (r && r.local && r.local.building) {
      const rs = {local: {}, wia: r.wia ? r.wia : {}};
      if (succ) {
        // const {building: build, build: x, ...z} = r;
        // rs = {build, ...z};
        rs.local.build = r.local.building || {};
        rs.local.update = r.local.update || {};
      } else {
        rs.local.build = r.local.build || {};
        rs.local.update = r.local.update || {};
      }
      save(rs, f);

      R = rs.local.update;
    }
  } catch (e) {
    console.log(`wiafile builded exp:${e.message}`);
  }

  return R;
}

/**
 * 发布完成，pubing 变为 pub 或 被放弃
 * @param {*} dir
 */
function pubed(dir, succ = true) {
  let R = {};
  try {
    dir = dir || process.cwd(); // 默认指向运行目录
    const f = path.resolve(dir, './wiafile.yml');
    let r = {};
    if (fs.existsSync(f)) r = yaml.safeLoad(fs.readFileSync(f, 'utf8')); // require(file); // eslint-disable-line
    if (r && r.wia && r.wia.pubing) {
      const rs = {wia: {}, local: r.local ? r.local : {}};
      if (succ) {
        // const {pubing: pub, pub: x, ...z} = r;
        // rs = {pub, ...z};
        rs.wia.pub = r.pub.pubing;
        rs.wia.update = r.wia.update;
      } else {
        rs.wia.pub = r.wia.pub;
        rs.iwa.update = r.wia.update;
      }

      save(rs, f);
      R = rs.update;
    }
  } catch (e) {
    console.log(`pubed exp:${e.message}`);
  }

  return R;
}

// make(); // 单独调试用
async function build(dir) {
  return make(dir, 'build');
}

async function pub(dir) {
  return make(dir, 'pub');
}

module.exports = {build, builded, pub, pubed};
