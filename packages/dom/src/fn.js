/*
 * Expand $.fn
 * 扩展 $.fn
 * same syntax as well known jQuery library
 */

const emptyArray = []
const elementDisplay = {}
const rootNodeRE = /^(?:body|html)$/i
const propMap = {
  tabindex: 'tabIndex',
  readonly: 'readOnly',
  for: 'htmlFor',
  class: 'className',
  maxlength: 'maxLength',
  cellspacing: 'cellSpacing',
  cellpadding: 'cellPadding',
  rowspan: 'rowSpan',
  colspan: 'colSpan',
  usemap: 'useMap',
  frameborder: 'frameBorder',
  contenteditable: 'contentEditable',
}

// Because a collection acts like an array
// copy over these useful array functions.
const {reduce, push, sort, splice} = emptyArray

// 返回数组
function concat(...arg) {
  const args = []
  for (let i = 0; i < arg.length; i++) {
    const v = arg[i]
    args[i] = $.isDom(v) ? v.toArray() : v
  }
  return emptyArray.concat.apply($.isDom(this) ? this.toArray() : this, args)
}

function ready(cb) {
  if (/complete|loaded|interactive/.test(document.readyState) && document.body) cb($)
  else
    document.addEventListener(
      'DOMContentLoaded',
      function () {
        cb($)
      },
      false
    )
  return this
}

// 转为节点数组，或指定索引节点
function get(idx) {
  return idx === undefined ? emptyArray.slice.call(this) : this[idx >= 0 ? idx : idx + this.length]
}

function toArray() {
  return this.get()
}

function size() {
  return this.length
}

/**
 * 删除或设置dom属性
 * @param {*} node
 * @param {*} n attr name
 * @param {*} value null or undefined
 */
function setAttr(node, n, value) {
  if (node && node.nodeType === 1) {
    if (value == null) node.removeAttribute(n)
    else node.setAttribute(n, value)
  }
}

function attr(n, value) {
  let R
  const el = this[0]

  if (!el) return

  // Get attr
  if (arguments.length === 1 && typeof n === 'string') {
    if (el.nodeType === 1 && el) R = el.getAttribute(n)
  } else {
    // Set attr
    R = this.each(function (idx) {
      if ($.isObject(n)) {
        Object.keys(n).forEach(k => {
          this[k] = n[k] // f7
          setAttr(this, k, n[k])
        })
      } else setAttr(this, n, $.funcArg(this, value, idx, this.getAttribute(n)))
    })
  }

  return R
}

function removeAttr(n) {
  return this.each(function () {
    this.nodeType === 1 &&
      n.split(' ').forEach(function (v) {
        setAttr(this, v)
      }, this)
  })
}

function hasAttr(n) {
  return emptyArray.some.call(this, function (el) {
    return el.hasAttribute(n)
  })
}

function prop(n, value) {
  try {
    n = propMap[n] || n
    // Get prop
    if (arguments.length === 1 && typeof n === 'string') this[0] && this[0][n]
    else {
      // Set props
      return this.each(function (idx) {
        if (arguments.length === 2) this[n] = $.funcArg(this, value, idx, this[n])
        else if ($.isObject(n)) {
          // eslint-disable-next-line
          for (const prop in n) {
            this[prop] = n[prop]
          }
        }
      })
    }
  } catch (ex) {
    console.log('prop exp:', ex.message)
  }
}

function removeProp(n) {
  n = propMap[n] || n
  return this.each(function () {
    delete this[n]
  })
}

// 读取或设置 data-* 属性值，保持与jQuery 兼容
// 在dom节点上自定义 domElementDataStorage 对象存储数据
function data(key, value) {
  let R
  let el
  const attrName = 'data-' + key.replace(/([A-Z])/g, '-$1').toLowerCase()

  if (typeof value === 'undefined') {
    el = this[0]
    // Get value
    if (el) {
      if (el.domElementDataStorage && key in el.domElementDataStorage) {
        R = el.domElementDataStorage[key]
      } else R = this.attr(attrName)
    }
    if (R) R = $.deserializeValue(R)
  } else {
    // Set value
    for (let i = 0; i < this.length; i += 1) {
      el = this[i]
      if (!el.domElementDataStorage) el.domElementDataStorage = {}
      el.domElementDataStorage[key] = value
      this.attr(attrName, value)
    }
    R = this
  }

  return R
}

function removeData(key) {
  const attrName = 'data-' + key.replace(/([A-Z])/g, '-$1').toLowerCase()

  for (let i = 0; i < this.length; i += 1) {
    const el = this[i]
    if (el.domElementDataStorage && el.domElementDataStorage[key]) {
      el.domElementDataStorage[key] = null
      delete el.domElementDataStorage[key]
    }
    el.removeAttribute(attrName)
  }

  return this
}

function dataset() {
  const el = this[0]
  if (!el) return undefined

  const dataset = {} // eslint-disable-line
  if (el.dataset) {
    // eslint-disable-next-line
    for (const dataKey in el.dataset) {
      dataset[dataKey] = el.dataset[dataKey]
    }
  } else {
    for (let i = 0; i < el.attributes.length; i += 1) {
      // eslint-disable-next-line
      const attr = el.attributes[i]
      if (attr.name.indexOf('data-') >= 0) {
        dataset[$.camelCase(attr.name.split('data-')[1])] = attr.value
      }
    }
  }

  // eslint-disable-next-line
  for (const key in dataset) dataset[key] = $.deserializeValue(dataset[key])

  return dataset
}

/**
 * 表单节点值的获取、设置
 * 获取时，只获取第一个dom对象value
 * 设置时，对节点数组同时设置
 * 支持 select单选、多选，checkbox，radio
 * @param {*} value 值
 * value 为Dom对象时，表示节点容器，带容器参数时，支持容器内radio、checkbox有效值获取
 * @param {*} el 节点容器，带容器参数时，支持容器内radio、checkbox赋值
 * @returns
 */
