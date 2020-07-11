/**
 * 创建xmlHttpRequest,返回xmlHttpRequest实例,根据不同的浏览器做兼容
*/
function getXhr() {
  let rs = null;

  if (window.XMLHttpRequest) rs = new XMLHttpRequest();
  else if (window.ActiveXObject) rs = new ActiveXObject('Microsoft.XMLHTTP');

  return rs;
}

const parseError = xhr => {
  let msg = '';
  const {responseText: rs, responseType, status, statusText} = xhr;
  if (rs && responseType === 'text' && /^\s*[{[]/.test(rs)) {
    try {
      msg = JSON.parse(rs);
    } catch (error) {
      msg = rs;
    }
  } else {
    msg = `${status} ${statusText}`;
  }

  const err = new Error(msg);
  err.status = status;
  return err;
};

const parseSuccess = rs => {
  if (rs && /^\s*[{[]/.test(rs)) {
    try {
      return JSON.parse(rs);
    } catch (ex) {
      console.log('parseSuccess', {exp: ex.message});
    }
  }

  return rs;
};

/**
 * xmlHttpRequest GET 方法
 * @param url get的URL地址
 * @param data 要get的数据
 * return Promise
 */
function get(url, param, header) {
  const pm = new Promise((res, rej) => {
    const xhr = getXhr();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const rs = parseSuccess(xhr.responseText);
          res(rs);
        } else rej(parseError(xhr));
      }
    };
    xhr.onerror = e => {
      rej(parseError(xhr));
    };

    if (param) {
      if (typeof patam === 'object')
        param = Object.keys(param)
          .map(k => `${k}=${data[k]}`)
          .sort()
          .join('&');
      
      xhr.open('GET', `${url}?${param}`, true);
    } else xhr.open('GET', url, true);

    // xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    // xhr.setRequestHeader('Accept-Encoding', 'gzip');
    if (header)
      Object.keys(header).forEach(key => {
        xhr.setRequestHeader(key, header[key]);
      });

    xhr.send(null);
  });

  return pm;
}

/**
 * post 方式提交数据
 * @param {*} url
 * @param {*} data Object、FormData 或 String
 * @param {*} header 自定义头
 */
function post(url, data, header) {
  const pm = new Promise((res, rej) => {
    const xhr = getXhr();
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          const rs = parseSuccess(xhr.responseText);
          res(rs);
        } else rej(parseError(xhr));
          }
    };

    xhr.onerror = e => {
      rej(parseError(xhr));
    };

    // 异步 post,回调通知
    xhr.open('POST', url, true);
    let param = data;

    if (data && data instanceof FormData) {
    // 发送 FormData 数据, 会自动设置为 multipart/form-data
    // xhr.setRequestHeader('Content-Type', 'multipart/form-data; boundary=AaB03x');
    } else if (data && typeof data === 'object') {
      // param = Object.keys(data).map(k => `${k}=${data[k]}`).sort().join('&');
      param = JSON.stringify(data);
      xhr.setRequestHeader('Content-type', 'application/json; charset=utf-8');
    } else
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

    // alert(param);
    if (header)
      Object.keys(header).forEach(key => {
        xhr.setRequestHeader(key, header[key]);
      });

    xhr.send(param);
  });

  return pm;
}

export {get, post};
