/**
 * 本地存储
 */

/**
 * 离线存储，缺省 30 天
 * @param {*} key
 * @param {*} val
 * @param {*} exp 过期时长，单位分钟，180天 x 24小时 x 60分 = 259200分
 */
function set(store, key, val, exp = 259200) {
  const v = {
    exp,
    time: Math.trunc(Date.now() / 1000), // 记录何时将值存入缓存，秒级
    val,
  };

  if (!key) return;

  store.setItem(key, JSON.stringify(v));
  // console.log({key, v}, 'set');
}

function get(store, key) {
  let R = '';

  if (!key) return '';

  let v = store.getItem(key);
  // console.log({key, v}, 'get');

  try {
    v = JSON.parse(v);
    if (v) {
      const time = Math.trunc(Date.now() / 1000); // 秒
      if (v.time && v.exp) {
        const dur = time - v.time;
        const exp = v.exp * 60;
        if (dur > exp) {
          store.removeItem(key);
          console.info(`store.remove(${key}) time:${v.time} dur:${dur} > exp:${exp}`);
        } else if (v.val) R = v.val;
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

function remove(store, key) {
  store.removeItem(key);
}

function clear(store) {
  store.clear();
}

function check(store) {
  for (let i = 0; i < store.length; i++) {
    get(store.key(i));
  }
}

export {set, get, remove, clear, check};
