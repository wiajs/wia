/**
 * 当前模块实现页面与数据交互
 *
 * 1. 简单数据直接填入 input的value
 * 2. 复杂数据，如对象、数组等，则填入 隐藏域 的data 对象，
 *    并通过页面模板实现复杂数据展示。
 * 3. 数据输出到页面，通过以下函数：
 *    setForm 对整个页面，比如 Form表单，进行数据输出
 *    setField 对单个字段，进行数据输出，如果为空，则清除
 *    addField 单个字段，增加数据
 * 4. 读取页面数据
 *    getForm 读取整个页面数据，返回 FormData 对象
 *    getField 读取指定字段数据，返回 仅仅包含 指定字段的 FormData对象
 *    读取时，自动将所有隐藏域的data对象，转换为字符串，方便FormData 提交服务器。
 * 5. 对于重复 name 的 input，一般是对象数组，自动转换为对象数组，存入 FormData，
 *    方便服务器处理。
 * 6. 重复数据通过id 和 _id 字段判断，addField时，重复id 或 _id，删除之前的对象，仅保存新增的对象。
 *    id 作为服务器返回的字段，_id 作为客户端添加的字段，
 *    getForm 或 getField 时，自动删除，不返回给服务器，避免影响服务器数据。
 * 7. 以上方法 绑定到 $.fn 中，使用时，按 Dom类似方法使用，如：
 *    _.name('fmDta').setForm(data);
 */

/**
 * 根据数据项名称，自动查找页面对应input 或 field，实现数据到页面的填充
 * 调用该方法的容器一般是 Form，也支持非Form
 * 容器中的节点， 一般是input， 也支持非input，通过field 字段目标实现展现
 * 如果数据为数组，则使用调用者同名模板，生成多节点，
 * field、input隐藏域带模板，会按模板生成字段部分展现
 * setForm 调用了 setField，可以理解为setField的批量操作
 * 也就是说，数据内的元素，支持数组、对象，一次性实现整个容器的数据展现
 * @param {*} v 数据
 * @param {*} n 模板名称，可选，如果不填，默认取 调用者的name
 * 注意，setForm的模板与setField中的模板不一样
 * setForm模板先调用clone克隆模板节点，不赋值，后续再调用 setField 进行赋值。
 * 意味着 setForm中的模板里面可以再嵌套字段模板。
 * setField中的模板，使用带${r.name}这种插值模板，根据后台r数据，生成带数据值的 html。
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
      } else Object.keys(v).forEach(k => el::setField(k, v[k]));
    } else if ($.isObject(v))
      // 非母版
      Object.keys(v).forEach(k => el::setField(k, v[k]));
  } catch (ex) {
    console.error('setForm exp.', {msg: ex.message});
  }
}

/**
 * 设置 字段值，根据页面模板，实现页面自动化展示
 * 在Form表单中，一般用input来存放字符串值，如果使用模板，input type 必须为 hidden
 * 在非Form表单中，没有input 也可以使用，k为模板名称中不带-tp部分
 * @param {*} el 容器
 * @param {*} k 字段名称
 * @param {*} v 设置值
 * @param {*} add 重新设置还是新增，重新设置会清除数据项，默认为 false
 */
function setField(k, v, add = false) {
  try {
    if (!k) return false;

    const el = this;

    // 清除字段数据
    if (!add) el::clearField(k);

    const $n = el.name(k);
    if ($n.length > 0) {
      const n = $n.dom;
      console.log('setField', {type: n.type});
      // null undfined 转换为空
      v = v ?? '';
      if (v === 'null' || v === 'undefined') v = '';

      if (n.tagName.toLowerCase() === 'textarea') $n.val(v);
      else if (n.tagName.toLowerCase() === 'input') {
        if (n.type === 'text') el::setInput(k, v);
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
          ].includes(n.type)
        )
          $n.val(v);
        // 隐藏域，一般使用模板，数据为数组或对象
        else if (n.type === 'hidden') {
          el::setInput(k, v);
          el::setData(k, v);
          // 触发 input的 onchange 事件，hidden 组件数据变化，不会触发onchange
          // 这里发起change事件，方便其他组件接收事件后，实现UI等处理
          // 其他接受change事件的组件，不能再次触发change，否则导致死循环
          $n.change();
        } else if (n.type === 'select-one') {
          for (let i = 0, len = n.options.length; i < len; i++) {
            if (n.options[i].value === String(v)) {
              n.options[i].selected = true;
              break;
            }
          }
        } else if (n.type === 'checkbox') {
          const ns = el.names(k);
          ns.each((i, x) => {
            x.checked = v.includes(x.value);
          });
        } else el::setData(k, v);
      } else el::setData(k, v);
    } else el::setData(k, v);
  } catch (ex) {
    console.error('setField exp.', {msg: ex.message});
  }
}

/**
 * 向 field 中添加值
 * @param {*} el 容器
 * @param {*} k 字段名称
 * @param {*} v 新增数据
 */
function addField(k, v) {
  this::setField(k, v, true);
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
      p::setField(k, v[k]);
    });
    p.attr('name', tp.attr('name').replace('-tp', '-data')).show();
  } catch (ex) {
    console.error('addSet exp.', {msg: ex.message});
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
 * 根据模板，添加数据节点
 * 添加钱，根据id 或 _id，删除相同已加载数据节点
 * 内部函数，被 setData 调用
 * @param {*} tp 模板
 * @param {*} k 字段名称
 * @param {*} r 数据，对象 或 值
 * @param {*} ns 已经存在的数据节点
 */
function addData(tp, k, r, ns) {
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

      $n.attr('name', `${k}-data`).insertBefore(tp).show();
    } else {
      // 非对象，简单值，直接使用模板，值作为 _id，避免重复添加
      const ds = this.names(`${k}-data`);
      if (!ds || !ds.length || !ds.some(d => $(d).data('_id') == r)) {
        const tx = eval('`' + tp.dom.outerHTML + '`');
        $(tx).data('_id', r).attr('name', `${k}-data`).insertBefore(tp).show();
      }
    }
  } catch (ex) {
    console.error('addData exp.', {msg: ex.message});
  }
}

