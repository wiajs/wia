class StringBuf {
  constructor() {
    this.buf = [];
  }

  append(str, ...args) {
    if (args.length > 0) this.buf.push(format(str, ...args));
    // 参数传递
    else this.buf.push(String(str));
  }

  insert(str, ...args) {
    if (args.length > 0) this.buf.unshift(format(str, ...args));
    // 参数传递
    else this.buf.unshift(String(str));
  }

  pop() {
    this.buf.pop();
  }

  toString() {
    return this.buf.join('');
  }
}

/**
 * 格式化字符串，类似 node util中带的 format
 * @type {Function}
 */
function format(f, ...args) {
  let i = 0;
  const len = args.length;
  const str = String(f).replace(/%[sdj%]/g, x => {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s':
        return String(args[i++]);
      case '%d':
        return Number(args[i++]);
      case '%j':
        return JSON.stringify(args[i++]);
      default:
        return x;
    }
  });

  return str;
}

/**
 * 去除字符串头部空格或指定字符
 */
function trimStart(s, c) {
  if (!c) return String(s).replace(/(^\s*)/g, '');

  const rx = new RegExp(format('^%s*', c));
  return String(s).replace(rx, '');
}

/**
 * 去除字符串尾部空格或指定字符
 */
function trimEnd(s, c) {
  if (!s) return '';

  if (!c) return String(s).replace(/(\s*$)/g, '');

  const rx = new RegExp(format('%s*$', c));
  return String(s).replace(rx, '');
}

/**
 * 格式化日期
 * js 时间转换为指定字符串格式
 * 由于字符串转换为Date时，会按时区加减时间，保存到 js 内的 Date对象，都是标准时间。
 * 标准时间转换为字符串时，js 内置函数会根据当前时区还原时间
 * 数据库统一按标准时间保存，格式为 yyyy/MM/dd
 * dates('yyyy-MM-dd hh:mm:ss')
 * dates('yyyy-MM-dd hh:mm:ss.S')
 * dates('yyyyMMddhhmmssS')
 * dates('yy-M-d')
 * @param {string} fmt 缺省yyyy-MM-dd
 * @param {string|object} 标准时间，d 缺省new Date()
 * @returns {string}
 */
function dates(fmt, d) {
  if (!fmt) fmt = 'yyyy-MM-dd';

  if (!d) d = new Date();
  else if (typeof d === 'string') {
    // 兼容
    d = d
      .replace(/\-/g, '/')
      .replace(/T/g, ' ')
      .replace(/\.+[0-9]+[A-Z]$/, '');
    // 还原时区，内部保存为标准时间
    d = new Date(d).getTime() - 3600000 * (new Date().getTimezoneOffset() / 60);
    d = new Date(d);
  }

  // Date.getXXX 函数会自动还原时区！！！
  const o = {
    y: d.getFullYear().toString(),
    M: d.getMonth() + 1, // 月份
    d: d.getDate(), // 日
    h: d.getHours(), // 小时
    m: d.getMinutes(), // 分
    s: d.getSeconds(), // 秒
    q: Math.floor((d.getMonth() + 3) / 3), // 季度
    S: d.getMilliseconds().toString().padStart(3, '0'), // 毫秒
  };

  // yy几个就返回 几个数字，使用 slice -4 倒数4个，再往后
  fmt = fmt.replace(/(S+)/g, o.S).replace(/(y+)/gi, v => o.y.slice(-v.length));
  fmt = fmt.replace(/(M+|d+|h+|m+|s+|q+)/g, v =>
    ((v.length > 1 ? '0' : '') + o[v.slice(-1)]).slice(-2)
  );

  return trimEnd(fmt, ' 00:00:00');
}

function addDay(n, d) {
  if (!d) d = new Date();
  else if (typeof d === 'string') {
    // 兼容
    d = d
      .replace(/\-/g, '/')
      .replace(/T/g, ' ')
      .replace(/\.+[0-9]+[A-Z]$/, '');
    // 还原时区，内部保存为标准时间
    d = new Date(d).getTime() - 3600000 * (new Date().getTimezoneOffset() / 60);
    d = new Date(d);
  }

  return new Date(d.getTime() + n * 36000000);
}

/**
 * 修改微信 title
 */
function setTitle(val) {
  setTimeout(() => {
    // 利用iframe的onload事件刷新页面
    document.title = val;

    const fr = document.createElement('iframe');
    // fr.style.visibility = 'hidden';
    fr.style.display = 'none';
    // fr.src = 'https://cos.nuoya.io/mall/favicon.ico';
    fr.onload = () => {
      setTimeout(() => {
        document.body.removeChild(fr);
      }, 0);
    };
    document.body.appendChild(fr);
  }, 0);
}

/**
 * 随机生成文件名称，能保存，并能作为 url字符串，主要用于上传图片随机生成文件名称
 * @param {int} len
 */
function newFileName(len) {
  const R = [];
  len = len || 32;
  // 键盘上的所有可见字符
  // 不包含 *?:/\<>|
  const str =
    // 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_~()';
    '123456789-_~()!';
  const size = str.length;
  for (let i = 0; i < len; i++) {
    R.push(str.charAt(Math.floor(Math.random() * size)));
  }
  return R.join('');
}

/**
 * 对象按名称排序，签名时需要
 * @param {*} obj
 * @param {*} fn
 */
function sortObj(obj) {
  const res = {};

  Object.keys(obj)
    .sort()
    .forEach(k => {
      res[k] = obj[k];
    });

  return res;
}

/**
 * 对象转为字符串，ajax调用时会用到
 * @param {*} obj
 */
function serObj(obj) {
  return Object.keys(obj)
    .map(k => `${k}=${obj[k]}`)
    .join('&');
}

export {
  StringBuf,
  format,
  trimEnd,
  trimStart,
  dates,
  dates as fmtDate,
  addDay,
  newFileName,
  sortObj,
  serObj,
  setTitle,
};
