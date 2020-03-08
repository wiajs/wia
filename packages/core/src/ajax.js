/**
 * promise version ajax get、post
 * return Promise objext.
 * get move to base.js
 */

class Ajax {
  post(url, data) {
    const pm = new Promise((res, rej) => {
      const xhr = $.getXhr();
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) res(xhr.responseText);
          else rej(new Error(xhr.statusText), xhr.responseText);
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
      if (typeof data === 'object') param = objToParam(data);

      // 发送 FormData 数据, 会自动设置为 multipart/form-data
      xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      // xhr.setRequestHeader('Content-Type', 'multipart/form-data; boundary=AaB03x');
      // alert(param);
      xhr.send(param);
    });

    return pm;
  }

  /**
   * xmlHttpRequest POST 方法
   * 发送 FormData 数据, 会自动设置为 multipart/form-data
   * 其他数据,应该是 application/x-www-form-urlencoded
   * @param url post的url地址
   * @param data 要post的数据
   * @param cb 回调
   */
  postForm(url, data) {
    const pm = new Promise((res, rej) => {
      const xhr = $.getXhr();
      xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
          if (xhr.status === 200) res(null, xhr.responseText);
          else rej(new Error(xhr.status), xhr.responseText);
        }
      };

      // 异步 post,回调通知
      xhr.open('POST', url, true);
      // 发送 FormData 数据, 会自动设置为 multipart/form-data
      // xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      // xhr.setRequestHeader('Content-Type', 'multipart/form-data; boundary=AaB03x');
      xhr.send(data);
    });

    return pm;
  }

  get(url, param) {
    return $.get(url, param);
  }
}

function objToParam(obj) {
  let rs = '';

  const arr = [];
  for (const k in obj) {
    if (obj.hasOwnProperty(k)) {
      arr.push(`${k}=${obj[k]}`);
    }
    // rs += `${k}=${obj[k]}&`;
  }
  // 排序
  rs = arr.sort().join('&');
  // alert(rs);
  return rs;
}

export default Ajax;