function val(value, el) {
  let R
  // 设置值
  if (0 in arguments && !$.isDom(value)) {
    if (value == null) value = ''
    return this.each(function (idx) {
      let vs = $.funcArg(this, value, idx, this.value)
      const dom = this

      // 注意，节点value是字符串！
      // select 多选，单选直接赋值即可
      if (dom.multiple && dom.nodeName.toLowerCase() === 'select') {
        if (Array.isArray(vs)) vs = vs.map(v => v.toString())
        else vs = [vs.toString()]
        dom.options.forEach(o => (o.selected = vs.includes(o.value)))
      } else if (dom.type === 'checkbox' && el) {
        if (Array.isArray(vs)) vs = vs.map(v => v.toString())
        else vs = [vs.toString()]

        const name = $(dom).attr('name')
        const ns = $(`input[name=${name}]`, el)
        ns.forEach(n => (n.checked = vs.includes(n.value)))
      } else if (dom.type === 'radio' && el) {
        if (Array.isArray(vs)) vs = vs[0]

        const name = $(dom).attr('name')
        const ns = $(`input[name=${name}]`, el)
        ns.forEach(n => {
          n.checked = n.value === vs.toString()
        })
      } else dom.value = vs.toString()
    })
  } else if (this[0]) {
    // 获取值
    const dom = this[0]
    R = dom.value
    // 多选
    if (dom.multiple && dom.nodeName.toLowerCase() === 'select')
      R = $(dom)
        .find('option')
        .filter(function () {
          return this.selected
        })
        .pluck('value')
    else if (dom.type === 'checkbox' && $.isDom(value)) {
      const el = value
      const name = this.attr('name')
      const ns = $(`input[name=${name}]:checked`, el)
      R = ns.pluck('value')
    } else if (dom.type === 'radio' && $.isDom(value)) {
      const el = value
      const name = this.attr('name')
      const n = $(`input[name=${name}]:checked`, el)
      if (n && n.length) R = n[0].value
    }
  }

  return R
}

// Transforms
// eslint-disable-next-line
function transform(transform) {
  for (let i = 0; i < this.length; i += 1) {
    const elStyle = this[i].style
    elStyle.webkitTransform = transform
    elStyle.transform = transform
  }
  return this
}
function transition(duration) {
  if (typeof duration !== 'string') {
    duration = `${duration}ms` // eslint-disable-line
  }
  for (let i = 0; i < this.length; i += 1) {
    const elStyle = this[i].style
    elStyle.webkitTransitionDuration = duration
    elStyle.transitionDuration = duration
  }
  return this
}

/**
 * 事件侦听
 * 匿名/有名函数 统统封装为有名函数，存储在当前元素属性中，方便off
 * 第一个参数为event，
 * 第二个参数为this，解决类事件函数this绑定到对象无法获得事件this问题。
 * targetSelector 目标选择器，常用于容器中的click、change事件，
 *   根据触发源target动态向上查找指定元素
 * 事件响应，dom事件中的 event作为第一个参数，其他为扩展参数
 * trigger触发时，可带扩展参数，扩展参数通过el的 wiaDomEventData 传递
 * 触摸屏，click 300ms 有延迟，改用 touch 实现立即触发
 * 避免click穿透，touch触发click事件后，禁止300ms后的click事件
 * swipe 滑动事件上下左右四个方向，滑动距离超过10px，则触发回调函数
 *   触发回调函数，参数为 (ev, {x, y})，x y互斥，只有一个有值
 * press 按压事件，超过 1秒，移动距离小于 5px，为 press 事件
 */
