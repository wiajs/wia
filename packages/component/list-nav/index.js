import {Utils, Event} from '@wiajs/core';

export default class ListNav extends Event {
  constructor(app, params = {}) {
    super(params, [app]);
    const _ = this;

    const defaults = {
      el: null, // where to render indexes
      listEl: null, // list el to generate indexes
      indexes: 'auto', // or array of indexes
      iosItemHeight: 14,
      mdItemHeight: 14,
      auroraItemHeight: 14,
      scrollList: true,
      label: false,
      // set i attrbute, faster
      // eslint-disable-next-line
      renderItem(itemContent, itemIndex) {
        const rg = /\((\S+)\)/gi.exec(itemContent);
        if (rg) itemContent = rg[1];

        return `
          <li i="${itemIndex}"><span>${itemContent}</span></li>
        `.trim();
      },
      renderSkipPlaceholder() {
        return '<li class="list-nav-skip-placeholder"></li>';
      },
      on: {},
    };

    _.params = Utils.extend(defaults, params);

    let $el;
    let $listEl;
    let $pageContentEl;
    let $ul;

    if (_.params.el) {
      $el = $(_.params.el);
    } else {
      return _;
    }

    if ($el[0].f7ListIndex) {
      return $el[0].f7ListIndex;
    }

    $ul = $el.find('ul');
    if ($ul.length === 0) {
      $ul = $('<ul></ul>');
      $el.append($ul);
    }

    if (_.params.listEl) {
      $listEl = $(_.params.listEl);
    }

    if (_.params.indexes === 'auto' && !$listEl) {
      return _;
    }

    if ($listEl) {
      $pageContentEl = $listEl.parents('.page-content').eq(0);
    }

    $el[0].f7ListIndex = _;

    Utils.extend(_, {
      app,
      $el,
      el: $el && $el[0],
      $ul,
      ul: $ul && $ul[0],
      $listEl,
      listEl: $listEl && $listEl[0],
      $pageContentEl,
      pageContentEl: $pageContentEl && $pageContentEl[0],
      indexes: params.indexes,
      height: 0,
    });

    // Attach events
    function handleResize() {
      const height = {index: _};
      _.calcSize();
      if (height !== _.height) {
        _.render();
      }
    }

    /**
     * 点击索引
     */
    function handleClick(e) {
      const li = $(e.target).closest('li');
      if (!li.length) return;

      _.$el.classes('active').removeClass('active');
      li.addClass('active');

      const id = li.attr('i'); // $clickedLi.index();
      const tx = _.indexes[id];

      // 触发组件事件
      // _.emit('local::navclick listNavClick', {tx, id});

      // 滚动到点击元素对于的分类
      if (_.$listEl && _.params.scrollList) {
        _.scrollListToIndex(tx, id);
      }
    }

    /**
     * 点击列表
     */
    function listClick(e) {
      const li = $(e.target).closest('.item-content');
      if (!li.length) return;

      const tx = li.class('item-title').html();

      // 触发 dom 节点事件
      _.$listEl.trigger('select', {data: tx});

      // 触发组件事件
      _.emit('local::select listNavSelect', {data: tx});
    }

    const touchesStart = {};
    let isTouched;
    let isMoved;
    let topPoint;
    let bottomPoint;
    let $labelEl;
    let previousIndex = null;
    function handleTouchStart(e) {
      const $children = $ul.children();
      if (!$children.length) return;
      topPoint = $children[0].getBoundingClientRect().top;
      bottomPoint =
        $children[$children.length - 1].getBoundingClientRect().top +
        $children[0].offsetHeight;

      touchesStart.x =
        e.type === 'touchstart' ? e.targetTouches[0].pageX : e.pageX;
      touchesStart.y =
        e.type === 'touchstart' ? e.targetTouches[0].pageY : e.pageY;
      isTouched = true;
      isMoved = false;
      previousIndex = null;
    }
    function handleTouchMove(e) {
      if (!isTouched) return;
      if (!isMoved && _.params.label) {
        $labelEl = $('<span class="list-index-label"></span>');
        $el.append($labelEl);
      }
      isMoved = true;
      const pageY = e.type === 'touchmove' ? e.targetTouches[0].pageY : e.pageY;
      e.preventDefault();

      let percentage = (pageY - topPoint) / (bottomPoint - topPoint);
      percentage = Math.min(Math.max(percentage, 0), 1);

      const itemIndex = Math.round((_.indexes.length - 1) * percentage);
      const itemContent = _.indexes[itemIndex];

      const ulHeight = bottomPoint - topPoint;
      const bubbleBottom =
        (_.height - ulHeight) / 2 + (1 - percentage) * ulHeight;

      if (itemIndex !== previousIndex) {
        if (_.params.label) {
          $labelEl
            .html(itemContent)
            .transform(`translateY(-${bubbleBottom}px)`);
        }

        if (_.$listEl && _.params.scrollList) {
          _.scrollListToIndex(itemContent, itemIndex);
        }
      }

      previousIndex = itemIndex;

      _.$el.trigger('listindex:select');
      _.emit('local::select listIndexSelect', _, itemContent, itemIndex);
    }
    function handleTouchEnd() {
      if (!isTouched) return;
      isTouched = false;
      isMoved = false;
      if (_.params.label) {
        if ($labelEl) $labelEl.remove();
        $labelEl = undefined;
      }
    }
    const passiveListener = app.support.passiveListener
      ? {passive: true}
      : false;

    _.attachEvents = function attachEvents() {
      $el.parents('.tab').on('tab:show', handleResize);
      $el.parents('.page').on('page:reinit', handleResize);
      $el.parents('.panel').on('panel:open', handleResize);
      $el
        .parents(
          '.sheet-modal, .actions-modal, .popup, .popover, .login-screen, .dialog, .toast'
        )
        .on('modal:open', handleResize);
      app.on('resize', handleResize);

      // 点击索引
      $el.on('click', handleClick);
      $listEl.click(listClick);

      $el.on(app.touchEvents.start, handleTouchStart, passiveListener);
      app.on('touchmove:active', handleTouchMove);
      app.on('touchend:passive', handleTouchEnd);
    };
    _.detachEvents = function attachEvents() {
      $el.parents('.tab').off('tab:show', handleResize);
      $el.parents('.page').off('page:reinit', handleResize);
      $el.parents('.panel').off('panel:open', handleResize);
      $el
        .parents(
          '.sheet-modal, .actions-modal, .popup, .popover, .login-screen, .dialog, .toast'
        )
        .off('modal:open', handleResize);
      app.off('resize', handleResize);

      $el.off('click', handleClick);
      $el.off(app.touchEvents.start, handleTouchStart, passiveListener);
      app.off('touchmove:active', handleTouchMove);
      app.off('touchend:passive', handleTouchEnd);
    };
    // Init
    _.init();

    return _;
  }

