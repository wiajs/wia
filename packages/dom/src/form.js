/**
 * 实现页面视图（不限表单）与数据交互
 *
 * 简介：
 *    数据与视图交互是所有带UI界面都需实现的基本功能，不同开发框架都制定了一套固定机制。
 *    其中web前端与所有其他UI（原生ios、安卓、windows）都不一样，由于其开放、自由、无主，
 *    导致没有一套固定机制，不同人、不同组织提供的开发框架、方式几十上百种。
 *
 *    最原始的方法，是通过jQuery操作页面dom对象完成，工作量大，效率低、容易出错，逐渐被淘汰。
 *    现在主流的vue、react、angular都需要学习一套新的语法、知识、理论，并且不仅仅如此，
 *    一旦采用其中一种，就得整体采用其全家桶，陷入技术陷阱。
 *    wia的form通过最自然的es6插值方式，在html页面写入插值即可实现数据展示。
 *    这种方式，理解起来非常自然，一看就会，无需学习任何新的知识。
 *
 * setForm 分解对象属性（key）按名称匹配视图内的dom对象或模板，进行赋值。
 *    属性名称对应的视图，可以是input，也可以是模板，模板则按setView方式赋值。
 *    隐藏域（hidden）一般会带模板，通过模板展示内容（数组、对象），隐藏域收集信息。
 *    setForm调用了setView，可以理解为setView的批量调用。
 *    比如页面有三个视图，a、b、c，通过 {a:v1,b:v2,c:v3}，setForm等于调用了三次setView。
 *    如果展示页面有input部分，需使用setForm。
 *    setForm 一般用于表单，不限于表单，也可以用于层。
 * setView 不分解对象属性，将对象整体直接作为r传入页面模板${r.xxx}，
 *    进行字符串替换，支持子对象${r.aaa.bbb}。
 *    如果只是页面模板展示，没有input，直接使用setView。
 * 模板 es6中的插值字符串模式，${r.xxx}，r为传入的对象，支持子对象、简单运算。
 *    图片src，模板需使用src-tp="http://${r.url}"，渲染时自动改为src。
 *    直接使用src浏览器会下载http://${r.url}，这个资源肯定找不到。
 *
 * 1. 简单数据直接填入 input的value。
 * 2. 复杂数据，如对象、数组等，则填入 隐藏域 的data 对象，
 *    并通过页面模板实现复杂数据展示。
 * 3. 页面模板（数据替换展示），隐藏在页面，通过克隆模板替换插值字符串实现展现。
 *    名称：name-tp，一般传入对象数组或对象，用于赋值，模板自身隐藏。
 *      属性tp="kv"：key-value键值对，对应模板中的${r.k} ${r.v}，用于引用对象属性及值，实现动态列表。
 *    名称：name-val：直接按模板替换，与名称为 name效果等同。
 *    名称：name：如果内部有 ${字符，则视为直接替换模板，类似 name-val。
 * 4. 数据输出到页面，通过以下函数：
 *    setForm 对象数据对Form表单或者Div层，进行数据展现，每个字段对应同名dom或者name-tp模板。
 *    setView 对单个字段或视图，进行数据展现，如果为空，则清除
 *    addView 单个字段或视图，增加数据
 * 5. 读取页面数据
 *    getForm 读取整个页面数据，返回 FormData 对象
 *    getView 读取指定字段数据，返回 仅仅包含 指定字段的 FormData对象
 *    读取时，自动将所有隐藏域的data对象，转换为json字符串，方便FormData 提交服务器。
 * 6. 对于重复 name 的 input，一般是对象数组，自动转换为对象数组，存入 FormData，
 *    方便服务器处理。
 * 7. 重复数据通过id 和 _id 字段判断，addView时，重复id 或 _id，删除之前的对象，仅保存新增的对象。
 *    id 作为服务器返回的字段，_id 作为客户端添加的字段，
 *    getForm 或 getView 时，tp模板自动删除，不返回给服务器，避免影响服务器数据。
 * 8. 以上方法 绑定到 $.fn 中，使用时，按 Dom类似方法使用，如：
 *    _.name('fmData').setForm(data);
 */