function on(...args) {
  let [eventType, targetSelector, listener, capture] = args

  if (typeof args[1] === 'function') {
    ;[eventType, listener, capture] = args
    targetSelector = undefined
  }

  // 封装需动态查找目标元素的事件回调函数
  function liveHandler(ev, sender, ...vs) {
    const n = ev.target // 事件源，不能用this
    if (!n) return

    const {eventType: evType, selector, liveProxy: fn} = liveHandler

    // 向上查找符合选择器元素，找到一个即触发，其他符合选择器不触发
    // f7是查找所有符合选择器父元素，全部触发，实际使用中，只需最近的元素触发，无需全部触发！
    const el = $(n).closest(selector)?.dom // live事件函数，目标选择器对象，替换真正的this
    // console.log('liveHandler ', {listener: this, selector, event: ev, target: n, upper: $n?.dom});
    // debugger;
    if (el && (evType !== 'click' || canClick(el, fn))) {
      const param = [ev, el, ...vs] // 符合元素作为事件函数第二个参数
      fn.apply(el, param) // this、sender 指向符合选择器元素
    }
  }

  // 带有目标选择器，回调函数转换为 liveHandler
  if (targetSelector) {
    liveHandler.selector = targetSelector
    liveHandler.liveProxy = listener
    liveHandler.eventType = eventType
    return this.on(eventType, liveHandler, capture)
  }

  if (!capture) capture = false

  // 事件响应，dom事件中的 event作为第一个参数
  // trigger通过el的 wiaDomEventData 带额外参数，
  function handleEvent(ev, ...vs) {
    const ds = ev?.target?.wiaDomEventData ?? []
    const param = [ev, this, ...vs, ...ds]

    // console.log('handleEvent ', {listener: this, event: ev, target: ev?.target});
    listener.apply(this, param)
  }

  /**
   * 同一节点、同一事件函数，过500毫秒才能重复触发click事件，避免连击时连续触发同一函数
   * @param {*} el 元素节点
   * @param {*} fn 事件函数
   * @returns
   */
  function canClick(el, fn) {
    let R = true

    if (!el || !fn) return false

    // 排除live、once封装代理函数，排除 document等非元素节点，主要针对 button、link、div
    if (fn.liveProxy || fn.onceProxy || el.nodeType !== 1) return true

    try {
      // disabled not trigger event
      if (el.clickDisabled?.has?.(fn)) {
        // ev.stopPropagation(); // 阻止事件冒泡，会阻止live和对同一节点的多侦听事件
        console.log('duplicate click disabled.')
        R = false
      } else {
        // 阻止连击  Prevent duplicate clicks
        if (!el.clickDisabled) el.clickDisabled = new Set()
        el.clickDisabled.add(fn)
        setTimeout(() => el.clickDisabled.delete(fn), 200) // wait 200 ms, can click again
      }
    } catch (ex) {
      console.log('canClick exp:', ex.message)
    }

    return R
  }

  // Prevent duplicate clicks
  // click事件响应，dom事件中的 event作为第一个参数，其他为扩展参数
  function clickEvent(ev) {
    // console.log('clickEvent ', {listener: this, event: ev, target: ev?.target});
    const el = this

    if (!canClick(el, listener)) return false

    const ds = ev?.target?.wiaDomEventData || []
    const param = [ev, this, ...ds]
    listener.apply(this, param)
  }

  // on 函数内共享闭包变量
  const touch = {}
  function touchStart(ev) {
    // console.log('touchStart');

    // ev.preventDefault(); // 默认行为为滚动屏幕，调用则禁止屏幕滚动，比如屏幕上画画，就需要禁止屏幕滚动
    // touch.x = e.targetTouches[0].pageX; // pageX 相对文档的位置
    touch.x = ev.targetTouches[0].pageX // targetTouches clientX 可见视口位置，pageX 文档位置
    touch.y = ev.targetTouches[0].pageY
    touch.el = $(ev.target)
    touch.top = touch.el.rect()?.top ?? 0
    touch.left = touch.el.rect()?.left ?? 0
    touch.time = new Date().getTime()
    touch.trigger = false
    touch.scrollY = false
    const pg = touch.el.closest('.page-content').dom
    if (pg) {
      touch.scrollY = true
      if (pg.scrollTop === 0 || pg.scrollTop + pg.clientHeight === pg.scrollHeight)
        touch.scrollY = false
    }
  }

  // swipe 滑动事件
  function touchMove(ev) {
    // console.log('touchMove');
    if (eventType !== 'swipe' || touch.trigger) return

    const x = Math.round(ev.targetTouches[0].pageX - touch.x)
    const y = Math.round(ev.targetTouches[0].pageY - touch.y)
    const top = Math.round((touch.el.rect()?.top ?? 0) - touch.top)
    const left = Math.round((touch.el.rect()?.left ?? 0) - touch.left)

    // 计算手指在屏幕上的滑动距离，减掉页面跟随手指滚动的距离
    const mx = Math.abs(x - left)
    const my = Math.abs(y - top)

    // 页面不滚动，滑动超过12px，触发滑动事件，页面滚动则不触发
    if (my > 15 && mx < 8 && top === 0 && !touch.scrollY) {
      // e.preventDefault(); // 滑动不会产生onclick事件！ 不阻止后续的 onclick 事件，否则后续onclick 不会触发
      touch.trigger = true // move 会反复触发，事件只触发一次
      return handleEvent.call(this, ev, {x: 0, y})
    }

    if (mx > 12 && my < 8 && left === 0 && top === 0) {
      // e.preventDefault(); // 滑动不会产生onclick事件！ 不阻止后续的 onclick 事件，否则后续onclick 不会触发
      touch.trigger = true // move 会反复触发，事件只触发一次
      return handleEvent.call(this, ev, {x, y: 0})
    }
  }

  // 同时具备 press click，需分开两个函数侦听，触发两次，否则只能触发一次
  function clickEnd(ev) {
    return touchEnd.call(this, ev)
  }

  function pressEnd(ev) {
    return touchEnd.call(this, ev)
  }

  // touch click 和 press 事件，与onclick事件需二选一，使用 touch click，不会抑制后续的onclick事件。
  // 如果上层有click事件，客户端需调用e.preventDefault()来阻止穿透。
  function touchEnd(ev) {
    // console.log('touchEnd', {eventType});
    if (eventType !== 'click' && eventType !== 'press') return
    touch.trigger = false
    const x = Math.abs(ev.changedTouches[0].pageX - touch.x)
    const y = Math.abs(ev.changedTouches[0].pageY - touch.y)
    const tm = new Date().getTime() - touch.time
    // console.log('touchEnd', {x, y, tm});
    if (x <= 5 && y <= 5) {
      // 由于在层中使用click，禁止缺省行为后，层中的输入框、下拉框等均失效
      // 阻止后续的 onclick 事件，可在按钮中实现，否则页面变动后，后续onclick 事件会触发在其他节点上，导致点击穿透错误！
      // ev.preventDefault();
      if (tm < 500 && eventType === 'click') return clickEvent.call(this, ev)
      if (tm > 500 && eventType === 'press') return handleEvent.call(this, ev)
    }
  }

  const events = eventType.split(' ')
  let j
  for (let i = 0; i < this.length; i += 1) {
    const el = this[i]
    // 未设置目标选择器
    for (j = 0; j < events.length; j += 1) {
      const event = events[j]
      // 每个事件的每个函数，都保存到el属性中，方便off
      if (!el.domListeners) el.domListeners = {}
      // 事件对应的函数数组，每个函数都要 addEventListener，才能接收事件回调
      if (!el.domListeners[event]) el.domListeners[event] = []

      // 触摸屏，touch 代替 click，proxyListener 事件处理代理，domListeners 保存在el上
      if ($.support.touch && (event === 'click' || event === 'swipe' || event === 'press')) {
        const lis = {
          capture,
          listener,
          proxyListener: [touchStart],
        }

        let passive = capture
        if (event === 'swipe') {
          if ($.support.passiveListener) passive = {passive: true, capture}
          lis.proxyListener.push(touchMove)
        } else if (event === 'click') lis.proxyListener.push(clickEnd)
        else if (event === 'press') lis.proxyListener.push(pressEnd)

        el.domListeners[event].push(lis)
        lis.proxyListener.forEach(fn => {
          let type = ''
          // fn.name 会被优化，不可使用
          switch (fn) {
            case touchStart:
              type = 'touchstart'
              break
            case touchMove:
              type = 'touchmove'
              break
            case clickEnd:
              type = 'touchend'
              break
            case pressEnd:
              type = 'touchend'
              break
            default:
          }
          // console.log('touch', {type, fn: fn.name, passive});
          el.addEventListener(type, fn, passive)
        })
      } else if (event === 'click') {
        el.domListeners[event].push({
          capture,
          listener,
          proxyListener: clickEvent,
        })
        el.addEventListener(event, clickEvent, capture)
      } else {
        // 其他事件
        el.domListeners[event].push({
          capture,
          listener,
          proxyListener: handleEvent,
        })
        el.addEventListener(event, handleEvent, capture)
      }
    }
  }

  return this
}

/**
 * 解除事件侦听
 * @param  {...any} args
 * @param  {String} event 事件，必选
 * listener 侦听函数，不传，则解除所有侦听
 * capture：不传默认为false，如果on时为true，off时需传true
 * targetSelector：多余参数，兼容f7
 * @returns
 */
