/**
 * 实现页面视图（不限表单）与数据交互
 *
 *                         【ui view与数据】
 *
 * 数据与视图交互是所有带UI界面都需实现的基本功能，不同开发框架都制定了一套固定机制。
 * 其中web前端与所有其他UI（原生ios、安卓、windows）都不一样，其开放、自由、无主，
 * 导致没有一套固定机制，不同人、不同组织提供的开发框架、方式几十上百种。
 *
 *                         【jQuery、Dom】
 *
 * 最原始，是通过jQuery或浏览器内置Dom，操作页面视图元素。
 * 优点：自由控制，可享受编程乐趣。
 * 缺点：完全手工，工作量大，效率低、容易出错，逐渐被淘汰。
 *
 *                         【vue、react、angular】
 *
 * 主流vue、react、angular通过v-dom与数据双向绑定，实现视图与数据MVVM自动更新。
 * 优点：定义好数据与视图关联关系后，修改数据即可更新视图，不用操作视图。
 * 缺点: 需要学习一套新的定义语法及MVVM体系，一旦采用，基本上会全面采用其全家桶，
 * 包括路由、UI、状态等各种库，陷入其技术竖阱。
 *
 *                             【wia view】
 *
 * 通过自然es6模板字符串，与html中的name或模板字符串，与数据对应，实现数据展示。
 * 优点：
 *   1、与三大主流类似，无需UI操作，数据直接展现，开发效率高。
 *   2、只有一个dom，没有额外的虚拟dom（vdom），运行效率高。
 *   3、以函数方式提供，自由调用，无入侵。
 *   4、无门槛，无新语法，无复杂定义，自然流畅，只需HTML，无需学习新的知识体系。
 *   5、轻便透明，无复杂封装，可直接操作视图中的元素，体验编程乐趣。
 * 缺点：
 *   1、单向绑定，视图更新无法自动更新数据，获取数据需主动调用。是缺点，也是优点。
 *   2、太过简单，无复杂理论体系，无需学习，自然上手。是优点也是缺点。
 *
 *                         【wia view 原理】
 *
 * 需要展现的数据分类：
 *   1、简单值：字符串、数字、日期、布尔值。
 *   2、简单对象：简单值组成的对象，通过字段名称区分不同值。
 *   3、值数组：简单值组成的数组。
 *   4、对象数组：对象组成的数组。
 *   5、复杂对象：对象内字段包含数组、和子对象。
 *
 *                         【api】
 *
 * 1、view方法作为wia dom中的视图扩展，调用方法与jQuery方法类似，如：
 *    _.name('fmData').setForm(data);
 *    或：
 *    _.fmData.setForm(data);
 *
 * 2、$el.setView(data)
 *   将数据展现在页面$el范围的视图上。
 *   展现关键是如何将数据放到视图对应位置。
 *   对应方式：
 *     1、name：元素 name 属性。
 *     2、name-val：指定对应元素。
 *     3、name-tp：模板，模板用于数组的复制。
 *
 *   data 作为参数r，传递到视图，视图通过模板字符串获取数值。
 *   注意，默认 data 不按字段拆分！
 *   要求按字段拆分，需将 form 设置为 true；
 *   重复数据通过id 或 _id 字段判断，新增视图时，如表格，重复id 或 _id，删除旧的，创建新的。
 *   id 作为服务器返回的字段，_id 作为客户端本地添加的自增长字段。
 *
 * 3、$el.setForm(data)
 *   用于表单，数据对象按字段拆开调用 数据视图展示。
 *   等同于 setView中的 form 参数设置为 true。
 *
 * 4、$el.getForm
 *   读取页面表单数据，返回对象 或对象数组。
 *   读取数据，需使用 input，包括隐藏域。
 *   读取时，自动将隐藏域的data对象，转换为json字符串，方便FormData 提交。
 *
 * 5、$el.getView
 *   读取指定视图的val值，如有data，则返回data。
 *   如非Form表单，需将数据放到该元素 data 属性。
 *
 * 6、$el.clearView
 *   清除视图数据。
 *   清除带name属性元素值。
 *   删除name-tp模板复制产生名称为xxx-data元素。
 *
 * 7、$el.clearForm
 *   清除表单中 input、textarea值。
 *   删除name-tp模板复制产生名称为xxx-data元素。
 *
 * 8、$el.setViews
 *   setView目前未实现子对象按字段拆分展示（子对象直接作为参数展示）。
 *   setViews 按对象字段分别 setView。
 *   比如页面有三个视图，a、b、c，通过 {a:v1,b:v2,c:v3}，等于调用了三次setView。
 *
 *
 *                         【页面模板定义】
 *
 * 1. 简单数据直接填入 input的value。
 *   复杂数据，如对象、数组等，则填入 隐藏域 的data 对象。
 *   隐藏域（hidden）用于收集数据。并通过模板实现复杂数据展示。
 *
 * 2、页面模板定义：
 *   setView 不分解对象属性，将对象整体直接作为r参数传入页面。
 *   页面可使用${r.a}来引用该值。支持子对象${r.a.b}。
 *   ${r.a} 为es6中标准模版字符串，支持运算、变量。
 *
 * 3、图片src，模板需使用src-tp="http://${r.url}"，渲染时自动改为src。
 *   直接使用src浏览器会下载http://${r.url}，这个资源肯定找不到。
 *
 * 4、可复制模板：name-tp，一般传入对象数组或对象，用于拷贝赋值，模板自身隐藏。
 *   复制的元素名称为：name-data。
 *
 * 5、空数据，一般提供 name-empty元素，用于展示清空数据或初始无数据时展示，有数据时隐藏。。
 *
 * 6、key-value 键值对。
 *   属性tp="kv"，表示key-value键值对，对应模板中的${r.k} ${r.v}，用于同时引用对象属性名称及值。
 *   属性tp="kv-3"，表示三列。
 *   如：${r.k1} ${r.v1} ${r.k2} ${r.v2} ${r.k3} ${r.v3}
 *   对应对象中的第一个、第二个、第三个属性。
 *   用于横向多列对象多属性展现，比如 PC版本订单详情，横向3列。
 *
 * 7、名称：name-val：直接按模板替换，与名称为 name效果等同。
 *
 * 8、名称：name：如果内部有 ${字符，则视为直接替换模板，类似 name-val。
 */