/**
 * 表单数据展现
 * 根据数据项名称，自动查找页面对应input（按名称） 或 视图层（name 或 name-tp），实现数据展现
 * 调用该方法的容器一般是 Form，也支持非Form，如 div
 * 容器中的节点， 一般是input， 也支持非input，通过对象属性名称对应dom名称实现匹配展现
 * 如果数据为数组，则使用调用者同名模板，生成多节点，
 * field、input隐藏域带模板，会按模板生成字段部分展现
 * 模板名称为 name-tp，根据模板添加后的节点名称为 name-data
 * setForm 调用了 setView，可以理解为setView的批量操作
 * 也就是说，数据内的元素，支持数组、对象，一次性实现整个容器的数据展现
 * @param {*} v 数据
 * @param {*} n 模板名称，可选，如果不填，默认调用者的name
 * 注意，setForm的模板与setField中的模板不一样
 * setForm模板先调用clone克隆模板节点，不赋值，后续再调用 setField 进行赋值。
 * 意味着 setForm中的模板里面可以再嵌套字段模板。
 * setView中的模板，使用带${r.name}这种插值模板，根据后台r数据，生成带数据值的 html。
 * @param {*} add 新增，可选
 */
function setForm(v, n, add = false) {
  try {
    const el = this;
    // 清空所有数据，填充新数据
    if (!add) el::clearForm();

    if (!n) n = el.attr('name');

    // 使用模板
    if (n) {
      const tp = el.name(`${n}-tp`);
      if (tp.length) {
        if ($.isArray(v))
          v.forEach(r => {
            el::addSet(n, r);
          });
        else el::addSet(n, v);
      } else Object.keys(v).forEach(k => el::setView(v[k], k));
    } else if ($.isObject(v))
      // 非母版
      Object.keys(v).forEach(k => el::setView(v[k], k));
  } catch (ex) {
    console.error('setForm exp.', {msg: ex.message});
  }
}

/**
 * 向 field 中添加值
 * @param {*} el 容器
 * @param {*} k 字段名称
 * @param {*} v 新增数据
 */
function addForm(v, n) {
  const el = this;
  if (!n) n = el.attr('name');
  el::setForm(v, n, true);
}

/**
 * 读取整个页面表单数据，返回对象 或对象数组
 * 需要被读取的数据，需使用 input，包括隐藏域，否则无法被读取
 * 读取时，自动将所有隐藏域的data对象，转换为字符串，方便FormData 提交服务器。
 * @param {*} n 模板名称，不填与容器名称相同，可选参数
 */