function off(...args) {
  let [eventType, targetSelector, listener, capture] = args
  if (typeof args[1] === 'function') {
    ;[eventType, listener, capture] = args
    targetSelector = undefined
  }
  if (!capture) capture = false

  const events = eventType.split(' ')
  for (let i = 0; i < events.length; i += 1) {
    const event = events[i]
    for (let j = 0; j < this.length; j += 1) {
      const el = this[j]
      // 事件对应的所有处理对象
      const handlers = el?.domListeners?.[event]
      if (handlers?.length) {
        for (let k = handlers.length - 1; k >= 0; k -= 1) {
          const handler = handlers[k] // 事件响应对象数组
          // 匹配函数，通过封装函数解除侦听，匿名函数无法解除
          if (handler?.listener === listener && handler?.capture === capture) {
            // 解除额外添加的侦听
            if ((event === 'click' || event === 'swipe' || event === 'press') && $.support.touch) {
              el.removeEventListener('touchstart', handler.proxyListener[0], handler.capture)

              if (event === 'swipe')
                el.removeEventListener('touchmove', handler.proxyListener[1], handler.capture)
              else el.removeEventListener('touchend', handler.proxyListener[1], handler.capture)
            } else el.removeEventListener(event, handler.proxyListener, handler.capture)
            handlers.splice(k, 1)
          } else if (
            listener &&
            handler?.listener?.onceProxy === listener &&
            handler?.capture === capture
          ) {
            // once 一次性事件
            el.removeEventListener(event, handler.proxyListener, handler.capture)
            handlers.splice(k, 1)
          } else if (
            listener &&
            targetSelector &&
            handler?.listener?.liveProxy === listener &&
            handler?.listener?.selector === targetSelector &&
            handler?.capture === capture
          ) {
            // 指定事件目标选择器 live 封装，一个函数可对应 多个不同事件目标选择器
            el.removeEventListener(event, handler.proxyListener, handler.capture)
            handlers.splice(k, 1)
          } else if (
            listener &&
            !targetSelector &&
            handler?.listener?.liveProxy === listener &&
            handler?.capture === capture
          ) {
            // 不指定事件目标选择器，该事件 所有 live对应的相同函数 均解除
            el.removeEventListener(event, handler.proxyListener, handler.capture)
            handlers.splice(k, 1)
          } else if (!listener) {
            // 不指定函数，则解除该元素所有侦听函数
            el.removeEventListener(event, handler.proxyListener, handler.capture)
            handlers.splice(k, 1)
          }
        }
      }
    }
  }
  return this
}

function once(...args) {
  const self = this
  let [eventName, targetSelector, listener, capture] = args
  if (typeof args[1] === 'function') {
    ;[eventName, listener, capture] = args
    targetSelector = undefined
  }
  // 封装 回调函数，执行一次后自动 off
  function onceHandler(...eventArgs) {
    self.off(eventName, targetSelector, onceHandler, capture)
    if (onceHandler.onceProxy) {
      onceHandler.onceProxy.apply(this, eventArgs)
      delete onceHandler.onceProxy
    }
  }
  onceHandler.onceProxy = listener
  return self.on(eventName, targetSelector, onceHandler, capture)
}

/**
 * 触发事件函数
 * 第一个数据参数放入回调函数第一个参数event事件的 detail 属性中！
 * 扩展参数放入el的wiaDomEventData属性传递，触发时带入事件回调函数参数中！
 * @param  {...any} args
 * @returns
 */
function trigger(...args) {
  const events = args[0].split(' ')
  const eventData = args[1]
  for (let i = 0; i < events.length; i += 1) {
    const event = events[i]
    for (let j = 0; j < this.length; j += 1) {
      const el = this[j]
      let evt
      try {
        evt = new window.CustomEvent(event, {
          detail: eventData,
          bubbles: true,
          cancelable: true,
        })
      } catch (e) {
        evt = document.createEvent('Event')
        evt.initEvent(event, true, true)
        evt.detail = eventData
      }
      // eslint-disable-next-line
      el.wiaDomEventData = args.filter((data, dataIndex) => dataIndex > 0)
      el.dispatchEvent(evt) // el === event.target
      el.wiaDomEventData = []
      delete el.wiaDomEventData
    }
  }
  return this
}

// Sizing/Styles
function width() {
  if (this[0] === window) {
    return window.innerWidth
  }

  if (this.length > 0) {
    return parseFloat(this.css('width'))
  }

  return null
}
function outerWidth(includeMargins) {
  if (this.length > 0) {
    if (includeMargins) {
      // eslint-disable-next-line
      const styles = this.styles()
      return (
        this[0].offsetWidth +
        parseFloat(styles.getPropertyValue('margin-right')) +
        parseFloat(styles.getPropertyValue('margin-left'))
      )
    }
    return this[0].offsetWidth
  }
  return null
}
function height() {
  if (this[0] === window) {
    return window.innerHeight
  }

  if (this.length > 0) {
    return parseFloat(this.css('height'))
  }

  return null
}
function outerHeight(includeMargins) {
  if (this.length > 0) {
    if (includeMargins) {
      // eslint-disable-next-line
      const styles = this.styles()
      return (
        this[0].offsetHeight +
        parseFloat(styles.getPropertyValue('margin-top')) +
        parseFloat(styles.getPropertyValue('margin-bottom'))
      )
    }
    return this[0].offsetHeight
  }
  return null
}

/**
 * 兼容 jQuery，dom7 是错误的
 * wia 中，window 滚动被 .page-content 页面层替代
 */
function offset(coordinates) {
  if (coordinates)
    return this.each(function (idx) {
      var $this = $(this),
        coords = $.funcArg(this, coordinates, idx, $this.offset()),
        parentOffset = $this.offsetParent().offset(),
        props = {
          top: coords.top - parentOffset.top,
          left: coords.left - parentOffset.left,
        }

      if ($this.css('position') === 'static') props.position = 'relative'
      $this.css(props)
    })
  if (!this.length) return null
  if (document.documentElement !== this[0] && !$.contains(document.documentElement, this[0]))
    return {top: 0, left: 0}
  const obj = this[0].getBoundingClientRect()
  const pg = this.closest('.page-content')
  const scrollX = pg.length ? pg.dom.scrollLeft : window.pageXOffset
  const scrollY = pg.length ? pg.dom.scrollTop : window.pageYOffset
  return {
    left: obj.left + scrollX,
    top: obj.top + scrollY,
    width: Math.round(obj.width),
    height: Math.round(obj.height),
  }
}

