function removeChip(ev) {
  console.log('removeChip', {ev});

  const el = $(ev.target).closest('.chip');
  if (el && el.length > 0) {
    let v = el.attr('data');
    const n = el.prevNode('input[type=hidden]');
    el.remove();
    if (n && n.length > 0) {
      v = n
        .val()
        .replace(new RegExp(`${v}\\s*,?\\s*`), '')
        .replace(/\s*,\s*$/, '');
      n.val(v);
    }
  }
}

/**
 * 设置 form input 值
 * @param {*} fm
 * @param {*} r
 */
function setForm(fm, r) {
  Object.keys(r).forEach(k => {
    setField(fm, k, r[k]);
  });
}

/**
 * 设置 form input 值
 * @param {*} fm
 * @param {*} r
 */
function setField(fm, k, v) {
  const $n = fm.name(k);
  if ($n.length > 0) {
    const n = $n.dom;
    console.log('setForm', {type: n.type});
    v = v ?? '';

    if (n.type === 'text' || n.type === 'date') $n.val(v);
    else if (n.type === 'hidden') {
      let val = v;
      if ($.isObject(v)) val = JSON.stringify(v);
      $n.val(val);

      fm.name(`${k}-val`).html(val).removeClass('item-placeholder');
      if (fm.name(`${k}-tp`).hasClass('chip')) {
        setChip(fm, k);

        $n.parent('div').click(removeChip);
      }

      $n.change();
    } else if (n.type === 'select-one') {
      for (let i = 0, len = n.options.length; i < len; i++) {
        if (n.options[i].value === String(v)) {
          n.options[i].selected = true;
          break;
        }
      }
    } else if (n.type === 'checkbox') {
      const ns = fm.names(k);
      ns.each((i, x) => {
        x.checked = v.includes(x.value);
      });
    }
  }
}

function addField(fm, k, v) {
  let val = fm.name(k).val();
  if (val) val += `,${v}`;
  else val = v;
  setField(fm, k, val);
}

function setChip(fm, tx) {
  const el = fm.name(tx);
  const ds = fm.names(`${tx}-set`);
  el.val()
    .split(',')
    .forEach(v => {
      if (!ds.some(d => $(d).attr('data') === v)) {
        const tp = fm.name(`${tx}-tp`);
        // eslint-disable-next-line
        const n = $(eval('`' + tp.dom.outerHTML + '`'));
        n.attr('name', `${tx}-set`).attr('data', v).css('display', '');
        n.insertBefore(tp);
      }
    });
}

function getForm() {}

export {setForm, addField, setField, getForm};
