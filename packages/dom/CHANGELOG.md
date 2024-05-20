# Change Log

## 2023-08-13

- fn.js
  on 修正 liveHandler 中 this 错误
	fn.apply(n, param); // this、sender 指向符合选择器元素
	->
	fn.apply(el, param); // this、sender 指向符合选择器元素

## 2022-04-17

- function val(value, el)
	与 jQuery兼容，支持函数和数组
	在jQuery基础上，增加了对 多选、checkbox和radio的支持！

 * 表单节点值的获取、设置
 * 获取时，只获取第一个dom对象value
 * 设置时，对节点数组同时设置
 * 支持 select单选、多选，checkbox，radio
 * @param {*} value 值
 * value 为Dom对象时，表示节点容器，带容器参数时，支持容器内radio、checkbox有效值获取
 * @param {*} el 节点容器，带容器参数时，支持容器内radio、checkbox赋值
 * @returns
 */

- function bindName()
	Page的Ready中已经对动态加载页面做了名称绑定。
	如在 Ready中增加动态内容，则需重新绑定。

/**
 * name 属性组件直接绑定到当前Dom实例，方便调用
 * 只挂载一个，多个同名name，最后一个起作用，因此一个页面内，name不要重复
 * 同节点多次调用不覆盖，同名不同dom节点，覆盖
 * 覆盖后，原直接节点属性的 bind 会失效，需使用新的$dom重新bind
 * 动态内容一般在 ready 中创建，创建后name没有自动挂载，需调用 bindName 实现挂载！
 */

## 2022-01-24

### view

- setForms -> setViews
- :: -> bind 不是ES正式规范，swc 不支持
- addForms -> addViews
- setTpForm -> addSet 根据模板添加 form 数据集



## 2022-01-05

### fn.js

- attr 与 jQuery 兼容，支持函数和对象
- removeAttr 与 jQuery 兼容，支持多个属性（空格隔开）
- prop 与 jQuery 兼容，支持函数和对象
- \+ removeProp
- touchEnd 阻止 click 穿透事件
  e.preventDefault(); // 必须阻止后续的 onclick 事件
- replaceWith 替换节点，== 插入后删除当前节点
- html 与 jQuery 兼容，支持函数
- \+ pluck 采集节点（数组）属性
- text 兼容 jQuery，支持函数
- atts 按属性查找节点
-

### view.js

- form.js 更名为 view.js
- addData 增加 idx，数组中作为 id 的序号，从 0 开始，-1 表示没有
- setData 增加 idx，指定数组 id 列序号
- setView 动态参数，增加 idx，指定数组 id 列序号
  ```js
  tb.setView(d);
  tb.setView(arr, 0); // 第一列为 id
  tb.setView(arr, 0, 模板名称); // 第一列为 id
  tb.setView(obj, 模板名称); // 第一列为 id
  tb.setView(arr, 0, 模板名称, add); // 第一列为 id
  tb.setView(obj, 模板名称, add); // 第一列为 id
  @param {_} v 数据
  @param {Number} idx 数组 id 列序号，可选
  @param {_} n 视图名称，缺省为 dom 对象 name 属性，dom 容器如无 name，参数 n 不传，则不工作。
  @param {\*} add 重置还是新增，重置会清除数据项，默认为重置
  function setView(v, ...args)
  ```
- addView 增加 idx，指定数组 id 列序号
  ```js
  tb.setView(d);
  tb.setView(arr, 0); // 第一列为 id
  tb.setView(arr, 0, 模板名称); // 第一列为 id
  tb.setView(obj, 模板名称); // 第一列为 id
  tb.setView(arr, 0, 模板名称); // 第一列为 id
  tb.setView(obj, 模板名称); // 第一列为 id
  @param {\*} v 数据
  @param {\*} n 视图名称，缺省为调用者 name
  function addView(v, ...args)
  ```

## 2021-12-16

### fn.js

- \* touchStart 抑制 click 事件，避免事件穿透
- \+ position
- \+ offsetParent
- \* not bug
- \+ slice
- \* eq 支持负数
- \+ fist
- \+ last
- \* empty this.innerHTML = '' 提高效率

