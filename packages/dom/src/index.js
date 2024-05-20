/**
 * 输出方法到 $.fn，用户对 $(dom) 对象操作
 * 相关方法与用法与 zepto、jQuery兼容。
 * 替代zepto、jQuery，不可同时使用zepto、jQuery
 */

/* eslint-disable */

import * as Methods from './fn'
import * as Scroll from './scroll'
import * as Animate from './animate'
import * as View from './view'

// 获取当前全局$变量，$.fn 上增加操作函数！
const $ = window.$ ?? {}
;[Methods, Scroll, Animate, View].forEach(group => {
  // , eventShortcuts
  Object.keys(group).forEach(methodName => {
    $.fn[methodName] = group[methodName]
  })
})

$.getTranslate = (el, axis) => Animate.getTranslate.bind(el)(axis)

// shortcut methods for `.on(event, fn)` for each event type
const noTrigger = 'resize scroll'.split(' ')
;(
  'load,unload,dblclick,select,error,click,blur,focus,focusin,' +
  'focusout,keyup,keydown,keypress,submit,change,mousedown,mousemove,mouseup,' +
  'mouseenter,mouseleave,mouseout,mouseover,touchstart,touchend,touchmove,resize,' +
  'scroll,swipe,press'
)
  .split(',')
  .forEach(function (event) {
    $.fn[event] = function (...args) {
      if (typeof args[0] === 'undefined') {
        for (let i = 0; i < this.length; i += 1) {
          try {
            if (noTrigger.indexOf(event) < 0) {
              if (event in this[i]) this[i][event]()
              else {
                $(this[i]).trigger(event)
              }
            }
          } catch (ex) {}
        }
        return this
      }
      return this.on(event, ...args)
    }
  })

function traverseNode(node, fun) {
  fun(node)
  for (var i = 0, len = node.childNodes.length; i < len; i++) traverseNode(node.childNodes[i], fun)
}

// Generate the `after`, `prepend`, `before`, `append`,
// `insertAfter`, `insertBefore`, `appendTo`, and `prependTo` methods.
const operators = ['after', 'prepend', 'before', 'append']
operators.forEach(function (op, idx) {
  var inside = idx % 2 //=> prepend, append
  $.fn[op] = function () {
    // arguments can be nodes, arrays of nodes, Zepto objects and HTML strings
    let argType
    // map 每个参数，支持添加多个节点
    const nodes = $.map(arguments, function (arg) {
      var arr = []
      argType = $.type(arg)
      if (argType == 'array') {
        arg.forEach(function (el) {
          if (el.nodeType !== undefined) return arr.push(el)
          else if ($.isDom(el)) return (arr = arr.concat(el.get()))
          arr = arr.concat($.fragment(el))
        })
        return arr
      }
      return argType == 'object' || arg == null ? arg : $.fragment(arg)
    })

    if (nodes.length < 1) return this

    let parent
    // 多目标节点增加新节点时，需克隆，否则只有最后一个目标节点增加了新节点
    let copyByClone = this.length > 1

    // 针对每个节点进行节点添加操作
    return this.each(function (_, target) {
      parent = inside ? target : target.parentNode

      // convert all methods to a "before" operation
      target =
        idx == 0
          ? target.nextSibling // after
          : idx == 1
          ? target.firstChild // prepend
          : idx == 2
          ? target // before
          : null // append

      var parentInDoc = $.contains(document.documentElement, parent)

      nodes.forEach(function (node) {
        if (copyByClone) node = node.cloneNode(true)
        else if (!parent) return $(node).remove()

        parent.insertBefore(node, target)

        // 防止空链接，刷新页面
        const ns = $.qus('a[href=""]', parent)
        if (ns && ns.length > 0) ns.forEach(n => n.setAttribute('href', 'javascript:;'))

        if (parentInDoc)
          // 执行 节点中包含的脚本代码
          traverseNode(node, function (el) {
            if (
              el.nodeName != null &&
              el.nodeName.toUpperCase() === 'SCRIPT' &&
              (!el.type || el.type === 'text/javascript') &&
              !el.src
            ) {
              var target = el.ownerDocument ? el.ownerDocument.defaultView : window
              target['eval'].call(target, el.innerHTML)
            }
          })
      })
    })
  }

  // 参数调换，参数作为目标节点，this作为新增节点
  // after    => insertAfter
  // prepend  => prependTo
  // before   => insertBefore
  // append   => appendTo
  const op2 = inside ? op + 'To' : 'insert' + (idx ? 'Before' : 'After')
  $.fn[op2] = function (html) {
    $(html)[op](this)
    return this
  }
})

$.default = $
export default $ // webpack中import，会导致default不存在访问错误！
// export {$};
