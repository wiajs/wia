function animate(initialProps, initialParams) {
  const els = this
  const a = {
    props: Object.assign({}, initialProps),
    params: Object.assign(
      {
        duration: 300,
        easing: 'swing', // or 'linear'
        /* Callbacks
      begin(elements)
      complete(elements)
      progress(elements, complete, remaining, start, tweenValue)
      */
      },
      initialParams
    ),

    elements: els,
    animating: false,
    que: [],

    easingProgress(easing, progress) {
      if (easing === 'swing') {
        return 0.5 - Math.cos(progress * Math.PI) / 2
      }
      if (typeof easing === 'function') {
        return easing(progress)
      }
      return progress
    },
    stop() {
      if (a.frameId) {
        $.cancelAnimationFrame(a.frameId)
      }
      a.animating = false
      a.elements.each((index, el) => {
        const element = el
        delete element.dom7AnimateInstance
      })
      a.que = []
    },
    done(complete) {
      a.animating = false
      a.elements.each((index, el) => {
        const element = el
        delete element.domAnimateInstance
      })
      if (complete) complete(els)
      if (a.que.length > 0) {
        const que = a.que.shift()
        a.animate(que[0], que[1])
      }
    },
    animate(props, params) {
      if (a.animating) {
        a.que.push([props, params])
        return a
      }
      const elements = []

      // Define & Cache Initials & Units
      a.elements.each((index, el) => {
        let initialFullValue
        let initialValue
        let unit
        let finalValue
        let finalFullValue

        if (!el.dom7AnimateInstance) a.elements[index].domAnimateInstance = a

        elements[index] = {
          container: el,
        }
        Object.keys(props).forEach(prop => {
          initialFullValue = window
            .getComputedStyle(el, null)
            .getPropertyValue(prop)
            .replace(',', '.')
          initialValue = parseFloat(initialFullValue)
          unit = initialFullValue.replace(initialValue, '')
          finalValue = parseFloat(props[prop])
          finalFullValue = props[prop] + unit
          elements[index][prop] = {
            initialFullValue,
            initialValue,
            unit,
            finalValue,
            finalFullValue,
            currentValue: initialValue,
          }
        })
      })

      let startTime = null
      let time
      let elementsDone = 0
      let propsDone = 0
      let done
      let began = false

      a.animating = true

      function render() {
        time = new Date().getTime()
        let progress
        let easeProgress
        // let el;
        if (!began) {
          began = true
          if (params.begin) params.begin(els)
        }
        if (startTime === null) {
          startTime = time
        }
        if (params.progress) {
          // eslint-disable-next-line
          params.progress(
            els,
            Math.max(Math.min((time - startTime) / params.duration, 1), 0),
            startTime + params.duration - time < 0 ? 0 : startTime + params.duration - time,
            startTime
          )
        }

        elements.forEach(element => {
          const el = element
          if (done || el.done) return
          Object.keys(props).forEach(prop => {
            if (done || el.done) return
            progress = Math.max(Math.min((time - startTime) / params.duration, 1), 0)
            easeProgress = a.easingProgress(params.easing, progress)
            const {initialValue, finalValue, unit} = el[prop]
            el[prop].currentValue = initialValue + easeProgress * (finalValue - initialValue)
            const currentValue = el[prop].currentValue

            if (
              (finalValue > initialValue && currentValue >= finalValue) ||
              (finalValue < initialValue && currentValue <= finalValue)
            ) {
              el.container.style[prop] = finalValue + unit
              propsDone += 1
              if (propsDone === Object.keys(props).length) {
                el.done = true
                elementsDone += 1
              }
              if (elementsDone === elements.length) {
                done = true
              }
            }
            if (done) {
              a.done(params.complete)
              return
            }
            el.container.style[prop] = currentValue + unit
          })
        })
        if (done) return
        // Then call
        a.frameId = $.requestAnimationFrame(render)
      }
      a.frameId = $.requestAnimationFrame(render)
      return a
    },
  }

  if (a.elements.length === 0) {
    return els
  }

  let animateInstance
  for (let i = 0; i < a.elements.length; i += 1) {
    if (a.elements[i].domAnimateInstance) {
      animateInstance = a.elements[i].domAnimateInstance
    } else a.elements[i].domAnimateInstance = a
  }
  if (!animateInstance) {
    animateInstance = a
  }

  if (initialProps === 'stop') {
    animateInstance.stop()
  } else {
    animateInstance.animate(a.props, a.params)
  }

  return els
}