function getForm(n) {
  let R = null;
  try {
    const el = this;
    // 将data存入 value，方便FormData读取
    el.find('input[type=hidden]').forEach(d => {
      if (!$.isEmpty(d.data)) d.value = JSON.stringify(d.data);
    });

    if (!n) n = el.attr('name');

    // 对象列表表单，需删除模板，避免模板数据干扰数据获取
    const tp = el.name(`${n}-tp`);
    let prev = null;
    let hasTp = tp.length;
    if (hasTp) {
      hasTp = true;
      prev = tp.prev();
      tp.remove();
    }

    // 读取整个表单输入数据
    const fd = new FormData(el.dom);
    // 还原模板
    if (hasTp) tp.insertAfter(prev);

    const rs = [];
    let last = null;
    let r = {};
    // eslint-disable-next-line no-restricted-syntax
    for (const e of fd.entries()) {
      const k = e[0];
      if (!last) last = k;
      else if (last === k) {
        if (!$.isEmpty(r)) rs.push({...r});
        r = {};
      }
      let v = e[1];
      // 还原对象
      try {
        if (/^\s*[{[]/.test(v)) v = JSON.parse(v);
      } catch (e) {
        console.error('getForm exp.', {msg: e.message});
      }
      r[k] = v;
    }

    if ($.hasVal(r)) rs.push(r);
    if (rs.length === 1) R = rs[0];
    else if (rs.length > 1) R = rs;
  } catch (ex) {
    console.error('getForm exp.', {msg: ex.message});
  }

  return R;
}

/**
 * 清除表单
 */
function clearForm() {
  try {
    const el = this;
    // 清除input值
    let es = el.find('input,textarea');
    es.forEach(e => {
      if (e.data) {
        e.data = null;
        delete e.data;
      }
      if (e.type !== 'checkbox') e.value = '';
    });

    // 清除 模板数据
    el.find('[name$=-data]').remove();
    el.find('[name$=-empty]').show();
  } catch (e) {
    console.error(`clearForm exp:${e.message}`);
  }
}

/**
 * 设置页面视图数据，根据同名Input或页面模板，实现页面展示
 * 在Form表单中，一般用input来存放字符串值，如使用模板，input type 必须为 hidden
 * 在非Form中，没有input，同名dom，或者名称-tp为插值模板，将对象数据与模板匹配展示数据
 * @param {*} el 函数调用者
 * @param {*} v 数据值
 * @param {*} n 视图名称，缺省为dom对象name属性。
 * @param {*} add 重新设置还是新增，重新设置会清除数据项，默认为 false
 */
function setView(v, n, add = false) {
  try {
    const el = this;

    if (!n) n = el.attr('name');

    if (!n) return false;

    // 清除视图数据
    if (!add) el::clearView(n);

    const $d = el.name(n);
    // 容器内找到字段名称组件
    if ($d.length > 0) {
      const d = $d.dom;
      // console.log('setView', {type: d.type});
      // null undfined 转换为空
      v = v ?? '';
      if (v === 'null' || v === 'undefined') v = '';

      if (d.tagName.toLowerCase() === 'textarea') $d.val(v);
      // input 赋值
      else if (d.tagName.toLowerCase() === 'input') {
        if (d.type === 'text') el::setInput(n, v);
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
          $d.val(v);
        // 隐藏域，一般带同名模板，数据为数组或对象，不使用隐藏域也可以展示对象数据，隐藏域可收集数据
        else if (d.type === 'hidden') {
          el::setInput(n, v);
          el::setData(n, v);
          // 触发 input的 onchange 事件，hidden 组件数据变化，不会触发onchange
          // 这里发起change事件，方便其他组件接收事件后，实现UI等处理
          // 其他接受change事件的组件，不能再次触发change，否则导致死循环
          $d.change();
        } else if (d.type === 'select-one') {
          for (let i = 0, len = d.options.length; i < len; i++) {
            if (d.options[i].value === String(v)) {
              d.options[i].selected = true;
              break;
            }
          }
        } else if (d.type === 'checkbox') {
          const ns = el.names(n);
          ns.each((i, x) => {
            x.checked = v.includes(x.value);
          });
        } else el::setData(n, v);
      } else el::setData(n, v); // 非input赋值
    } else el::setData(n, v); // 没有指定name的dom，可能有name-tp、name-val等模板，一样可赋值
  } catch (ex) {
    console.error('setView exp.', {msg: ex.message});
  }
}

/**
 * 向 field 中添加值
 * @param {*} el 容器
 * @param {*} v 数据
 * @param {*} n 视图名称，缺省为调用者name
 */
function addView(v, n) {
  const el = this;
  if (!n) n = el.attr('name');
  el::setView(v, n, true);
}

/**
 * 清除视图
 * @param {*} k 视图名称
 */
function clearView(n) {
  try {
    const el = this;
    if (!n) n = el.attr('name');

    // 清除input值
    const es = el.names(n);
    es.forEach(e => {
      if (
        e.tagName.toLowerCase() === 'input' ||
        e.tagName.toLowerCase() === 'textarea'
      ) {
        if (e.data) {
          e.data = null;
          delete e.data;
        }
        if (e.type !== 'checkbox') e.value = '';
      }
    });

    // 清除 模板数据
    el.names(`${n}-data`).remove();
    el.name(`${n}-empty`).show();
  } catch (e) {
    console.error(`clearView exp:${e.message}`);
  }
}

/**
 * 读取指定视图数据，返回 仅仅包含 指定视图的值，如果有data，则返回 对象
 * 读取时，自动将隐藏域的data对象，转换为字符串，方便FormData 提交服务器。
 * @param {*} n 视图名称
 */
function getView(n) {
  let R = null;
  try {
    const el = this;
    if (!n) n = el.attr('name');
    const d = el.name(n);
    if (d.length) {
      if ($.hasVal(d.data)) R = d.data;
      else R = d.val();
    }
  } catch (ex) {
    console.error('getView exp.', {msg: ex.message});
  }

  return R;
}

/**
 *
 * @param {*} e
 */
function removeChip(e) {
  console.log('removeChip', {e});

  const el = $(e.target).closest('.chip');
  if (el && el.length > 0) {
    let id = el.data('id');
    const n = el.prevNode('input[type=hidden]');
    el.remove();
    if (n && n.length > 0) {
      id = n
        .val()
        .replace(new RegExp(`${id}\\s*,?\\s*`), '')
        .replace(/\s*,\s*$/, '');
      n.val(id);
    }
  }
}

/**
 * 根据模板添加 form 数据集
 * 内部函数，被setForm调用
 * @param {*} n 模板名称
 * @param {*} v 数据对象
 */
function addSet(n, v) {
  try {
    const el = this;
    const tp = el.name(`${n}-tp`);
    const p = tp.clone();
    p.insertBefore(tp);
    Object.keys(v).forEach(k => {
      p::setView(v[k], k);
    });
    p.attr('name', tp.attr('name').replace('-tp', '-data')).show();
  } catch (ex) {
    console.error('addSet exp.', {msg: ex.message});
  }
}

/**
 * 根据模板，添加数据节点
 * 添加前，根据id 或 _id，删除相同已加载数据节点，避免重复添加
 * 内部函数，被 setData 调用
 * @param {*} tp 模板
 * @param {*} n 字段名称
 * @param {*} r 数据，对象 或 值
 * @param {*} ns 已经存在的数据节点
 */
function addData(tp, n, r, ns) {
  try {
    if (!tp) return;

    // 排除已经存在的节点
    if ($.isObject(r)) {
      if (r.id !== undefined || r._id !== undefined) {
        const ds = ns.filter((i, n) => {
          const $n = $(n);
          return (
            (r.id && $n.data('id') == r.id) ||
            (r._id && $n.data('_id') == r._id)
          );
        });

        if (ds.length) ds.remove();
      }
      const $n = $(eval('`' + tp.dom.outerHTML + '`'));
      if (r.id) $n.data('id', r.id);
      else if (r._id) $n.data('_id', r._id);

      $n.attr('name', `${n}-data`).insertBefore(tp).show();
    } else {
      // 非对象，简单值，直接使用模板，值作为 _id，避免重复添加
      const ds = this.names(`${n}-data`);
      if (!ds || !ds.length || !ds.some(d => $(d).data('_id') == r)) {
        const tx = eval('`' + tp.dom.outerHTML + '`');
        $(tx).data('_id', r).attr('name', `${n}-data`).insertBefore(tp).show();
      }
    }
  } catch (ex) {
    console.error('addData exp.', {msg: ex.message});
  }
}

/**
 * 使用-tp模板或name的html作为模版，xxx-val 不判断 ${直接覆盖，
 * xxx 判断内部是否有 ${，如果有，则视为模板，进行模板替换。
 * 加载数据到页面，模板请使用 ${r} 或 ${r.xx}
 * img 的 $src 改为 src
 * 内部函数，被 setField 调用，只管模板，不管input 和 form
 * 在非 form 和 input环境可用
 * @param {*} n 模板名称
 * @param {*} v 数据，对象或者对象数组
 */
function setData(n, v) {
  try {
    if (!n) return false;

    const el = this;
    if ($.isEmpty(v)) return false;

    // 查找数据模板，按模板增加数据，模板优先 name
    const tp = el.name(`${n}-tp`);
    // 有模板，使用模板添加数据
    if (tp.length) {
      let kv = false; // key value
      if (tp.attr('tp') === 'kv') kv = true;
      let empty = el.names(`${n}-data`).length === 0;
      // chip
      const d = el.name(n).dom;
      // 如果 input存在，优先获取 input 中的 data
      if (d && d.type === 'hidden') {
        const val = d.value;
        if (!$.isEmpty(d.data)) v = d.data;
        else if (val) {
          v = val;
          if (val.indexOf(',') > -1) v = val.split(',');
        }
      }

      const ns = el.names(`${n}-data`);

      if ($.isArray(v))
        v.forEach(r => {
          if (r) {
            empty = false;
            el::addData(tp, n, r, ns);
          }
        });
      else if ($.isObject(v) && kv) {
        Object.keys(v).forEach(vk => {
          if (v[vk]) {
        empty = false;
            el::addData(tp, n, {k: vk, v: v[vk]}, ns);
          }
        });
      } else if (v) {
        empty = false;
        el::addData(tp, n, v, ns);
      }

      // 支持点击删除
      if (tp.hasClass('chip')) tp.parentNode().click(removeChip);

      // img src-tp replace src
      el.find('img[src-tp]').forEach(img => {
        const $img = $(img);
        $img.attr('src', $img.attr('src-tp'));
      });

      // 如果数据节点为空，则显示空节点（存在则显示）
      if (empty) el.name(`${n}-empty`).show();
      else el.name(`${n}-empty`).hide();
    } else {
        const r = v;
      // 没有-tp模板，查找-val，直接覆盖
      const vp = el.name(`${n}-val`);
      if (vp.length) {
        const tx = vp.html();
        if (r && tx.indexOf('${') > -1) {
          vp.html(eval('`' + tx + '`'));
          // img $src replace src
          vp.find('img[src-tp]').forEach(n => {
            const $n = $(n);
            $n.attr('src', $n.attr('src-tp'));
          });
        } else if (r) vp.html(r);
      } else {
        // 没有-tp和-val，获取name为k的视图，内部有${，按模板覆盖内容
        const n = el.name(`${n}`);
        if (n.length && n.dom.type !== 'text') {
        const tx = n.html();
          if (r && tx.indexOf('${') > -1) {
            n.html(eval('`' + tx + '`'));
            // img $src replace src
            n.find('img[src-tp]').forEach(img => {
              const $img = $(img);
              $img.attr('src', $img.attr('src-tp'));
            });
          }
      }
    }
    }
  } catch (ex) {
    console.error('setData exp.', {msg: ex.message});
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
  let R = v;

  try {
    // 对象需判断是否重复
    if ($.isObject(v)) {
      if ($.isObject(org)) {
        if ((org.id && org.id == v.id) || (org._id && org._id == v._id)) R = v;
        else R = [org, v];
      } else if ($.isArray(org)) {
        const rs = org.filter(
          o =>
            (!o.id && !o._id) ||
            (o.id && o.id != v.id) ||
            (o._id && o._id != v._id)
        );
        if (rs.length) {
          rs.push(v);
          R = rs;
        }
      }
    } else {
      // 值变量，直接使用 value 字符串方式存储
      let val = `${org},${v}`;
      // 去重
      if (val.indexOf(',') > -1)
        val = Array.from(new Set(val.split(','))).join(',');
      R = val;
    }
  } catch (e) {
    console.error('getValue exp.', {msg: e.message});
  }
  return R;
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
    const el = this;
    const d = el.name(n);
    if (!d.length) return;

    if ($.isEmpty(v)) return;

    // 没有id 和 _id，自动添加 _id，避免重复添加
    if ($.isObject(v) && v.id === undefined && v._id === undefined)
      v._id = $.num();
    else if ($.isArray(v)) {
      v.forEach(r => {
        if ($.isObject(r) && r.id === undefined && r._id === undefined)
          r._id = $.num();
      });
    }

    let org = d.dom.data;
    if (!org) {
      org = d.val();
      // 隐藏域，从字符串还原对象，保存到 dom.data
      if (d.dom.type === 'hidden' && /\s*[{[]/g.test(org)) {
        try {
          org = JSON.parse(org);
          d.dom.data = org;
          d.val('');
        } catch (e) {
          console.error('setInput exp.', {msg: e.message});
        }
      }
    }

    if ($.isEmpty(org)) {
      if ($.isVal(v)) d.val(v);
      else if ($.isArray(v) && $.isVal(v[0])) d.val(v.join(','));
      else d.dom.data = v;
    } else {
      if ($.isArray(v)) {
        v = v.reduce((pre, cur) => getValue(d, cur, pre), org);
        if ($.hasVal(v) && $.isArray(v)) {
          v = Array.from(new Set(v));
        }
      } else v = getValue(d, v, org);

      if ($.hasVal(v)) {
        if ($.isVal(v)) d.val(v);
        // 值 数组
        else if ($.isArray(v) && $.isVal(v[0])) d.val(v.join(','));
        else d.dom.data = v;
      }
    }
  } catch (ex) {
    console.error('setInput exp.', {msg: ex.message});
  }
}

// export const fn = {
export {
  setForm,
  addForm,
  getForm,
  clearForm,
  setView,
  addView,
  clearView,
  getView,
};

// test
// Object.keys(fn).forEach(k => ($.fn[k] = fn[k]));