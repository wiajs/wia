/**
 * wia app基础文件，每个微应用均需在index.html中引用该文件，
 * 该文件创建了全局变量$，并挂在window对象之下，全局可用。
 * 需注意，jQuery、zepto等工具库也是要了$，所以wia微应用不能使用jQuery和zepto!!!
 * 由于wia app动态加载模块的，因此基础文件主要用于模块管理
 * 为方便操作，将模块管理挂在全局$之下，因此引入了全局变量$。
 * $之前主要为替代zepto、jQuery的dom操作引入的，因此基础文件也引入了几个简单的dom操作，
 * 更多类似jQuery操作需引用dom.js库。
 * 相关方法与用法与 zepto、jQuery兼容。
 */
import $ from './$';
import * as Event from './event';
import * as Store from './store';
import * as Ajax from './ajax';
import * as Module from './module';

// export $ to window globle
window.$ === undefined && (window.$ = $);

// 将 event 模块中的事件方法加载到 $
Object.keys(Event).forEach(k => {
  $[k] = Event[k];
});

// 将 ajax 模块中的异步方法加载到 $
Object.keys(Ajax).forEach(k => {
  $[k] = Ajax[k];
});

// 将 store 模块中的方法加载到 $.store
$.store = {};
Object.keys(Store).forEach(k => {
  $.store[k] = Store[k];
});

// 将 module 模块中的方法加载到 $.M
$.M = {};
Object.keys(Module).forEach(k => {
  $.M[k] = Module[k];
});

export default $;