### form.js

- setForm setVeiws
- addForm addViews
- 自动隐藏模板
- 处理未定字符串
  .replaceAll('undefined:', '')
  .replaceAll('undefined：', '')
  .replaceAll('undefined', '')

- 修正 kv 序号，从 1 开始
- 修正 n 重复命名 bug

### scroll.js

- 增加注释
- 参考 zepto
- \+ scrollHeight
- \+ scrollWidth

## 2021-11-14

### dom

fn.js

- \+ get(idx) 转为节点数组，或指定索引节点
- \* toArray()
- \+ size()
- \+ concat 返回数组
- \+ not(sel) 排除 dom 节点
- \* filter 过滤符合要求的 dom 节点的 Dom 对象
- \* map
- \* is
- \* find 支持对象参数

  append,
  appendTo,
  prepend,
  prependTo,
  insertBefore,
  insertAfter,
  采用 zepto 方式，在 index 中生成

index.js
生成以下函数
append,
appendTo,
prepend,
prependTo,
insertBefore,
insertAfter,
修正 tr 等表内元素添加失败 bug。
表内元素，不能加入到 div，需加入到 table 节点中。

## 2021-09-12

### dom

- index.js
  删除 eventShortcuts 文件，直接使用代码完成事件快捷封装，增加 load 等快捷事件。

```js
'load,unload,dblclick,select,error,click,blur,focus,focusin,' +
'focusout,keyup,keydown,keypress,submit,change,mousedown,mousemove,mouseup,' +
'mouseenter,mouseleave,mouseout,mouseover,touchstart,touchend,touchmove,resize,' +
'scroll,swipe,press').split(',').forEach(function (event) {}
```

- form.js 支持属性 tp="kv-3"
  ${r.k1} ${r.v1} ${r.k2} ${r.v2} ${r.k3} ${r.v3} 对应对象中的第一个、第二个、第三个属性，用于横向多列对象多属性展现，比如 PC 版本订单详情，横向 3 列。
- fn.js 修正 append/prepend bug。
  同一个 dom 加载到其他 div，自动从原层删除，移动到新层，原 dom 无需删除。
  删除会导致 dom 在新的层不存在。
  find ~开头，按 name 属性查找，
  qu 失败，返回$([])
  att 失败，返回$([])
  clas(class) 'aaa, bbb' => '.aaa, .bbb', 'i.icon' => 'i.icon'
  clas getElementsByClassName 改为 querySelector
  clas as class,
  clases -> classes, querySelectorAll

## 2021-07-29

### 点击事件无效

- 问题
  跟踪代码，发现在 pc 浏览器 Support.touch 为 true，导致 click 事件无效。
  https://cos.wia.pub/wiajs/base.js?t=116 版本 Support.touch 为 true
  https://cos.wia.pub/wiajs/base.js?t=117 版本 Support.touch 为 false
- 解决
  cos.wia.pub CDN 缓存设置中，将【缓存键规则配置】中的忽略参数设置为【全部忽略】，
  避免版本更新时，不同参数，导致不同版本。
- 未来
  暂未支持不同版本同时并存，将来应该支持，避免版本更新导致兼容性问题！

## 2021-07-18

### dom

fn.js

- \+ upper 等同于 closest，upper，向上查找符合要求的节点，upper 更好理解。
- \+ child 如果传入 Dom 对象，则替换节点子对象，否则获取符合条件的首个直属子节点。
- \- childNode 获取符合条件的首个直属子节点，被 child 替换。

## 2021-07-11

build.js

- terser 更新版本后，调用改为异步，使用 await。
  const { minify } = require('terser');
  需更新 terser 到最新版本。

### dom

form.js

- \* setField 改为 setView，参数与 setForm 类似
- \* addField 改为 addView，参数与 addForm 类似
- \* clearField 改为 clearView
- \* getField 改为 getView

## 2020-07-27

dom

form

- setData
  xx-val 类似 xx-tp，值替换，直接覆盖。

## 2020-07-10

\$.js

- clearClass
- replaceClass
- isNumeric
  修正 jQuery new Date() 判断为 数字问题。