function stop() {
  const els = this
  for (let i = 0; i < els.length; i += 1) {
    if (els[i].domAnimateInstance) {
      els[i].domAnimateInstance.stop()
    }
  }
}

/**
 * 通过css3 Translate 移动后，获取 x 或 y 坐标
 * @param {*} el
 * @param {*} axis
 */
function getTranslate(axis = 'x') {
  const els = this
  if (!els || !els.dom) return 0

  const el = els.dom

  let matrix
  let curTransform
  let transformMatrix

  const curStyle = window.getComputedStyle(el, null)

  if (window.WebKitCSSMatrix) {
    curTransform = curStyle.transform || curStyle.webkitTransform
    if (curTransform.split(',').length > 6) {
      curTransform = curTransform
        .split(', ')
        .map(a => a.replace(',', '.'))
        .join(', ')
    }
    // Some old versions of Webkit choke when 'none' is passed; pass
    // empty string instead in this case
    transformMatrix = new window.WebKitCSSMatrix(curTransform === 'none' ? '' : curTransform)
  } else {
    transformMatrix =
      curStyle.MozTransform ||
      curStyle.OTransform ||
      curStyle.MsTransform ||
      curStyle.msTransform ||
      curStyle.transform ||
      curStyle.getPropertyValue('transform').replace('translate(', 'matrix(1, 0, 0, 1,')
    matrix = transformMatrix.toString().split(',')
  }

  if (axis === 'x') {
    // Latest Chrome and webkits Fix
    if (window.WebKitCSSMatrix) curTransform = transformMatrix.m41
    // Crazy IE10 Matrix
    else if (matrix.length === 16) curTransform = parseFloat(matrix[12])
    // Normal Browsers
    else curTransform = parseFloat(matrix[4])
  }
  if (axis === 'y') {
    // Latest Chrome and webkits Fix
    if (window.WebKitCSSMatrix) curTransform = transformMatrix.m42
    // Crazy IE10 Matrix
    else if (matrix.length === 16) curTransform = parseFloat(matrix[13])
    // Normal Browsers
    else curTransform = parseFloat(matrix[5])
  }
  return curTransform || 0
}

function transitionStart(callback) {
  const events = ['webkitTransitionStart', 'transitionstart']
  const dom = this
  let i
  function fireCallBack(e) {
    /* jshint validthis:true */
    if (e.target !== this) return
    callback.call(this, e)
    for (i = 0; i < events.length; i += 1) {
      dom.off(events[i], fireCallBack)
    }
  }
  if (callback) {
    for (i = 0; i < events.length; i += 1) {
      dom.on(events[i], fireCallBack)
    }
  }
  return this
}

function transitionEnd(callback) {
  const events = ['webkitTransitionEnd', 'transitionend']
  const dom = this
  let i
  function fireCallBack(e) {
    /* jshint validthis:true */
    if (e.target !== this) return
    callback.call(this, e)
    for (i = 0; i < events.length; i += 1) {
      dom.off(events[i], fireCallBack)
    }
  }
  if (callback) {
    for (i = 0; i < events.length; i += 1) {
      dom.on(events[i], fireCallBack)
    }
  }
  return this
}

function animationEnd(callback) {
  const events = ['webkitAnimationEnd', 'animationend']
  const dom = this
  let i
  function fireCallBack(e) {
    if (e.target !== this) return
    callback.call(this, e)
    for (i = 0; i < events.length; i += 1) {
      dom.off(events[i], fireCallBack)
    }
  }
  if (callback) {
    for (i = 0; i < events.length; i += 1) {
      dom.on(events[i], fireCallBack)
    }
  }
  return this
}

export {animate, stop, getTranslate, transitionStart, transitionEnd, animationEnd}
