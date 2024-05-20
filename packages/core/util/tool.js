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
  const str = String(f).replace(/%[sdjo%]/g, x => {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s':
        return String(args[i++]);
      case '%d':
        return Number(args[i++]);
      case '%j':
      case '%o':
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
 * 比较方法，用于对象数组排序，常用于数据表排序
 * @param {*} k 对象属性key
 * @param {*} asc 升序、降序，默认升序
 * @param {*} type 类型auto, number、datetime、string，缺省 auto
 */
function compareObj(k, desc, type) {
  return function (o1, o2) {
		let R = 0;
		try {
			let v1 = o1[k];
			let v2 = o2[k];
			// 数字、日期字符串，按数字、日期排序
			if ($.isStr(v1) || $.isStr(v2)) {
				// 金额可能有千字分隔符，需替换
				if (type.toLowerCase() === 'number') {
					v1 = v1.replaceAll(',', '');
					v2 = v2.replaceAll(',', '');
				}

				if ($.isDateStr(v1) && $.isDateStr(v2)) {
					v1 = Date.parse(v1);
					v2 = Date.parse(v2);
				} else if ($.isNumStr(v1) && $.isNumStr(v2)) {
					v1 = Number(v1);
					v2 = Number(v2);
				}
			}

			if (v1 < v2) {
				R = desc ? 1 : -1;
			} else if (v1 > v2) {
				R = desc ? -1 : 1;
			}
		} catch(ex) {
			console.log('compareObj exp:', ex.message);
		}
    return R;
  };
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
  trimStart,
  trimEnd,
  addDay,
  newFileName,
  compareObj,
  sortObj,
  serObj,
  setTitle,
};
