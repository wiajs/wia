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

export {StringBuf, format, newFileName, sortObj, serObj};