  /**
   * 滚动内容列表到指定分类
   */
  // eslint-disable-next-line
  scrollListToIndex(tx, id) {
    const _ = this;
    const {$listEl, $pageContentEl, app} = _;
    if (!$listEl || !$pageContentEl || $pageContentEl.length === 0) return _;

    let to;
    $listEl.find('.list-group-title, .item-divider').each((i, el) => {
      if (to) return;
      const $el = $(el);
      if ($el.text() === tx) {
        to = $el;
      }
    });

    if (!to || to.length === 0) return _;

    // ul 与滚动层的顶距
    const parentTop = to.parent().dom.offsetTop;

    // 顶部偏移，比如 滚动层顶部有个绝对定位的层，不参与滚动
    const paddingTop = parseInt($listEl.css('padding-top'), 10);

    if (parentTop > paddingTop) {
      $listEl.scrollTop(parentTop - paddingTop);
    } else {
      $listEl.scrollTop(0);
    }
    return _;
  }

  renderSkipPlaceholder() {
    const index = this;
    return index.params.renderSkipPlaceholder.call(index);
  }

  renderItem(itemContent, itemIndex) {
    const index = this;
    return index.params.renderItem.call(index, itemContent, itemIndex);
  }

  render() {
    const index = this;
    const {$ul, indexes} = index;
    let wasSkipped;

    const html = indexes
      .map((itemContent, itemIndex) => {
        let itemHtml = index.renderItem(itemContent, itemIndex);
        if (wasSkipped) {
          itemHtml = index.renderSkipPlaceholder() + itemHtml;
        }
        wasSkipped = false;
        return itemHtml;
      })
      .join('');

    $ul.html(html);

    return index;
  }

  calcSize() {
    const index = this;
    const {el} = index;
    index.height = el.offsetHeight;

    return index;
  }

  calcIndexes() {
    const index = this;
    if (index.params.indexes === 'auto') {
      index.indexes = [];
      const ns = index.$listEl.find('.list-group-title, .item-divider');
      ns.each((elIndex, el) => {
        const elContent = $(el).text();
        if (index.indexes.indexOf(elContent) < 0) {
          index.indexes.push(elContent);
        }
      });
    } else {
      index.indexes = index.params.indexes;
    }
    return index;
  }

  update() {
    const index = this;
    index.calcIndexes();
    index.calcSize();
    index.render();

    return index;
  }

  init() {
    const index = this;
    index.calcIndexes();
    index.calcSize();
    index.render();
    index.attachEvents();
  }

  destroy() {
    let index = this;
    index.$el.trigger('listnav:beforedestroy', index);
    index.emit('local::beforeDestroy listNavBeforeDestroy');
    index.detachEvents();
    if (index.$el[0]) {
      index.$el[0].f7ListIndex = null;
      delete index.$el[0].f7ListIndex;
    }
    Utils.deleteProps(index);
    index = null;
  }
}