function rect() {
  if (!this.length) return null
  if (document.documentElement !== this[0] && !$.contains(document.documentElement, this[0]))
    return {top: 0, left: 0}
  const obj = this[0].getBoundingClientRect()
  return {
    left: obj.left,
    top: obj.top,
    width: Math.round(obj.width),
    height: Math.round(obj.height),
  }
}

function position() {
  if (!this.length) return

  var elem = this[0],
    // Get *real* offsetParent
    offsetParent = this.offsetParent(),
    // Get correct offsets
    offset = this.offset(),
    parentOffset = rootNodeRE.test(offsetParent[0].nodeName)
      ? {top: 0, left: 0}
      : offsetParent.offset()

  // Subtract element margins
  // note: when an element has margin: auto the offsetLeft and marginLeft
  // are the same in Safari causing offset.left to incorrectly be 0
  offset.top -= parseFloat($(elem).css('margin-top')) || 0
  offset.left -= parseFloat($(elem).css('margin-left')) || 0

  // Add offsetParent borders
  parentOffset.top += parseFloat($(offsetParent[0]).css('border-top-width')) || 0
  parentOffset.left += parseFloat($(offsetParent[0]).css('border-left-width')) || 0

  // Subtract the two offsets
  return {
    top: offset.top - parentOffset.top,
    left: offset.left - parentOffset.left,
  }
}

function offsetParent() {
  return this.map(function () {
    let pt = this.offsetParent || document.body
    while (pt && !rootNodeRE.test(pt.nodeName) && $(pt).css('position') == 'static')
      pt = pt.offsetParent
    return pt
  })
}

function hide() {
  return this.each(function () {
    if (this.style.display !== 'none') this.style.display = 'none'
  })
}

function defaultDisplay(nodeName) {
  if (!elementDisplay[nodeName]) {
    const el = document.createElement(nodeName)
    document.body.appendChild(el)
    let display = getComputedStyle(el, '').getPropertyValue('display')
    el.parentNode.removeChild(el)
    display === 'none' && (display = 'block')
    elementDisplay[nodeName] = display
  }
  return elementDisplay[nodeName]
}

function show() {
  return this.each(function () {
    this.style.display === 'none' && (this.style.display = '')
    // Still not visible
    if (getComputedStyle(this, '').getPropertyValue('display') === 'none')
      this.style.display = defaultDisplay(this.nodeName) // block
  })

  /*
  for (let i = 0; i < this.length; i += 1) {
    const el = this[i];
    if (el.style.display === 'none') {
      el.style.display = '';
    }
    if (window.getComputedStyle(el, null).getPropertyValue('display') === 'none') {
      // Still not visible
      el.style.display = 'block';
    }
  }
  return this;
	*/
}

function replaceWith(newContent) {
  return this.before(newContent).remove()
}

function styles() {
  if (this[0]) return window.getComputedStyle(this[0], null)
  return {}
}

function css(props, value) {
  const REGEXP_SUFFIX = /^width|height|left|top|marginLeft|marginTop|paddingLeft|paddingTop$/

  let i
  if (arguments.length === 1) {
    if (typeof props === 'string') {
      if (this[0]) return window.getComputedStyle(this[0], null).getPropertyValue(props)
    } else {
      for (i = 0; i < this.length; i += 1) {
        // eslint-disable-next-line
        for (let prop in props) {
          let v = props[prop]
          if (REGEXP_SUFFIX.test(prop) && $.isNumber(v)) v = `${v}px`

          this[i].style[prop] = v
        }
      }
      return this
    }
  }
  if (arguments.length === 2 && typeof props === 'string') {
    for (i = 0; i < this.length; i += 1) {
      let v = value
      if (REGEXP_SUFFIX.test(props) && $.isNumber(v)) v = `${v}px`

      this[i].style[props] = v
    }
    return this
  }
  return this
}

/**
 * 与jQuery 兼容，第一个参数为索引
 * @param {*} callback
 * @returns
 */
function each(callback) {
  emptyArray.some.call(this, function (el, idx) {
    return callback.call(el, idx, el) === false // 退出
  })
  return this
}

/**
 * 第一个参数为元素、第二个为索引
 * @param {*} callback
 * @returns
 */
function forEach(callback) {
  emptyArray.some.call(this, function (el, idx) {
    return callback.call(el, el, idx) === false
  })
  return this
}

/**
 * 第一个参数为元素、第二个为索引
 * @param {*} callback
 * @returns
 */
function some(callback) {
  return emptyArray.some.call(this, function (el, idx) {
    return callback.call(el, el, idx)
  })
}

/**
 * 第一个参数为元素、第二个为索引
 * @param {*} callback
 * @returns
 */
function every(callback) {
  return emptyArray.every.call(this, function (el, idx) {
    return callback.call(el, el, idx)
  })
}

/**
 * 排除 dom 节点
 * @param {*} sel 函数、nodeList、选择器
 * @returns Dom对象
 */
function not(sel) {
  const R = []
  if ($.isFunction(sel) && sel.call)
    this.each(function (id) {
      if (!sel.call(this, id)) R.push(this)
    })
  else {
    var excludes =
      typeof sel == 'string'
        ? this.filter(sel)
        : likeArray(sel) && isFunction(sel.item)
        ? emptyArray.slice.call(sel)
        : $(sel)
    this.forEach(function (el) {
      if (excludes.indexOf(el) < 0) R.push(el)
    })
  }
  return $(R)
}

/**
 * 过滤符合要求的dom节点的Dom对象
 * @param {*} sel
 * @returns
 */
function filter(sel) {
  let R = []
  try {
    // 回调函数
    if ($.isFunction(sel) && sel.call) {
      this.each(function (id, it) {
        if (sel.call(this, id, it)) R.push(this)
      })
    } else
      R = emptyArray.filter.call(this, function (el) {
        return $.matches(el, sel)
      })
  } catch (e) {}

  return $(R)
}

function map(cb) {
  return $(
    $.map(this, function (el, i) {
      return cb.call(el, i, el)
    })
  )
}

function clone() {
  return this.map(function () {
    return this.cloneNode(true)
  })
}

function html(v) {
  return 0 in arguments
    ? this.each(function (idx) {
        var originHtml = this.innerHTML
        $(this).empty().append($.funcArg(this, v, idx, originHtml))
      })
    : 0 in this
    ? this[0].innerHTML
    : undefined
}

