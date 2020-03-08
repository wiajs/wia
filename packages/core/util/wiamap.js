/* eslint-disable import/no-extraneous-dependencies */
/**
 * 自动根据src目录文件生成 wiamap.yml 文件映射
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
 * 获取文件map，保存到 wiamap.json 文件，返回 update。
 * @param {*} dir 文件map路径
 * @param {*} act build or pub
 */
async function map(dir, act) {
  let R = {};

  try {
    dir = dir || process.cwd(); // 默认指向运行目录
    _src = path.join(dir, './src');
    _cfg = require(path.join(_src, './config.js')); // eslint-disable-line

    const {ver} = _cfg.app;
    // const rs = await getFiles(dir, ver); // 获得该项目所有文件，变化的文件放入f.R 中
    // 获取上次自动上传文件清单
    const file = path.resolve(dir, './wiamap.yml');
    let rs = {};
    let r = {};
    if (fs.existsSync(file)) r = yaml.safeLoad(fs.readFileSync(file, 'utf8')); // eslint-disable-line
    // r = yaml.safeLoad(fs.readFileSync(file, 'utf8'));
    // if (checkVer(r, ver))
    //   rs = {};
    let skip = false;
    if (r) {
      if ((r.building && act === 'build') || (r.pubing && act === 'pub'))
        skip = true;

      if (!skip) {
        const {update: x, last: y, ...z} = r;
        rs = z;
      }
    }

    if (!skip) {
      // 获取目标项目目录、子目录下的文件MD5对象
      await getFile(_src, rs, act);

      // console.log('wiamap', {dir, rs, act});

      if (!_.isEmpty(rs)) save(rs, file);
      R = rs.update || {};
    }
  } catch (ex) {
    console.log(`wiamap exp:${ex.message}`);
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
        for (let pf of _cfg.app.exclude) {
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
    const f = path.join(__dirname, `/src/${prj}/config.js`);
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
      if (dir === _src && _cfg.app.exclude) {
        for (let j = 0, jlen = _cfg.app.exclude.length; j < jlen; j++) {
          const pf = _cfg.app.exclude[j];
          // eslint-disable-line
          if (!pf.includes('.js') && new RegExp(`^${pf}$`, 'i').test(d)) {
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
      pms.push(hashFile(path.join(dir, f), rs, act));
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
 * @param {*} file 当前文件，含路径，含后缀，不含src 根路径
 */
function setUpdate(rs, file) {
  let R = null;

  if (!rs) return null;

  try {
    if (!rs.update) rs.update = {time: utils.logDate(), tick: Date.now()};

    let r = rs.update;
    r.js = r.js || [];
    r.html = r.html || [];
    r.css = r.css || [];
    r.less = r.less || [];
    r.asset = r.asset || [];

    // 'mall/page/login': './src/mall/page/login.js'
    switch (path.extname(file).toLowerCase()) {
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
      default:
        r = r.asset;
    }

    if (r) r.push(file);

    R = r;
  } catch (e) {
    console.log(`setUpdate exp:${e.message}`);
  }

  return R;
}

/**
 * 生成指定文件的 MD5值，写入rs.cur对象，用于判断文件是否变化
 * 变化文件，写入 rs.update
 * @param {*} file
 * @param {*} rs 写入的数据集
 */
function hashFile(file, rs, act) {
  return new Promise((res, rej) => {
    const r = fs.createReadStream(file);
    const md5 = crypto.createHash('md5');
    let hex = '';

    r.on('data', md5.update.bind(md5));
    r.on('end', () => {
      hex = md5.digest('hex');
      if (rs) {
        // 去掉项目根路径
        let f = file.replace(_src, '');
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

          default: {
            if (!rs.last) rs.last = {time: utils.logDate(), tick: Date.now()};
            rs.last[f] = hex;
            // 上次记录，优先比较 building，没有则 比较 build
            hs = rs.building || rs.build || rs.pubing || rs.pub || {};
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
 * @param {string} file
 */
function save(rs, file) {
  const yml = yaml.safeDump(rs);
  fs.writeFileSync(file, yml, err => {
    if (err) console.log(`save exp:${err.message}`);
  });
}

/**
 * 把last文件列表变成building文件列表
 * 编译成功，这部分文件列表变成 build
 * 不成功，则清除
 * @param {*} dir
 */
function building(dir) {
  let R = {};
  try {
    dir = dir || process.cwd(); // 默认指向运行目录
    const file = path.resolve(dir, './wiamap.yml');
    let r = {};
    if (fs.existsSync(file)) r = yaml.safeLoad(fs.readFileSync(file, 'utf8')); // eslint-disable-line
    if (r && r.last) {
      const {last, building: x, ...z} = r;
      const rs = {building: last, ...z};
      save(rs, file);

      R = rs.update;
    }
  } catch (e) {
    console.log(`building exp:${e.message}`);
  }

  return R;
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
    const file = path.resolve(dir, './wiamap.yml');
    let r = {};
    if (fs.existsSync(file)) r = yaml.safeLoad(fs.readFileSync(file, 'utf8')); // require(file); // eslint-disable-line
    if (r && r.building) {
      let rs = {};
      if (succ) {
        const {building: build, build: x, ...z} = r;
        rs = {build, ...z};
      } else {
        rs = r;
        rs.building && delete rs.building;
      }
      save(rs, file);

      R = rs.update;
    }
  } catch (e) {
    console.log(`builded exp:${e.message}`);
  }

  return R;
}

/**
 * Last变成正在发布的文件列表
 * @param {*} dir
 */
function pubing(dir) {
  let R = {};
  try {
    dir = dir || process.cwd(); // 默认指向运行目录
    const file = path.resolve(dir, './wiamap.yml');
    let r = {};
    if (fs.existsSync(file)) r = yaml.safeLoad(fs.readFileSync(file, 'utf8')); // require(file); // eslint-disable-line
    if (r && r.last) {
      const {last, pubing: x, ...z} = r;
      const rs = {pubing: last, ...z};
      save(rs, file);

      R = rs.update;
    }
  } catch (e) {
    console.log(`building exp:${e.message}`);
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
    const file = path.resolve(dir, './wiamap.yml');
    let r = {};
    if (fs.existsSync(file)) r = yaml.safeLoad(fs.readFileSync(file, 'utf8')); // require(file); // eslint-disable-line
    if (r && r.pubing) {
      let rs = {};
      if (succ) {
        const {pubing: pub, pub: x, ...z} = r;
        rs = {pub, ...z};
      } else {
        rs = r;
        rs.pubing && delete rs.pubing;
      }

      save(rs, file);
      R = rs.update;
    }
  } catch (e) {
    console.log(`builded exp:${e.message}`);
  }

  return R;
}

// wiamap(); // 单独调试用

module.exports = {map, building, builded, pubing, pubed};
