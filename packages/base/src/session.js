/**
 * 本地离线存储
 */

import * as st from './storage';

/**
 * pc 使用 sessionStorage，其他使用 localStorage
 * @returns
 */
function getStore() {
  return $.device.desktop ? sessionStorage : localStorage;
}

/**
 * 离线存储，手机缺省 30 天，pc 1天
 * @param {*} key
 * @param {*} val
 * @param {*} exp 过期时长，单位分钟，30天 x 24小时 x 60分 = 43200分
 */
function set(key, val) {
  const exp = $.device.desktop ? 1440 : 43200;
  st.set(getStore(), key, val, exp);
}

function get(key) {
  return st.get(getStore(), key);
}

function remove(key) {
  st.remove(getStore(), key);
}

function clear() {
  st.clear(getStore());
}

function check() {
  st.check(getStore());
}

export {set, get, remove, clear, check};