- date
  修正增加日期错误

ajax.js

- parseError
- parseSuccess
  返回数据优先按 JSON 解析为对象，方便处理
- get(url, param, header)
  param 支持对象类型
  支持 header，便于将 token 放入 header 中
- post(url, data, header)
  支持 header，便于将 token 放入 header 中
  非 FormData 的对象，Content-type 设置为 application/json

dom

fn.js

- firstChild 修正 bug
- lastChild 修正 bug

form.js

- 'date',
  'time',
  'month',
  'week',
  'datetime',
  'datetime-local',
  'email',
  'number',
  'search',
  'url'
  这些类型直接赋值
- clearField
  修正取出模版数据 bug

## 2020-06-06

base

\$.js

增加一些判断

- $.isObj = $.isObject;
- \$.isValue 值类型
- $.isVal = $.isValue;
- $.isFun = $.isFunction
- $.isDoc = $.isDocument
- $.isPlain = $.isPlainObject
- $.isNum = $.isNumeric
- $.isStr = $.isString
- $.num = $.uniqueNumber

格式化日期字符串

- \+ $.date
  $.date('yyyy-MM-dd hh:mm:ss')
  $.date('', 3) 当前日期加三天
  $.date('', -3) 当前日期减三天

非常用功能，放入 util

- \$.trimStart
- \$.trimEnd

dom

fn.js

- parents
  fixbug
- findNode
  fixbug

form.js

- setForm
  增加清除功能
- setField
  增加清除功能
  支持 textarea
- \+ addField
- addData
  细致 id \_id bug
  根据 id \_id 自动添加到 data-id 或 data-\_id 属性，防止重复添加
- setValue 更名为 getValue
  修正 id \_id 判断 bug
  返回数据，不写入
- setInput
  没有 id 和 \_id，自动添加 \_id，避免重复添加
  数组，使用 reduce，叠加去重返回新的数组，写入
- \+ clearForm
  清除表单
- \+ clearField
  清除字段