/**
 * 返回数组节点指定属性数组
 * @param {*} p
 * @returns
 */
function pluck(p) {
  return $.map(this, function (el) {
    return el[p]
  })
}

function text(tx) {
  return 0 in arguments
    ? this.each(function (idx) {
        var newText = $.funcArg(this, tx, idx, this.textContent)
        this.textContent = newText == null ? '' : '' + newText
      })
    : 0 in this
    ? this.pluck('textContent').join('')
    : undefined
}

function is(sel) {
  return this.length > 0 && $.matches(this[0], sel)
}

function indexOf(el) {
  for (let i = 0; i < this.length; i += 1) {
    if (this[i] === el) return i
  }
  return -1
}
function index() {
  let chd = this[0]
  let i
  if (chd) {
    i = 0
    // eslint-disable-next-line
    while ((chd = chd.previousSibling) !== null) {
      if (chd.nodeType === 1) i += 1
    }
    return i
  }
  return undefined
}

function slice(...args) {
  return $(emptyArray.slice.apply(this, args))
}

/**
 * 返回指定索引dom元素的Dom对象
 * @param {*} idx
 */
function eq(idx) {
  if (typeof idx === 'undefined') return this
  const {length} = this
  if (idx > length - 1 || length + idx < 0) {
    return $()
  }
  return idx === -1 ? this.slice(idx) : this.slice(idx, +idx + 1)
}

function first() {
  const el = this[0]
  return el && !$.isObject(el) ? el : $(el)
}

function last() {
  const el = this[this.length - 1]
  return el && !$.isObject(el) ? el : $(el)
}

function insertChild(el, ch) {
  if (el.childNodes.length) el.insertBefore(ch, el.childNodes[0])
  else el.appendChild(ch)
}

/**
 * 同级后节点，如果符合条件返回节点，不符合条件，返回空节点，不含文本节点
 */
function next(selector) {
  if (this.length > 0) {
    if (selector) {
      if (this[0].nextElementSibling && $(this[0].nextElementSibling).is(selector)) {
        return $([this[0].nextElementSibling])
      }
      return $()
    }

    if (this[0].nextElementSibling) return $([this[0].nextElementSibling])
    return $()
  }
  return $()
}

/**
 * 同级向后查找符合条件的第一个元素节点，不含文本节点
 */
function nextNode(selector) {
  const nextEls = []
  const el = this[0]
  if (!el) return $()

  let next = el.nextElementSibling // eslint-disable-line
  while (next) {
    if (selector) {
      if ($(next).is(selector)) {
        nextEls.push(next)
        break
      }
    } else {
      nextEls.push(next)
      break
    }
    next = next.nextElementSibling
  }
  return $(nextEls)
}

/**
 * 同级向后查找所有符合条件的元素节点，不含文本节点
 */
function nextAll(selector) {
  const nextEls = []
  let el = this[0]
  if (!el) return $()
  while (el.nextElementSibling) {
    const next = el.nextElementSibling // eslint-disable-line
    if (selector) {
      if ($(next).is(selector)) nextEls.push(next)
    } else nextEls.push(next)
    el = next
  }
  return $(nextEls)
}

/**
 * 同级前节点，如果符合条件返回节点，不符合条件，返回空节点，不含文本节点
 */
function prev(selector) {
  if (this.length > 0) {
    const el = this[0]
    if (selector) {
      if (el.previousElementSibling && $(el.previousElementSibling).is(selector)) {
        return $([el.previousElementSibling])
      }
      return $()
    }

    if (el.previousElementSibling) return $([el.previousElementSibling])
    return $()
  }
  return $()
}

/**
 * 同级向前查找符合条件的第一个元素节点，不含文本节点
 */
function prevNode(selector) {
  const prevEls = []
  const el = this[0]
  if (!el) return $()

  let prev = el.previousElementSibling // eslint-disable-line
  while (prev) {
    if (selector) {
      if ($(prev).is(selector)) {
        prevEls.push(prev)
        break
      }
    } else {
      prevEls.push(prev)
      break
    }
    prev = prev.previousElementSibling
  }
  return $(prevEls)
}

/**
 * 同级向前查找所有符合条件的元素节点，不含文本节点
 */
function prevAll(selector) {
  const prevEls = []
  let el = this[0]
  if (!el) return $()
  while (el.previousElementSibling) {
    const prev = el.previousElementSibling // eslint-disable-line
    if (selector) {
      if ($(prev).is(selector)) prevEls.push(prev)
    } else prevEls.push(prev)
    el = prev
  }
  return $(prevEls)
}

/**
 * 同级前后所有兄弟元素节点，不含文本节点
 */
function siblings(selector) {
  return this.nextAll(selector).add(this.prevAll(selector))
}

/**
 * 所有dom节点符合条件的父元素
 */
function parent(selector) {
  const parents = [] // eslint-disable-line
  for (let i = 0; i < this.length; i += 1) {
    if (this[i].parentNode !== null) {
      if (selector) {
        if ($(this[i].parentNode).is(selector)) parents.push(this[i].parentNode)
      } else {
        parents.push(this[i].parentNode)
      }
    }
  }
  return $($.uniq(parents))
}

/**
 * 从当前元素的父元素开始沿 DOM 树向上,获得匹配选择器的所有祖先元素。
 */
function parents(selector) {
  const parents = [] // eslint-disable-line
  for (let i = 0; i < this.length; i += 1) {
    let parent = this[i].parentNode // eslint-disable-line
    while (parent) {
      if (selector) {
        if ($(parent).is(selector)) parents.push(parent)
      } else parents.push(parent)

      parent = parent.parentNode
    }
  }
  return $($.uniq(parents))
}

/**
 * 从当前元素的父元素开始沿 DOM 树向上,获得匹配选择器的第一个祖先元素。
 * 选择器为空，则返回 空
 */
function parentNode(sel) {
  const R = []

  for (let i = 0; i < this.length; i += 1) {
    let pn = this[i].parentNode
    while (pn) {
      if (sel) {
        if ($(pn).is(sel)) {
          R.push(pn)
          return $(R, sel)
        }
      } else {
        R.push(pn)
        return $(R, sel)
      }

      pn = pn.parentNode
    }
  }
  return $(R, sel)
}

/**
 * 从当前元素开始沿 DOM 树向上,获得匹配选择器的第一个祖先元素。
 * 当前节点符合，则返回当前节点
 * 选择器为空，则返回 空
 */
