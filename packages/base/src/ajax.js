/**
 创建xmlHttpRequest,返回xmlHttpRequest实例,根据不同的浏览器做兼容
*/
function getXhr() {
  let rs = null;

  if (window.XMLHttpRequest)
    rs = new XMLHttpRequest();
  else if (window.ActiveXObject)
    rs = new ActiveXObject('Microsoft.XMLHTTP');

  return rs;
}

/**
 * xmlHttpRequest GET 方法
 * @param url get的URL地址
 * @param data 要get的数据
 * return Promise
 */
function get(url, param) {
  const pm = new Promise(function(res, rej) {
    const xhr = getXhr();
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200)
          res(xhr.responseText);
        else
          rej(new Error(xhr.statusText));
      }
    };

    if (param) {
			if ((typeof patam) === 'object')
				param = Object.keys(param).map(k => `${k}=${data[k]}`).sort().join('&');
      
      xhr.open('GET', url + '?' + param, true);
    } else
      xhr.open('GET', url, true);

    // xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    // xhr.setRequestHeader('Accept-Encoding', 'gzip');
    xhr.send(null);
  });

  return pm;
}

function post(url, data) {
  const pm = new Promise((res, rej) => {
    const xhr = getXhr();
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        if (xhr.status === 200)
          res(xhr.responseText);
        else
          rej(new Error(xhr.statusText), xhr.responseText);
      }
      /*
          if ((xhr.readyState === 4) && (xhr.status === 200)) {
            cb(xhr.responseText);
          }
      */
    };

    // 异步 post,回调通知
    xhr.open('POST', url, true);
    let param = data;
    if ((typeof data) === 'object')
      param = Object.keys(data).map(k => `${k}=${data[k]}`).sort().join('&');

    // 发送 FormData 数据, 会自动设置为 multipart/form-data
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    // xhr.setRequestHeader('Content-Type', 'multipart/form-data; boundary=AaB03x');
    // alert(param);
    xhr.send(param);
  });

  return pm;
}

export {get, post}