/**
 * 使用模板加载数据到页面
 * 内部函数，被 setField 调用，只管模板，不管input 和 form
 * 在非 form 和 input环境可用
 * @param {*} v 数据，对象或者对象数组
 * @param {*} k Namespaces，带模板名称空间
 */
function setData(k, v) {
  try {
    if (!k) return false;

    const el = this;
    if ($.isEmpty(v)) return false;

    // 按模板增加数据
    const tp = el.name(`${k}-tp`);
    if (tp.length) {
      let empty = el.names(`${k}-data`).length === 0;
      // chip
      const n = el.name(k).dom;
      // 如果 input存在，优先获取 input 中的 data
      if (n && n.type === 'hidden') {
        const val = n.value;
        if (!$.isEmpty(n.data)) v = n.data;
        else if (val) {
          v = val;
          if (val.indexOf(',') > -1) v = val.split(',');
        }
      }

      const ns = el.names(`${k}-data`);

      if ($.isArray(v))
        v.forEach(r => {
          if (r) {
            empty = false;
            el::addData(tp, k, r, ns);
          }
        });
      else if (v) {
        empty = false;
        el::addData(tp, k, v, ns);
      }

      // 支持点击删除
      if (tp.hasClass('chip')) tp.parentNode().click(removeChip);

      // 如果数据节点为空，则显示空节点（存在则显示）
      if (empty) el.name(`${k}-empty`).show();
      else el.name(`${k}-empty`).hide();
    } else {
      // 没有模板，直接覆盖
      const n = el.name(`${k}`);
      if (n.length && n.dom.type !== 'hidden' && n.dom.type != 'text') {
        const r = v;
        const tx = n.html();
        if (r && tx.indexOf('${') > -1) n.html(eval('`' + tx + '`'));
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
 * @param {*} k 字段名称
 * @param {*} v 值，接受字符串、对象 和 对象数组
 * 对象、对象数组 赋值到 data，值，值数组，赋值到 value
 */
function setInput(k, v) {
  try {
    const el = this;
    const n = el.name(k);
    if (!n.length) return;

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

    let org = n.dom.data;
    if (!org) {
      org = n.val();
      // 隐藏域，还原对象
      if (n.dom.type === 'hidden' && /\s*[{[]/g.test(org)) {
        try {
          org = JSON.parse(org);
          n.dom.data = org;
          n.val('');
        } catch (e) {
          console.error('setInput exp.', {msg: e.message});
        }
      }
    }

    if ($.isEmpty(org)) {
      if ($.isVal(v)) n.val(v);
      else if ($.isArray(v) && $.isVal(v[0])) n.val(v.join(','));
      else n.dom.data = v;
    } else {
      if ($.isArray(v)) {
        v = v.reduce((pre, cur) => getValue(n, cur, pre), org);
        if ($.hasVal(v) && $.isArray(v)) {
          v = Array.from(new Set(v));
        }
      } else v = getValue(n, v, org);

      if ($.hasVal(v)) {
        if ($.isVal(v)) n.val(v);
        // 值 数组
        else if ($.isArray(v) && $.isVal(v[0])) n.val(v.join(','));
        else n.dom.data = v;
      }
    }
  } catch (ex) {
    console.error('setInput exp.', {msg: ex.message});
  }
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
 * 清除字段
 */
function clearField(k) {
  try {
    const el = this;
    // 清除input值
    const es = el.names(k);
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
    el.names(`${k}-data`).remove();
    el.name(`${k}-empty`).show();
  } catch (e) {
    console.error(`clearField exp:${e.message}`);
  }
}

/**
 * 读取整个页面数据，返回对象 或对象数组
 * 读取时，自动将所有隐藏域的data对象，转换为字符串，方便FormData 提交服务器。
 * @param {*} n 模板名称，不填与容器名称相同，可选参数
 */
function getForm(n) {
  let R = null;
  try {
    const el = this;
    el.find('input[type=hidden]').forEach(d => {
      if (!$.isEmpty(d.data)) d.value = JSON.stringify(d.data);
    });

    if (!n) n = el.attr('name');

    const tp = el.name(`${n}-tp`);
    let prev = null;
    if (tp.length) {
      prev = tp.prev();
      tp.remove();
    }
    const fd = new FormData(el.dom);
    if (tp.length) tp.insertAfter(prev);

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
 * 读取指定字段数据，返回 仅仅包含 指定字段的值，如果有data，则返回 对象
 * 读取时，自动将隐藏域的data对象，转换为字符串，方便FormData 提交服务器。
 * @param {*} k 字段名称
 */
function getField(k) {
  let R = null;
  try {
    const el = this;
    const n = el.name(k);
    if (n.length) {
      if ($.hasVal(n.data)) R = n.data;
      else R = n.val();
    }
  } catch (ex) {
    console.error('getForm exp.', {msg: ex.message});
  }

  return R;
}

// export const fn = {
export {
  setForm,
  addForm,
  getForm,
  clearForm,
  setField,
  addField,
  clearField,
  getField,
};

// test
// Object.keys(fn).forEach(k => ($.fn[k] = fn[k]));