function closest(sel) {
  let self = this // eslint-disable-line
  if (typeof sel === 'undefined') return $()

  // ~开头，按 name 属性查找
  if (sel[0] === '~') sel = `[name=${sel.substr(1)}]`

  if (!self.is(sel)) {
    const parents = [] // eslint-disable-line

    for (let i = 0; i < this.length; i += 1) {
      let parent = this[i].parentNode // eslint-disable-line
      while (parent) {
        const d = $(parent)
        if (d.is(sel)) return d

        parent = parent.parentNode
      }
    }

    return $()
  }

  return self
}

function upper(sel) {
  return closest.bind(this)(sel)
}

/**
 * 后代中所有适合选择器的元素
 * @param {*} sel
 */
function find(sel) {
  let R = null
  if (!sel) return $()

  // ~开头，按 name 属性查找
  if (sel[0] === '~') sel = `[name=${sel.substr(1)}]`

  const self = this
  // 选择器为对象
  if (typeof sel === 'object')
    R = $(sel).filter(function () {
      const node = this
      return emptyArray.some.call(self, function (pn) {
        return $.contains(pn, node)
      })
    })
  else if (this.length === 1) R = $($.qsa(sel, this[0]))
  else
    R = this.map(function () {
      return $.qsa(sel, this)
    })

  return R || $()
}

/**
 * 后代中单个适合选择器的元素，效率高于find
 * 不支持对象参数
 * @param {*} sel
 */
function findNode(sel) {
  let R = null
  if (!sel) return $()

  // ~开头，按 name 属性查找
  if (sel[0] === '~') sel = `[name=${sel.substr(1)}]`

  if (this.length === 1) R = $($.qu(sel, this[0]))
  else
    R = this.map(function () {
      return $.qu(sel, this)
    })

  return R || $()
}

/**
 * 返回所有dom的所有符合条件的直接子元素，不包括文本节点
 * @param {*} sel
 */
function children(sel) {
  const cs = [] // eslint-disable-line
  for (let i = 0; i < this.length; i += 1) {
    const childs = this[i].children

    for (let j = 0; j < childs.length; j += 1) {
      if (!sel) {
        cs.push(childs[j])
      } else if ($(childs[j]).is(sel)) cs.push(childs[j])
    }
  }
  return $($.uniq(cs))
}

/**
 * 返回被选元素的第一个符合条件直接子元素，不包括文本节点
 * @param {*} sel
 */
function childNode(sel) {
  return child.bind(this)(sel)
}

/**
 * 返回被选元素的第一个符合条件直接单个子元素，不包括文本节点
 * 或者 替换节点的所有子元素
 * @param {*} sel
 */
function child(sel) {
  if ($.isDom(sel)) {
    this.empty().append(sel)
    return this
  }

  const cs = [] // eslint-disable-line
  for (let i = 0; i < this.length; i += 1) {
    const childs = this[i].children

    for (let j = 0; j < childs.length; j += 1) {
      if (!sel) {
        cs.push(childs[j])
        break
      } else if ($(childs[j]).is(sel)) {
        cs.push(childs[j])
        break
      }
    }
  }
  return $(cs, sel)
}

function remove() {
  return this.each(function () {
    if (this.parentNode != null) this.parentNode.removeChild(this)
  })
}

function detach() {
  return this.remove()
}

function add(...args) {
  const dom = this
  let i
  let j
  for (i = 0; i < args.length; i += 1) {
    const toAdd = $(args[i])
    for (j = 0; j < toAdd.length; j += 1) {
      dom[dom.length] = toAdd[j]
      dom.length += 1
    }
  }
  return dom
}

function empty() {
  return this.each(function () {
    this.innerHTML = ''
  })
}

/**
 * 是否包含子元素，不含文本节点
 */
function hasChild() {
  if (!this.dom) return false
  return this.dom.children.length > 0
}

/**
 * 第一个子元素节点，不含文本节点
 */
function firstChild() {
  if (!this.dom || this.dom.children.length === 0) return null
  return $([this.dom.children[0]])
}

/**
 * 最后一个子元素节点，不含文本节点
 */
function lastChild() {
  if (!this.dom || this.dom.children.length === 0) return null
  return $([this.dom.children[this.dom.children.length - 1]])
}

/**
 * 元素子节点数量，不含文本节点
 */
function childCount() {
  if (!this.dom) return 0
  return this.dom.children.length
}

/**
 * 光标放入尾部
 * @param el
 */
function cursorEnd() {
  if (!this.dom) return null

  const el = this.dom
  el.focus()

  if (typeof window.getSelection !== 'undefined' && typeof document.createRange !== 'undefined') {
    const rg = document.createRange()
    rg.selectNodeContents(el)
    // 合并光标
    rg.collapse(false)
    const sel = window.getSelection()
    sel.removeAllRanges()
    sel.addRange(rg)
  } else if (typeof document.body.createTextRangrge !== 'undefined') {
    const rg = document.body.createTextRange()
    rg.moveToElementText(el)
    // 合并光标
    rg.collapse(false)
    // textRange.moveStart('character', 3);
    rg.select()
  }
}

/**
 * 获取光标位置
 * @returns {number}
 */
function getCursorPos() {
  let R = 0

  if (!this.dom) return 0

  const el = this.dom

  // obj.focus();
  if (el.selectionStart) {
    // IE以外
    R = el.selectionStart
  } else {
    // IE
    let rg = null
    if (el.tagName.toLowerCase() === 'textarea') {
      // TEXTAREA
      rg = event.srcElement.createTextRange()
      rg.moveToPoint(event.x, event.y)
    } else {
      // Text
      rg = document.selection.createRange()
    }
    rg.moveStart('character', -event.srcElement.value.length)
    // rg.setEndPoint("StartToStart", obj.createTextRange())
    R = rg.text.length
  }
  return R
}

/**
 * 得到光标的位置
 */
function getCursorPosition() {
  if (!this.dom) return 0

  const el = this.dom

  const qswh = '@#%#^&#*$'
  // obj.focus();
  const rng = document.selection.createRange()
  rng.text = qswh
  const nPosition = el.value.indexOf(qswh)
  rng.moveStart('character', -qswh.length)
  rng.text = ''
  return nPosition
}

/**
 * 设置光标位置
 */
function setCursorPos(pos) {
  if (!this.dom) return

  const rg = this.dom.createTextRange()
  rg.collapse(true)
  rg.moveStart('character', pos)
  rg.select()
}

