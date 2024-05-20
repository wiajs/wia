/**
 * 本地离线存储
 */
import * as st from './storage';

const lst = localStorage;

/**
 * 离线存储，缺省 180 天
 * @param {*} key
 * @param {*} val
 * @param {*} exp 过期时长，单位分钟，180天 x 24小时 x 60分 = 259200分
 */
function set(key, val, exp) {
  exp = exp || 259200;
  st.set(lst, key, val);
}

function get(key) {
  return st.get(lst, key);
}

function remove(key) {
  st.remove(lst, key);
}

function clear() {
  st.clear(lst);
}

function check() {
  st.check(lst);
}

export {set, get, remove, clear, check};
