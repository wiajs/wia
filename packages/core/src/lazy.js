/**
 * Released on: August 28, 2016
 * 图片延迟加载
 * 使用方法：
 * import {Lazy from '@wiajs/core';
 * const _lazy = new Lazy();
 * _lazy.start(dv); // 注意，这个dv是滚动的层，错了无法触发加载，sui 就是内容层！
 * setTimeout(() => {loadView()}, 1);  // krouter 里面已经做了处理，bind 时直接 加载视图即可！
 * loadView 加载视图中（每次页面更新内容后，需调用）
 * _lazy.update(); // 没有显示的图片，加入 待加载数组，并检查是否可视，可视则加载！
 */

// options
const _opts = {
  normal: 'nor', // 'data-normal' 普通图片
  retina: 'ret', // 'data-retina',
  srcset: 'set', // 'data-srcset', 浏览器根据宽、高和像素密度来加载相应的图片资源
  threshold: 0,
};

let _opt;
let _ticking;
let _nodes;
let _windowHeight = window.innerHeight;
let _root;

// private
let _prevLoc = getLoc();

// feature detection
// https://github.com/Modernizr/Modernizr/blob/master/feature-detects/img/srcset.js
const _srcset =
  document.body.classList.contains('srcset') ||
  'srcset' in document.createElement('img');

// 设备分辨率
// not supported in IE10 - https://msdn.microsoft.com/en-us/library/dn265030(v=vs.85).aspx
const _dpr =
  window.devicePixelRatio ||
  window.screen.deviceXDPI / window.screen.logicalXDPI;

/**
 * 输外部可调用的类
 * 类外面的变量、函数作为模块内部私有属性、方法，外部无法调用
 * 如果全部放入类中，属性、函数相互调用，都需要 this，非常麻烦！
 * 也可以直接使用 export default (options = {}) => {} 输出一个函数！
 * 函数内部反而不需要this，比较方便。
 */
export default class Lazy {
  // 实例属性
  constructor(opt) {
    _opt = $.assign({}, _opts, opt);
  }

  // API

  //----------------------------------------
  // dom 就绪后 start，dom 更新后，需 update
  /**
   * 启动延迟加载, 加载事件, dom ready时调用!
   * @param root 根对象, scroll的目标对象，错了无法触发scroll 事件！
   * @returns {init}
   */
  start(root) {
    // sui window scroll event invalid!!!
    // ['scroll', 'resize'].forEach(event => window[action](event, requestScroll));
    ['scroll', 'resize'].forEach(event =>
      root['addEventListener'](event, requestScroll)
    );
    _root = root;
    return this;
  }

  /**
   * 停止延迟加载,卸载事件!
   * @param root 根对象, scroll的目标对象
   * @returns {init}
   */
  stop() {
    // sui window scroll event invalid!!!
    // ['scroll', 'resize'].forEach(event => window[action](event, requestScroll));
    ['scroll', 'resize'].forEach(event =>
      _root['removeEventListener'](event, requestScroll)
    );
    return this;
  }

  update() {
    setTimeout(() => {
      update();
      check();
    }, 1);
  }
}

/**
 * Y 坐标，好像一直是 0
 */
function getLoc() {
  // console.log(`window.scrollY:${window.scrollY} window.pageYOffset:${window.pageYOffset}`);
  return window.scrollY || window.pageYOffset;
}

// debounce helpers
function requestScroll() {
  _prevLoc = getLoc();
  requestFrame();
}

function requestFrame() {
  if (!_ticking) {
    window.requestAnimationFrame(() => check());
    _ticking = true;
  }
}

// offset helper
/**
 * 节点相对视口的坐标，对于动态加载的，好像得到都是0，使用定时器延迟加载就能正确获取！
 */
function getOffset(node) {
  // 元素四个位置的相对于视口的坐标
  return node.getBoundingClientRect().top + _prevLoc;
  // return node.offsetTop + _prevLoc;
}

/**
 * 节点是否在可视窗口判断
 * 通过可视窗口顶部、底部坐标来判断
 * 顶部坐标就是页面的滚动条滚动的距离
 * 底部坐标就是滚动条的距离加上当前可视窗口的高度
 * dom元素中心：元素到最顶端的高度加上自身高度的一半
 * @param {*} node
 */
function inViewport(node) {
  const viewTop = _prevLoc; // 视口顶部坐标
  const viewBot = viewTop + _windowHeight; // 视口底部坐标
  // console.log(`viewTop:${viewTop} viewBot:${viewBot}`);

  // 节点坐标
  const nodeTop = getOffset(node);
  const nodeBot = nodeTop + node.offsetHeight;
  // console.log(`nodeTop:${nodeTop} nodeBot:${nodeBot}`);

  const offset = (_opt.threshold / 100) * _windowHeight;
  // 节点在可视范围内
  const rc = nodeBot >= viewTop - offset && nodeTop <= viewBot + offset;
  // if (rc)
  //   console.log(`nodeBot:${nodeBot} >= view:${viewTop - offset} nodeTop:${nodeTop} <= view:${viewBot + offset}`);

  return rc;
}

// source helper
function setSource(node) {
  $.emit('lazy:src:before', node);

  // prefer srcset, fallback to pixel density
  if (_srcset && node.hasAttribute(_opt.srcset)) {
    node.setAttribute('srcset', node.getAttribute(_opt.srcset));
  } else {
    const retina = _dpr > 1 && node.getAttribute(_opt.retina);
    const src = retina || node.getAttribute(_opt.normal);
    node.setAttribute('src', src);
    console.log(`set src:${src}`);
  }

  $.emit('lazy:src:after', node);
  // 删除懒加载属性，避免重复加载
  [_opt.normal, _opt.retina, _opt.srcset].forEach(attr =>
    node.removeAttribute(attr)
  );
  update();
}

/**
 * 检查是否可视,如果可视则更改图片src，加载图片
 * @returns {check}
 */
function check() {
  if (!_nodes) return;

  _windowHeight = window.innerHeight;
  _nodes.forEach(node => inViewport(node) && setSource(node));
  _ticking = false;
  return this;
}

/**
 * 新的图片加入dom，需重新获取属性为nor的图片节点，
 * @returns {update}
 */
function update(root) {
  if (root)
    _nodes = Array.prototype.slice.call(
      root.querySelectorAll(`[${_opt.normal}]`)
    );
  else
    _nodes = Array.prototype.slice.call(
      document.querySelectorAll(`[${_opt.normal}]`)
    );
  return this;
}