/** @type {*} */
const {$} = window

/**
 * 视图数据展现
 * setViews 调用了 setView，为setView的批量操作
 * 数据内的元素，支持数组、对象，一次性实现整个容器的数据展现
 * 根据数据项名称，自动查找页面对应input（按名称） 或 视图层（name 或 name-tp），实现数据展现
 * 调用该方法的容器一般是 Form，也支持非Form，如 div
 * 容器中的节点， 一般是input， 也支持非input，通过对象属性名称对应dom名称实现匹配展现
 * 如果数据为数组，则使用调用者同名模板，生成多节点，
 * field、input隐藏域带模板，会按模板生成字段部分展现
 * 模板名称为 name-tp，根据模板添加后的节点名称为 name-data
 * @param {*} v 数据
 * @param {*} n 模板名称，可选，如果不填，默认调用者的name
 * 注意，setViews的模板与setView中的模板不一样
 * setViews 模板先调用clone克隆模板节点，不赋值，后续再调用 setView 进行赋值。
 * 意味着 setViews 中的模板里面可以再嵌套字段模板。
 * setView中的模板，使用带${r.name}这种插值模板，根据后台r数据，生成带数据值的 html。
 * @param {*} add 新增，可选
 */
function setViews(v, n, add = false) {
  try {
    const el = this
    // 清空所有数据，填充新数据
    if (!add) clearForm.bind(el)()

    if (!n) n = el.attr('name')

    // 使用模板
    if (n) {
      const tp = el.name(`${n}-tp`)
      if (tp.length) {
        tp.hide()
        if ($.isArray(v))
          v.forEach(r => {
            addSet.bind(el)(n, r)
          })
        else addSet.bind(el)(n, v)
      } else Object.keys(v).forEach(k => setView.bind(el)(v[k], k))
    } else if ($.isObject(v))
      // 非模板
      Object.keys(v).forEach(k => setView.bind(el)(v[k], k))
  } catch (ex) {
    console.error('setViews exp.', {msg: ex.message})
  }
}

