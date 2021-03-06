/**
 * 输出方法到 $.fn，用户对 $(dom) 对象操作
 * 相关方法与用法与 zepto、jQuery兼容。
 */

import * as Methods from './fn';
import * as Scroll from './scroll';
import * as Animate from './animate';
import * as eventShortcuts from './event-shortcuts';
import * as Form from './form';

const $ = window.$;
[Methods, Scroll, Animate, Form, eventShortcuts].forEach((group) => {
  Object.keys(group).forEach((methodName) => {
    $.fn[methodName] = group[methodName];
  });
});

// export default $; // webpack中import，会导致default不存在访问错误！
export {$}; 
