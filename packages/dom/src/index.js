/**
 * 输出方法到 $.fn，用户对 $(dom) 对象操作
 * 相关方法与用法与 zepto、jQuery兼容。
 */

import * as Methods from './fn';
import * as Scroll from './scroll';
import * as Animate from './animate';
import * as eventShortcuts from './event-shortcuts';

[Methods, Scroll, Animate, eventShortcuts].forEach((group) => {
  Object.keys(group).forEach((methodName) => {
    $.fn[methodName] = group[methodName];
  });
});

export default $;