/**
 * 向 view 中添加值
 * @param {*} el 容器
 * @param {*} k 字段名称
 * @param {*} v 新增数据
 */
function addViews(v, n) {
  const el = this
  if (!n) n = el.attr('name')
  setViews.bind(el)(v, n, true)
}

/**
 * 读取整个页面表单数据，返回对象 或对象数组
 * 需要被读取的数据，需使用 input，包括隐藏域，否则无法被读取
 * 读取时，自动将所有隐藏域的data对象，转换为字符串，方便FormData 提交服务器。
 * @param {*} n 模板名称，不填与容器名称相同，可选参数
 */
function getForm(n) {
  let R = null
  try {
    const el = this
    // 将data存入 value，方便FormData读取
    el.find('input[type=hidden]').forEach(d => {
      if (!$.isEmpty(d.data)) d.value = JSON.stringify(d.data)
    })

    if (!n) n = el.attr('name')

    // 对象列表表单，需删除模板，避免模板数据干扰数据获取
    const tp = el.name(`${n}-tp`)
    let prev = null
    let hasTp = tp.length
    if (hasTp) {
      hasTp = true
      prev = tp.prev()
      tp.remove()
    }

    // 读取整个表单输入数据
    const fd = new FormData(el.dom)
    // 还原模板
    if (hasTp) tp.insertAfter(prev)

    const rs = []
    let last = null
    let r = {}
    // eslint-disable-next-line no-restricted-syntax
    for (const e of fd.entries()) {
      const k = e[0]
      if (!last) last = k
      else if (last === k) {
        if (!$.isEmpty(r)) rs.push({...r})
        r = {}
      }
      let v = e[1]
      // 还原对象
      try {
        if (/^\s*[{[]/.test(v)) v = JSON.parse(v)
      } catch (ex) {
        console.error('getForm exp.', {msg: ex.message})
      }
      r[k] = v
    }

    if ($.hasVal(r)) rs.push(r)
    if (rs.length === 1) [R] = rs
    else if (rs.length > 1) R = rs
  } catch (ex) {
    console.error('getForm exp.', {msg: ex.message})
  }

  return R
}

/**
 * 清除表单
 */
function clearForm() {
  try {
    const el = this
    // 清除input值
    const es = el.find('input,textarea')
    es.forEach(e => {
      if (e.data) {
        e.data = null
        delete e.data
      }
      if (e.type !== 'checkbox') e.value = ''
    })

    // 清除 模板数据
    el.find('[name$=-data]').remove()
    el.find('[name$=-empty]').show()
  } catch (e) {
    console.error(`clearForm exp:${e.message}`)
  }
}

/**
 * 根据页面模板，设置视图数据
 * 模板为同名节点或tp模板
 * 数据支持两维数组、对象、对象数组等
 * 参数选项：opts: {
 *  add：是否新增
 *  name：指定视图名称，默认为当前Dom对象
 *  idx：数组索引
 *  form: 是否为表单，默认 false
 * }
 * 在Form表单中，一般用input来存放字符串值，如使用模板，input type 必须为 hidden
 * 在非Form中，没有input，同名dom，或者名称-tp为插值模板，将对象数据与模板匹配展示数据
 * tb.setView(data); // 数据
 * tb.setView(arr, 0); // 数组，第一列为id
 * tb.setView(arr, 0, 模板名称); // 数组，第一列为id
 * tb.setView(obj, 模板名称); // 可省略，省略调用者name为模板名称
 * tb.setView(arr, 0, 模板名称, add); // 第一列为id
 * tb.setView(obj, 模板名称, add); // 第一列为id, 对象数据，指定模版名称
 * @param {*} v 数据，必选
 * @param {Number} idx 数组id列序号，可选
 * @param {string} name 数据展现视图元素名称，缺省为调用者元素名称，可指定其他名称，无名称不工作
 * @param {*} add 重置还是新增，重置会清除数据项，默认为重置
 */
// function setView(v, idx = -1, name = '', add = false) {
function setView(v, ...args) {
  let R = false
  const _ = this
  try {
    if (v === undefined || v === null) return false

    const last = args?.at(-1)
    // signal 对象，创建响应式自带刷新View
    if (last === '_SIGNAL_CALL_') args.pop()
    else if ($.signal && $.isSignal(v)) {
      $.effect(() => {
        const arg = [...args]
        arg.push('_SIGNAL_CALL_')
        setView.bind(_)(v, ...arg)
      })
      return
    }

    const el = this
    let add = false
    let idx = -1
    // 表单视图
    let form = false
    let name = el.attr('name') // 数据展现元素，缺省为调用者自身

    // 复合参数，兼容多参数
    if (args.length) {
      // opts
      if ($.isObject(args[0])) {
        const def = {add, name, idx, form}
        const opt = {...def, ...args[0]}
        ;({add, name, idx, form} = opt)
      } else if ($.isArray(v) && $.isNumber(args[0])) {
        // eslint-disable-next-line
        if (args.length >= 1) idx = args[0]
        // eslint-disable-next-line
        if (args.length >= 2 && $.isString(args[1])) name = args[1]
        // eslint-disable-next-line
        if (args.length >= 3 && $.isBool(args[2])) add = args[2]
      } else {
        // if ($.isObject(v) && $.isBool(args[0])) add = args[0];
        // eslint-disable-next-line
        if (args.length >= 1) {
          if ($.isString(args[0])) name = args[0]
          else if ($.isBool(args[0])) add = args[0]
        }
        // eslint-disable-next-line
        if (args.length >= 2 && $.isBool(args[1])) add = args[1]
      }
    }

    // 查找是否包含 input
    // if (el.nodeName.toLowerCase() === 'form' || el.find('input,textarea').length) from = true;

    // 清除视图数据
    if (!add) {
      if (form) clearForm.bind(el)()
      clearView.bind(el)(name)
    }

    // 表单，需将对象拆开，按字段名称逐项赋值
    if (form && $.isObject(v)) {
      Object.keys(v).forEach(k => setData.bind(el)(k, v[k]))
    } else if (name) R = setData.bind(el)(name, v, idx) // 没有指定name的dom，可通过name-tp、name-val等模板赋值
  } catch (ex) {
    console.error('setView exp.', {msg: ex.message})
  }
  return R
}

/**
 * 单向数据绑定，数据变化，视图自动更新
 * @param {*} v 数据，必选
 * @param {Number} idx 数组id列序号，可选
 * @param {string} name 数据展现视图元素名称，缺省为调用者元素名称，可指定其他名称，无名称不工作
 * @param {*} add 重置还是新增，重置会清除数据项，默认为重置
 */
function bindView(v, ...args) {
  let R
  const _ = this
  if (!$.signal) return

  try {
    const sig = $.signal(v)
    $.effect(() => {
      setView.bind(_)(sig, ...args)
    })
    R = sig
  } catch (e) {
    console.error(`bindView exp:${e.message}`)
  }

  return R
}

/**
 * 表单赋值
 * @param {*} v
 * @param {*} opts
 */
function setForm(v, opts) {
  const opt = opts || {}
  opt.form = true

  setView.bind(this)(v, opt)
}

/**
 * 表单赋值
 * @param {*} v
 * @param {*} opts
 */
function bindForm(v, opts) {
  let R
  const _ = this

  try {
    if (!$.signal) return

    const opt = opts || {}
    opt.form = true
    const sig = $.signal(v)
    $.effect(() => {
      setView.bind(_)(sig, opt)
    })
    R = sig
  } catch (e) {
    console.error(`bindView exp:${e.message}`)
  }

  return R
}

/**
 * 向 field 中添加值
 * tb.setView(d);
 * tb.setView(arr, 0); // 第一列为id
 * tb.setView(arr, 0, 模板名称); // 第一列为id
 * tb.setView(obj, 模板名称); // 第一列为id
 * tb.setView(arr, 0, 模板名称); // 第一列为id
 * tb.setView(obj, 模板名称); // 第一列为id
 * @param {*} v 数据
 * @param {*} n 视图名称，缺省为调用者name
 */
function addView(v, ...args) {
  const el = this
  setView.bind(el)(v, ...args, true)
}

/**
 * 清除视图数据
 * @param {string=} n 视图名称
 */
function clearView(n) {
  try {
    const el = this
    if (!n) n = el.attr('name')

    // 清除input值
    const es = el.names(n)
    es.forEach(e => {
      if (e.tagName.toLowerCase() === 'input' || e.tagName.toLowerCase() === 'textarea') {
        if (e.data) {
          e.data = null
          delete e.data
        }
        if (e.type !== 'checkbox') e.value = ''
      }
    })

    // 清除 模板数据
    el.names(`${n}-data`).remove()
    el.name(`${n}-empty`).show()
  } catch (e) {
    console.error(`clearView exp:${e.message}`)
  }
}

/**
 * 读取指定视图数据，返回 仅仅包含 指定视图的值，如果有data，则返回 对象
 * 读取时，自动将隐藏域的data对象，转换为字符串，方便FormData 提交服务器。
 * @param {*} n 视图名称
 */
function getView(n) {
  let R = null
  try {
    const el = this
    if (!n) n = el.attr('name')
    const d = el.name(n)
    if (d.length) {
      if ($.hasVal(d.data)) R = d.data
      else R = d.val()
    }
  } catch (ex) {
    console.error('getView exp.', {msg: ex.message})
  }

  return R
}

/**
 * 删除 chip，更新隐藏域，方便获取 chip 值
 * @param {*} e
 */
function removeChip(e) {
  console.log('removeChip', {e})

  const el = $(e.target).closest('.chip')
  if (el && el.length > 0) {
    let id = el.data('id')
    if (!id) id = el.data('_id')

    // 更新隐藏域
    const n = el.prevNode('input[type=hidden]')
    el.remove()
    if (n && n.length > 0) {
      id = n
        .val()
        .replace(new RegExp(`${id}\\s*,?\\s*`), '')
        .replace(/\s*,\s*$/, '')
      n.val(id)
    }
  }
}

/**
 * 根据模板添加 form 数据集
 * 内部函数，被setViews调用
 * @param {*} n 模板名称
 * @param {*} v 数据对象
 */
function addSet(n, v) {
  try {
    const el = this
    const tp = el.name(`${n}-tp`)
    if (tp.length) {
      tp.hide()
      const p = tp.clone()
      p.insertBefore(tp)
      Object.keys(v).forEach(k => {
        setView.bind(p)(v[k], k)
      })
      p.attr('name', tp.attr('name').replace('-tp', '-data')).show()
    }
  } catch (ex) {
    console.error('addSet exp.', {msg: ex.message})
  }
}

/**
 * 使用数据渲染模板字符串，使用 r 参数，替换模板代参，生成展示html视图
 * 替代 eval，减少安全漏洞，eval 会带入了所有内存上下文变量，导致数据泄露！
 * @param {*} tp 模板
 * @param {*} r 数据
 * @returns 返回html
 */
function render(tp, r) {
  const code = `function(r){return \`${tp}\`}`
  // eslint-disable-next-line no-new-func
  return Function(`"use strict";return (${code})`)()(r)
}

/**
 * 根据模板，添加数据节点
 * 添加前，根据id 或 _id，删除相同已加载数据节点，避免重复添加
 * 内部函数，被 setData 调用
 * @param {*} tp 模板
 * @param {*} n 字段名称
 * @param {*} r 数据，对象 或 值
 * @param {*} ns 已经存在的数据节点，避免重复添加
 * @param {Number} idx 数组中作为id的序号，从0开始，-1表示没有
 */
function addData(tp, n, r, ns, idx = -1) {
  try {
    if (!tp) return

    // 对象、数组可能存在id、_id
    const isObj = $.isObject(r)
    const isArr = $.isArray(r)

    let id
    let _id
    if (isObj) {
      id = r.id
      _id = r._id
    } else if (isArr) {
      if (idx > -1) id = r[idx]
    } // 普通值直接作为_id
    else _id = r

    // 通过id、_id删除重复节点
    if ((id !== undefined || _id !== undefined) && ns?.length) {
      const ds = ns.filter((i, n) => {
        const $n = $(n)
        return (id && $n.data('id') == id) || (_id && $n.data('_id') == _id)
      })

      if (ds.length) ds.remove()
    }

    // 通过模板与r结合，生成页面html
    const $n = $(
      render(tp.dom.outerHTML, r)
        .replaceAll('undefined:', '')
        .replaceAll('undefined：', '')
        .replaceAll('undefined', '')
    )
    if (id !== undefined) $n.data('id', id)
    else if (_id !== undefined) $n.data('_id', _id)
    $n.attr('name', `${n}-data`).insertBefore(tp).show()
  } catch (ex) {
    console.error('addData exp.', {msg: ex.message})
  }
}

/**
 * 视图赋值
 * 优先节点名称表单value赋值：input、hidden、select、checkbox、radio、textarea
 * 然后继续对模板继续赋值：-tp、-val 和内部包含 ${ 模板特殊字符串的视图赋值！
 * 使用-tp模板或name的html作为模版，xxx-val 不判断 ${直接覆盖，
 * xxx 判断内部是否有 ${，如果有，则视为模板，进行模板替换。
 * 加载数据到页面，模板值请使用 ${r} 或 ${r.xx}
 * img 的 $src 改为 src
 * 内部函数，被 setField 调用，只管模板，不管input 和 form
 * 在非 form 和 input环境可用
 * @param {*} n 模板名称，组件name="n-tp"，n为模板名称
 * @param {*} v 数据，对象或者对象数组
 * @param {Numver} idx 指定数组id列序号，v 为数组时有效
 */
function setData(n, v, idx = -1) {
  try {
    if (!n) return false // 没有名称不工作

    const el = this // 容器

    // 查找名称节点
    const $d = el.name(n) // 包含容器自身

    // 名称节点赋值优先！
    // 容器内查找字段名称对应组件进行赋值，支持select、radio、checkbox，Dom的val已经支持，这里可直接调用val即可！
    if ($d.length > 0) {
      const d = $d.dom
      // console.log('setView', {type: d.type});
      // null undfined 转换为空
      v = v ?? ''
      if (v === 'null' || v === 'undefined') v = ''

      if (d.tagName.toLowerCase() === 'textarea') $d.val(v)
      // d.type === 'select-one' || d.type === 'select-multiple' ||
      else if (d.tagName.toLowerCase() === 'select') $d.val(v)
      // input 赋值
      else if (d.tagName.toLowerCase() === 'input') {
        if (d.type === 'text') setInput.bind(el)(n, v)
        else if (
          [
            'date',
            'time',
            'month',
            'week',
            'datetime',
            'datetime-local',
            'email',
            'number',
            'search',
            'url',
          ].includes(d.type)
        )
          $d.val(v)
        // 隐藏域，一般带同名模板，数据为数组或对象，不使用隐藏域也可以展示对象数据，使用隐藏域便于收集数据提交
        else if (d.type === 'hidden') {
          setInput.bind(el)(n, v)
          // setData.bind(el)(n, v); // 后续继续执行模板部分！
          // 触发 input的 onchange 事件，hidden 组件数据变化，不会触发onchange
          // 这里发起change事件，方便其他组件接收事件后，实现UI等处理
          // 其他接受change事件的组件，不能再次触发change，否则导致死循环
          $d.change()
        } else if (d.type === 'checkbox' || d.type === 'radio') {
          $d.val(v, el)
        }
      }
    }

    // 继续${} 模板字符串替换赋值：-tp、-val、和内部包含${特征字符串的内容赋值
    if ($.isEmpty(v)) return false

    // 查找数据模板，按模板增加数据，模板优先 name
    const tp = el.name(`${n}-tp`)
    // 有模板，使用模板添加数据，通过id或_id避免重复添加
    if (tp.length) {
      tp.hide()
      let kv = false // key value
      const tpa = tp.attr('tp')
      if (tpa === 'kv' || /kv-\d+/.test(tpa)) kv = true
      let empty = el.names(`${n}-data`).length === 0
      // chip
      const d = el.name(n).dom
      // 如果 input存在，优先获取 input 中的 data
      if (d && d.type === 'hidden') {
        const val = d.value
        if (!$.isEmpty(d.data)) v = d.data
        else if (val) {
          v = val
          if (val.indexOf(',') > -1) v = val.split(',')
        }
      }

      // 已经存在的数据视图，新增时，需删除后新增，避免重复
      const ns = el.names(`${n}-data`)

      // 数组，两维数组，对象数组
      if ($.isArray(v))
        v.forEach((r, x) => {
          if (r) {
            empty = false
            addData.bind(el)(tp, n, r, ns, idx) // 二维数组，模板中通过 r[0] r[1] 引用数据
          }
        })
      else if ($.isObject(v) && kv) {
        const ks = Object.keys(v)
        if (ks.length) {
          empty = false
          const ms = /kv-(\d+)/.exec(tpa)
          if (!ms) {
            ks.forEach(vk => {
              if (v[vk]) {
                addData.bind(el)(tp, n, {k: vk, v: v[vk]}, ns, idx)
              }
            })
          } else {
            const kn = ms[1]
            let ik = 0
            // 取模存值
            const mks = []
            const mvs = []
            let m = 0
            ks.forEach(vk => {
              ik++
              mks.push(vk)
              mvs.push(v[vk] ?? '')

              // 取模
              m = ik % kn
              // id >= kn
              if (m === 0) {
                const md = {}
                mks.forEach((mk, mi) => {
                  md[`k${mi + 1}`] = mks[mi]
                  md[`v${mi + 1}`] = mvs[mi]
                })
                console.log('setData', {md})
                addData.bind(el)(tp, n, md, ns, idx)
                mks.length = 0
                mvs.length = 0
              }
            })

            if (m > 0) {
              const md = {}
              mks.forEach((mk, mi) => {
                md[`k${mi + 1}`] = mks[mi]
                md[`v${mi + 1}`] = mvs[mi]
              })
              console.log('setData', {md})
              addData.bind(el)(tp, n, md, ns, idx)
              mks.length = 0
              mvs.length = 0
            }
          }
        }
      } else if (v) {
        empty = false
        addData.bind(el)(tp, n, v, ns, idx)
      }

      // 父元素上侦听，点击删除
      if (tp.hasClass('chip')) {
        const p = tp.parentNode()
        p.off('click', removeChip)
        p.click(removeChip)
      }

      // img src-tp replace src
      const imgs = tp.find('img[src-tp]')
      el.find('img[src-tp]').forEach(img => {
        if (imgs.length === 0 || imgs.indexOf(img) === -1) {
          const $img = $(img)
          $img.attr('src', $img.attr('src-tp'))
          $img.removeAttr('src-tp')
        }
      })

      // 如果数据节点为空，则显示空节点（存在则显示）
      if (empty) el.name(`${n}-empty`).show()
      else el.name(`${n}-empty`).hide()
    } else {
      // 没有-tp模板，查找-val，直接覆盖
      const r = v
      const vp = el.name(`${n}-val`)
      if (vp.length) {
        const tx = vp.html()
        if (r && tx.indexOf('${') > -1) {
          vp.html(
            render(tx, r)
              .replaceAll('undefined:', '')
              .replaceAll('undefined：', '')
              .replaceAll('undefined', '')
          )
          // img $src replace src
          vp.find('img[src-tp]').forEach(n => {
            const $n = $(n)
            $n.attr('src', $n.attr('src-tp'))
          })
        } else if (r) vp.html(r)
      } else {
        // 没有-tp和-val，获取name为k的视图，如果内部有${，按模板覆盖内容
        // const $d = el.name(`${n}`);
        if ($d.length && $d.dom.type !== 'text') {
          const tx = $d.html()
          if (r && tx?.indexOf('${') > -1) {
            $d.html(
              render(tx, r)
                .replaceAll('undefined:', '')
                .replaceAll('undefined：', '')
                .replaceAll('undefined', '')
            )
            // img $src replace src
            $d.find('img[src-tp]').forEach(img => {
              const $img = $(img)
              $img.attr('src', $img.attr('src-tp'))
            })
          }
        }
      }
    }
  } catch (ex) {
    console.error('setData exp.', {msg: ex.message})
  }
}

/**
 * input 赋值时设置数据，自动去重
 * 内部函数，被 setInput调用
 * @param {*} n input Dom 实例
 * @param {*} v 值
 * @param {*} org 原来的值
 */
function getValue(n, v, org) {
  let R = v

  try {
    // 对象需判断是否重复
    if ($.isObject(v)) {
      if ($.isObject(org)) {
        if ((org.id && org.id == v.id) || (org._id && org._id == v._id)) R = v
        else R = [org, v]
      } else if ($.isArray(org)) {
        const rs = org.filter(
          o => (!o.id && !o._id) || (o.id && o.id != v.id) || (o._id && o._id != v._id)
        )
        if (rs.length) {
          rs.push(v)
          R = rs
        }
      }
    } else {
      // 值变量，直接使用 value 字符串方式存储
      let val = `${org},${v}`
      // 去重
      if (val.indexOf(',') > -1) val = Array.from(new Set(val.split(','))).join(',')
      R = val
    }
  } catch (e) {
    console.error('getValue exp.', {msg: e.message})
  }
  return R
}

/**
 * 设置 input 的值
 * 如果带id，则检查是否已存在，避免重复添加
 * @param {*} n 字段名称
 * @param {*} v 值，接受字符串、对象 和 对象数组
 * 对象、对象数组 赋值到 data，值，值数组，赋值到 value
 */
function setInput(n, v) {
  try {
    const el = this
    const d = el.name(n)
    if (!d.length) return

    if ($.isEmpty(v)) return

    // 没有id 和 _id，自动添加 _id，避免重复添加
    if ($.isObject(v) && v.id === undefined && v._id === undefined) v._id = $.num()
    else if ($.isArray(v)) {
      v.forEach(r => {
        if ($.isObject(r) && r.id === undefined && r._id === undefined) r._id = $.num()
      })
    }

    let org = d.dom.data
    if (!org) {
      org = d.val()
      // 隐藏域，从字符串还原对象，保存到 dom.data
      if (d.dom.type === 'hidden' && /\s*[{[]/g.test(org)) {
        try {
          org = JSON.parse(org)
          d.dom.data = org
          d.val('')
        } catch (e) {
          console.error('setInput exp.', {msg: e.message})
        }
      }
    }

    if ($.isEmpty(org)) {
      if ($.isVal(v)) d.val(v)
      else if ($.isArray(v) && $.isVal(v[0])) d.val(v.join(','))
      else d.dom.data = v
    } else {
      if ($.isArray(v)) {
        v = v.reduce((pre, cur) => getValue(d, cur, pre), org)
        if ($.hasVal(v) && $.isArray(v)) {
          v = Array.from(new Set(v))
        }
      } else v = getValue(d, v, org)

      if ($.hasVal(v)) {
        if ($.isVal(v)) d.val(v)
        // 值 数组
        else if ($.isArray(v) && $.isVal(v[0])) d.val(v.join(','))
        else d.dom.data = v
      }
    }
  } catch (ex) {
    console.error('setInput exp.', {msg: ex.message})
  }
}

// export const fn = {
export {
  setViews,
  addViews,
  setView,
  bindView,
  addView,
  clearView,
  getView,
  setForm,
  bindForm,
  getForm,
  clearForm,
}

// test
// Object.keys(fn).forEach(k => ($.fn[k] = fn[k]));