/**
 * 移到第一行
 */
function moveFirst() {
  this.rowindex = 0
}

/**
 * querySelector
 * return only first
 */
function qu(sel) {
  let n = []
  try {
    n = this.dom?.querySelector(sel)
  } catch (e) {}

  return $(n || [])
}

function qus(sel) {
  return $(sel, this.dom)
}

/**
 * querySelector attribute
 * return only first
 */
function att(n, v) {
  let R = []
  try {
    if (this.attr(n) === v) return this // 自己符合，返回自身
    R = this.dom?.querySelector(`[${n}=${v}]`)
  } catch (e) {}
  return $(R || [])
}

function atts(n, v) {
  let R = []
  try {
    R = $(`[${n}=${v}]`, this.dom)
    if (this.attr(n) === v) R.push(this.dom) // 自己符合，添加自身
  } catch (e) {}
  return $(R || [])
}

/**
 * querySelector name
 * return only first
 */
function name(v) {
  return this.att('name', v)
}

function fastLink() {
  $.fastLink(this)
  return this
}

/**
 * name 属性组件直接绑定到当前Dom实例，方便调用
 * 只挂载一个，多个同名name，最后一个起作用，因此一个页面内，name不要重复
 * 同节点多次调用不覆盖，同名不同dom节点，覆盖
 * 覆盖后，原直接节点属性的 bind 会失效，需使用新的$dom重新bind
 * 动态内容一般在 ready 中创建，创建后name会自动挂载
 * show/back 中创建的动态内容，未自动挂载，需调用 bindName 挂载！
 */
function bindName() {
  const ns = this.qus('[name]')
  ns?.forEach(n => {
    const $n = $(n)
    const nm = $n.attr('name')
    if (!this.n) this.n = {}
    if (!this.n[nm] || this.n[nm].dom !== n) this.n[nm] = $n
    if (!this[nm] || (D.isD(this[nm]) && this[nm].dom !== n)) this[nm] = $n
  })

  return this
}

function names(v) {
  return this.atts('name', v)
}

/**
 * querySelector ClassName
 * cls: 'aaa, bbb' => '.aaa, .bbb'
 * return only first node
 */
function clas(cls) {
  let R = []

  if (!cls) return $()

  try {
    const rs = []
    const cs = cls.split(',')
    cs.forEach(c => {
      if (c) {
        if (c.includes('.')) rs.push(c.trim())
        else rs.push(`.${c.trim()}`)
      }
    })

    R = this.dom?.querySelector(rs.join(','))
  } catch (e) {}

  return $(R || [])
}

/**
 * querySelectorAll ClassName
 * cls: 'aaa, bbb' => '.aaa, .bbb'
 * return all node
 */
function classes(cls) {
  let R = []

  if (!cls) return $()

  try {
    const rs = []
    const cs = cls.split(',')
    cs.forEach(c => {
      if (c.includes('.')) rs.push(c.trim())
      else rs.push(`.${c.trim()}`)
    })

    const ns = this.dom?.querySelectorAll(rs.join(','))
    // if (ns && ns.length > 0) R = slice.call(ns);
    if (ns && ns.length > 0) R = Array.from(ns)
  } catch (e) {}

  return $(R || [])
}

/**
 * querySelector TagName
 * tag: 'div'
 * return only first
 */
function tag(t) {
  let R = this.dom?.getElementsByTagName(t)
  if (R) R = R[0]

  return $(R)
}

function tags(t) {
  let R = this.dom?.getElementsByTagName(t)
  if (R && R.length > 0) R = [].slice.call(R)
  else R = []

  return $(R)
}

/**
 * 防抖，延迟执行，时间范围内只能执行一次，用于防止页面频繁刷新
 * @param {Function} fn
 * @param  {...any} args
 *  {{waitTime: number}} 尾部可设置等待时长，默认 100毫秒
 */
function debounce(fn, ...args) {
  const _ = this
  const k = `${fn.name}:debounce:timeout`
  if (_[k]) clearTimeout(_[k])
  else {
    const last = args.at(-1)
    let waitTime = 100
    if ($.isObject(last) && last.waitTime) {
      ;({waitTime} = last)
      args.pop()
    }
    _[k] = setTimeout(() => {
      fn.bind(_)(...args)
      _[k] = null
    }, waitTime)
  }
}

/**
 * 限流，时间范围内只能执行一次，阻止后需执行，用于防止双击误点重复提交
 * @param {Function} fn
 * @param  {...any} args
 *  {{waitTime: number}} 尾部可设置等待时长，默认 200毫秒
 */
function throttle(fn, ...args) {
  const _ = this
  const k = `${fn.name}:throttle:timeout`
  if (!_[k]) {
    const last = args.at(-1)
    let waitTime = 200
    if ($.isObject(last) && last.waitTime) {
      ;({waitTime} = last)
      args.pop()
    }
    fn.bind(_)(...args)
    _[k] = setTimeout(() => (_[k] = null), waitTime)
  }
}

export {
  slice,
  get,
  concat,
  toArray,
  each,
  forEach,
  some,
  every,
  is,
  not,
  filter,
  map,
  ready,
  attr,
  hasAttr,
  removeAttr,
  prop,
  removeProp,
  data,
  removeData,
  dataset,
  val,
  transform,
  transition,
  on,
  off,
  once,
  trigger,
  width,
  outerWidth,
  height,
  outerHeight,
  offset,
  rect,
  hide,
  show,
  styles,
  css,
  clone,
  html,
  pluck,
  text,
  indexOf,
  index,
  eq,
  first,
  last,
  next,
  nextNode,
  nextAll,
  prev,
  prevNode,
  prevAll,
  siblings,
  parent,
  parentNode,
  parents,
  closest,
  upper, // 等同于 closest
  qu,
  qus,
  att,
  atts,
  fastLink,
  name,
  bindName,
  names,
  tag,
  tags,
  clas as class,
  classes,
  find,
  findNode,
  hasChild,
  children,
  childNode,
  child, // 替代 childNode
  firstChild,
  lastChild,
  childCount,
  cursorEnd,
  getCursorPos,
  getCursorPosition,
  setCursorPos,
  moveFirst,
  remove,
  detach,
  add,
  replaceWith,
  empty,
  size,
  position,
  offsetParent,
  debounce,
  throttle,
}