- getForm
  如果 隐藏域 字符串 以 { 或 [ 开头，还原成对象

## 2020-06-03

dom

\+ form.js

实现页面与数据交互

1. 简单数据直接填入 input 的 value
2. 复杂数据，如对象、数组等，则填入 隐藏域 的 data 对象，
   并通过页面模板实现复杂数据展示。
3. 数据输出到页面，通过以下函数：
   setForm 对整个页面，比如 Form 表单，进行数据输出
   addForm 增加数据
   setField 对单个字段，进行数据输出，如果为空，则清除
   addField 单个字段，增加数据
4. 读取页面数据
   getForm 读取整个页面数据，返回 FormData 对象
   getField 读取指定字段数据，返回 仅仅包含 指定字段的 FormData 对象
   读取时，自动将所有隐藏域的 data 对象，转换为字符串，方便 FormData 提交服务器。
5. 对于重复 name 的 input，一般是对象数组，自动转换为对象数组，存入 FormData，
   方便服务器处理。
6. 重复数据通过 id 和 \_id 字段判断，addField 时，重复 id 或 \_id，删除之前的对象，
   仅保存新增的对象。
   id 作为服务器返回的字段，\_id 作为客户端添加的字段，
   getForm 或 getField 时，自动删除，不返回给服务器，避免影响服务器数据。
7. 以上方法 绑定到 \$.fn 中，使用时，按 Dom 类似方法使用，如：
   \_.name('fmDta').setForm(data);

fn.js

- parentNode
  fixbug

base

\$.js

- \$.isEmpty
  空字符串也作为空判断
- \+ \$.hasVal
  判断不为 null、不为 undefined、不为空，数组、对象有值
- \+ \$.isString
  判断是否为字符串
- \+ \$.trimStart
  去除字符串头部空格或指定字符
- \+ \$.trimEnd
  去除字符串尾部空格或指定字符

component

- listNav
  \+ \_.emit('local::click listNavClick', e);
  导航触发 indexSelect 事件
- uploader
  优先获取 input 对象的 data 属性

## 2020-05-30

base

\$.js

- \+ \$.isEmpty
  判断对象、数组内容为空
- \+ \$.isDom
  判断是否 Dom 对象实例

dom

fn.js

- on | off
  \+ swipe 滑动事件
  \+ press 按压事件
- offset
  page-content 页面内滚动，y 不变
- \+ rect
  获得当前层与屏幕可视边框距离
- show | hide
  与 jQuery 兼容
- \+ clone
  克隆当前 Dom
- append
  fixbug
- prepend
  支持添加多个节点
- nextNode
  fixbug
- \- qn
  rename name
- \- qns
  rename names
- \- qt
  rename att
- \- qts
  rename atts
- \- qc
  rename clas class 为保留字
- \- qcs
  rename clases

util\form

- setData
  使用模板加载数据设置页面内容
- clearData
  清除数据
- addData
  添加数据到页面容器
- addSet
  根据模板在原数据集合上添加新的 form 数据集

## 2020-05-24

- util\form.js
  setField
  v 无值、未定义、null 统一作为 '' 空字符串处理，避免出现 undefined null 字符。
- util\tool.js
  \+ trimStart(s, del)
  去除字符串头部空格或指定字符
  \+ trimEnd(s, del)
  去除字符串尾部空格或指定字符
  \+ times(fmt, date)
  格式化日期
  \+ addDay(date, cnt)
  \+ setTitle(s)
  修改微信 title

### dom

fn.js

增加两个插入节点函数，方便节点添加操作。

- append
  fixbug，添加的节点未删除
- nextNode
  fixbug
- \+ insert
  添加参数节点到当节点的最前
- \+ insertTo
  添加当前节点到参数节点的最前

## 2020-05-21

### base

\$.js

- \* addClass
  @param {boolean} only - Delete all the styles in the same layer, used by tab
- \* forEach
  类似 each，为 likeArray or object 提供迭代循环
  不同的是参数中，value 在前，索引 index 或 key 在后，与数组的 forEach 参数次序保持一致
  数组的函数只能针对数组
- \+ promise
  将回调中只有一个参数的普通函数，转换为 Promise 函数，方便调用

### dom

fn.js

- \* css
  paddingLeft|paddingTop 自动加 px
- \* insertBefore insertAfter
  return this

## 2020-05-19

### base

\* \$.js

- \*toggleClass(className, add)
  add - Add only.
- \+ $.isNumber = $.isNumeric;

### dom

\* fn.js

- \* data
  修正 bug
- \* css
  width|height|left|top|marginLeft|marginTop
  auto add px
- \* insertBefore insertAfter
  return this
- \+ parentNode
  The first parent node that meets the criteria
- \* closest
  Optimize efficiency
- \+ findNode
  A single element in the descendant that fits the selector
- \* children
  Optimize efficiency
- \+ childNode
  Returns the first eligible child element of the selected element
- \- upperTag,
- \- childTag,

## 2020-05-16

### base

- \+ \$.contains
- \+ \$.funcArg

### component

- \* uploader/index.js
  支持头像这种单图像文件选择、上传

### dom

\* fn.js

- \* data
  兼容 jQuery
- \* dataset removeData
  保留 dom7 功能，避免 f7 无法运行
- \* offset
  兼容 jQuery

## 2020-05-14

### base

\$.js

- \+ \$.deserializeValue

### dom

fn.js

- \* data
  改为 dataset
- \+ data
  与 jqueyr 兼容
- \* dataset
  改为 datasets
- \* removeData
  改为 removeDataset
- \* nextOne
  改为 nextNode
- \* prevOne
  改为 prevNode

## 2020-05-13

### base

\* \$.js

去掉 fastLink 事件中的 ev.preventDefault()，
不去掉，会屏蔽 后续的 onclick 事件。

- \+ concat

* \$.js
  - concat \* map
    直接返回数组

- \*ajax.js
  get 支持 对象参数

### dom

fn.js

去掉 click ontouchend 事件中的 ev.preventDefault()，
不去掉，会屏蔽 后续的 onclick 事件。

- \+ some
- \+ ervery
- \+ nextOne
- \+ prevOne \* qcs
  修正返回 bug \* qts
  修正返回 bug
