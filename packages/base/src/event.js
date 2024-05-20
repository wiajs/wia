/**
 * 基于 $的event 事件模块
 * 与 dom、Core/Event 中的事件不同
 * dom 事件用于 浏览器 内置或自定义事件控制，全局范围
 * Core/Event 类 用于组件事件控制，局部范围
 * 由于整个App有效，因此要求事件名称为 “模块名:函数名:事件名”，避免冲突。
 * 比如在 lazy模块中，通过 $.emit('lazy:src:before', node) 发射事件，
 * 引用该类代码，通过 $.on('lazy:src:before', fn) 获得事件触发回调。
 * 事件的每个回调函数，只能登记一次，事件触发时，函数被调用一次。
 * 避免一个函数多次重复登记，被多次调用。
 * 一个事件，可登记多个不同的函数，每个函数都会被调用。
 *
 * Released on: August 28, 2016
 *
 */

// 一个包中所有引用共享该变量!
const events = {};

/**
 * 响应事件函数登记，一个函数，在同一事件下只能登记一次，避免同一事件多次触发相同函数，被误判为多次事件
 * 事件触发时，调用一次
 * @param {*} event
 * @param {*} fn
 */
function on(event, fn) {
  events[event] = events[event] || [];
  if (!events[event].includes(fn)) events[event].push(fn);
  return this;
}

/**
 * 只触发一次，触发后删除登记的回调函数
 * 由于需标识执行一次的函数，不对原fn做任何修改，
 * 因此需包装一个新的回调函数，将原函数作为包装函数变量。
 * @param {*} event
 * @param {*} fn
 */
function once(event, fn) {
  const self = this;
  function oncefn(...args) {
    $.off(event, fn);
    if (oncefn.proxy) {
      delete oncefn.proxy;
    }
    fn.apply(self, args);
  }
  oncefn.proxy = fn;

  $.on(event, oncefn);
  return this;
}

/**
 * 删除事件
 * @param event
 * @param handler 缺少删除该事件, 指定处理函数,则只删除指定处理函数
 * @returns {off}
 */
function off(event, fn) {
  if (fn) {
    // 删除所有该函数的事件登记
    events[event].forEach((v, k) => {
      if (v === fn || (v.proxy && v.proxy === fn)) {
        events[event].splice(k, 1);
      }
    });
  } else delete events[event]; // 删除所有该事件回调函数

  return this;
}

/**
 * 发射事件
 * @param event
 * @param args
 * @returns {emit}
 */
function emit(event, ...args) {
  // cache the events, to avoid consequences of mutation
  const cache = events[event] && events[event].slice();

  // only fire handlers if they exist
  if (cache) {
    cache.forEach(fn => {
      // set 'this' context, pass args to handlers
      fn.apply(this, args);
    });
  }

  return this;
}

export {on, off, once, emit};
