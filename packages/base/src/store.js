/**
 * 本地离线存储
 */

/**
 * 离线存储，缺省 30 天
 * @param {*} key 
 * @param {*} val 
 * @param {*} exp 过期时长，单位分钟，30天 x 24小时 x 60分 = 43200分 
 */
function set(key, val, exp) {
  const v = {
    exp: exp || 43200,
    time: Math.trunc(Date.now() / 1000), // 记录何时将值存入缓存，秒级
    val
  };

  if (!key || !localStorage)
    return;


  localStorage.setItem(key, JSON.stringify(v));
}

function get(key) {
  let R = '';

  if (!key || !localStorage)
    return '';

  let v = localStorage.getItem(key);

  try {
    v = JSON.parse(v);
    if (v) {
      const time = Math.trunc(Date.now() / 1000); // 秒
      if (v.time && v.exp) {
        const dur = (time - v.time);
        if (dur > v.exp * 60) {
          localStorage.removeItem(key);
          console.info(`store.get(${key}) dur:${dur} > exp:${v.exp * 60}`);
        } else if (v.val)
          R = v.val;
      } else if (v.val) {
        console.error(`store.get(${key}) no time and exp`);
        R = v.val;
      }
    }
  } catch (e) {
    console.log(`store.get exp:${e.message}`);
  }

  return R;
}

function remove(key) {
  if (localStorage)
    localStorage.removeItem(key);
}

function clear() {
  if (localStorage)
    localStorage.clear();
}

function check() {
  if (localStorage) {
    for (let i = 0; i < localStorage.length; i++) {
      get(localStorage.key(i));
    }
  }
}

export {
  set, get, remove, clear, check
}
