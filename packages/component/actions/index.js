/**
 * 实现底部弹出菜单，支持js 内置button，自动创建 菜单，如：
 *  _actions = new Actions($.app, {
 *     buttons: [
      // First group
      [
        {
          text: '新建费用',
          icon: '<i class="icon iconfont iconicon_add"></i>',
          onClick: function () {
            $.app.dialog.alert('Button1 clicked');
          },
        },
        {
          text: '选取费用',
          icon: '<i class="icon iconfont iconsanheng"></i>',
        },
      ],
      // Second group
      [
        {
          text: '取消',
          color: 'red',
        },
      ],
    ],
  }

  或者 使用页面模式，如页面html：

  <!-- Actions 背景透明蒙版 -->
  <div class="actions-backdrop"></div>
  <!-- Actions Menu -->
  <div class="actions-modal" style="display: none;">
    <div class="actions-group">
      <div name="btnNewFee" class="actions-button">
        <div class="actions-button-media">
          <i class="icon iconfont iconicon_add"></i>
        </div>
        <div class="actions-button-text">新建费用</div>
      </div>
      <div name="btnSelFee" class="actions-button">
        <div class="actions-button-media">
          <i class="icon iconfont iconsanheng"></i>
        </div>
        <div class="actions-button-text">选取费用</div>
      </div>
    </div>
    <div class="actions-group">
      <div class="actions-button color-red">
        <div class="actions-button-text">取消</div>
      </div>
    </div>
  </div>

  代码里面则无需定义 button，按传统方式控制：

  _actions = new Actions($.app, {
    el: '.actions-modal',
    backdropEl: '.actions-backdrop',
    moveToRoot: false, // 不移到root层
  });

  传统方式，比较直观，容易控制页面样式，内置button方式，页面简单。
  建议使用 传统方式，控制起来灵活。
 */

/* eslint indent: ["off"] */
import {Utils, Modal} from '@wiajs/core';

const defs = {
  convertToPopover: true,
  forceToPopover: false,
  backdrop: true,
  backdropEl: undefined,
  closeByBackdropClick: true, // 点击背景关闭
  closeByOutsideClick: true, // 点击背景之外节点关闭，外置 button时，点击菜单也关闭
  closeOnEscape: false,
  render: null,
  renderPopover: null,
  moveToRoot: true, // 移到root层，外置 button时，需设置为 false
  // el: '.actions-modal',
};

class Actions extends Modal {
  constructor(app, params) {
    const extendedParams = Utils.extend({on: {}}, defs, params);

    // Extends with open/close Modal methods;
    super(app, extendedParams);

    const actions = this;

    actions.params = extendedParams;

    // Buttons
    let groups;
    if (actions.params.buttons) {
      groups = actions.params.buttons;
      if (!Array.isArray(groups[0])) groups = [groups];
    }
    actions.groups = groups;

    // Find Element
    let $el;
    if (actions.params.el) {
      $el = $(actions.params.el).eq(0);
    } else if (actions.params.content) {
      $el = $(actions.params.content)
        .filter((elIndex, node) => node.nodeType === 1)
        .eq(0);
    } else if (actions.params.buttons) {
      if (actions.params.convertToPopover) {
        actions.popoverHtml = actions.renderPopover();
      }
      actions.actionsHtml = actions.render();
    }

    if ($el && $el.length > 0 && $el[0].f7Modal) {
      return $el[0].f7Modal;
    }

    if (
      $el &&
      $el.length === 0 &&
      !(actions.actionsHtml || actions.popoverHtml)
    ) {
      return actions.destroy();
    }

    // Backdrop，半透明蒙版
    let $backdropEl;
    if (actions.params.backdrop && actions.params.backdropEl) {
      $backdropEl = $(actions.params.backdropEl);
    } else if (actions.params.backdrop) {
      $backdropEl = app.root.children('.actions-backdrop');
      if ($backdropEl.length === 0) {
        $backdropEl = $('<div class="actions-backdrop"></div>');
        app.root.append($backdropEl);
      }
    }

    const originalOpen = actions.open;
    const originalClose = actions.close;
    let popover;
    function buttonOnClick(e) {
      const $buttonEl = $(this);
      let buttonIndex;
      let groupIndex;
      if (
        $buttonEl.hasClass('list-button') ||
        $buttonEl.hasClass('item-link')
      ) {
        buttonIndex = $buttonEl.parents('li').index();
        groupIndex = $buttonEl.parents('.list').index();
      } else {
        buttonIndex = $buttonEl.index();
        groupIndex = $buttonEl.parents('.actions-group').index();
      }
      if (typeof groups !== 'undefined') {
        const button = groups[groupIndex][buttonIndex];
        if (button.onClick) button.onClick(actions, e);
        if (actions.params.onClick) actions.params.onClick(actions, e);
        if (button.close !== false) actions.close(); // 除非设置为不关闭，否则自动关闭
      }
    }

    actions.open = function (animate) {
      let convertToPopover = false;
      const {
        targetEl,
        targetX,
        targetY,
        targetWidth,
        targetHeight,
      } = actions.params;
      if (
        actions.params.convertToPopover &&
        (targetEl || (targetX !== undefined && targetY !== undefined))
      ) {
        // Popover
        if (
          actions.params.forceToPopover ||
          (app.device.ios && app.device.ipad) ||
          app.width >= 768 ||
          (app.device.desktop && app.theme === 'aurora')
        ) {
          convertToPopover = true;
        }
      }
      if (convertToPopover && actions.popoverHtml) {
        popover = app.popover.create({
          content: actions.popoverHtml,
          backdrop: actions.params.backdrop,
          targetEl,
          targetX,
          targetY,
          targetWidth,
          targetHeight,
        });
        popover.open(animate);
        popover.once('popoverOpened', () => {
          popover.$el
            .find('.list-button, .item-link')
            .each((groupIndex, buttonEl) => {
              $(buttonEl).on('click', buttonOnClick);
            });
        });
        popover.once('popoverClosed', () => {
          popover.$el
            .find('.list-button, .item-link')
            .each((groupIndex, buttonEl) => {
              $(buttonEl).off('click', buttonOnClick);
            });
          Utils.nextTick(() => {
            popover.destroy();
            popover = undefined;
          });
        });
      } else {
        actions.$el = actions.actionsHtml
          ? $(actions.actionsHtml)
          : actions.$el;
        actions.$el[0].f7Modal = actions;

        if (actions.groups) {
          actions.$el.find('.actions-button').each((groupIndex, buttonEl) => {
            const btn = $(buttonEl);
            btn.click(buttonOnClick);
          });
          actions.once('actionsClosed', () => {
            actions.$el.find('.actions-button').each((groupIndex, buttonEl) => {
              const btn = $(buttonEl);
              btn.off('click', buttonOnClick);
            });
          });
        }

        actions.el = actions.$el[0];
        originalOpen.call(actions, animate);
      }
      return actions;
    };

    actions.close = function close(animate) {
      if (popover) {
        popover.close(animate);
      } else {
        originalClose.call(actions, animate);
      }
      return actions;
    };

    Utils.extend(actions, {
      app,
      $el,
      el: $el ? $el[0] : undefined,
      $backdropEl,
      backdropEl: $backdropEl && $backdropEl[0],
      type: 'actions',
    });

    // 背景蒙片层被点击
    function handleClick(e) {
      const target = e.target;
      const $target = $(target);
      const keyboardOpened =
        !app.device.desktop &&
        app.device.cordova &&
        ((window.Keyboard && window.Keyboard.isVisible) ||
          (window.cordova.plugins &&
            window.cordova.plugins.Keyboard &&
            window.cordova.plugins.Keyboard.isVisible));
      if (keyboardOpened) return;

      // 不使用 组件内置创建 buttons
      if (!groups || $target.closest(actions.el).length === 0) {
        if (
          actions.params.closeByBackdropClick &&
          actions.params.backdrop &&
          actions.backdropEl &&
          actions.backdropEl === target
        ) {
          actions.close();
        } else if (actions.params.closeByOutsideClick) {
          actions.close();
        }
      }
    }

    function onKeyDown(e) {
      const keyCode = e.keyCode;
      if (keyCode === 27 && actions.params.closeOnEscape) {
        actions.close();
      }
    }

    if (actions.params.closeOnEscape) {
      actions.on('open', () => {
        $(document).on('keydown', onKeyDown);
      });
      actions.on('close', () => {
        $(document).off('keydown', onKeyDown);
      });
    }

    actions.on('opened', () => {
      if (
        actions.params.closeByBackdropClick ||
        actions.params.closeByOutsideClick
      ) {
        app.on('click', handleClick);
      }
    });
    actions.on('close', () => {
      if (
        actions.params.closeByBackdropClick ||
        actions.params.closeByOutsideClick
      ) {
        app.off('click', handleClick);
      }
    });

    if ($el) {
      $el[0].f7Modal = actions;
    }

    return actions;
  }

  render() {
    const actions = this;
    if (actions.params.render)
      return actions.params.render.call(actions, actions);
    const {groups} = actions;
    return `
      <div class="actions-modal${actions.params.grid ? ' actions-grid' : ''}">
        ${groups
          .map(
            group => `<div class="actions-group">
            ${group
              .map(button => {
                const buttonClasses = [
                  `actions-${button.label ? 'label' : 'button'}`,
                ];
                const {color, bg, bold, disabled, label, text, icon} = button;
                if (color) buttonClasses.push(`color-${color}`);
                if (bg) buttonClasses.push(`bg-color-${bg}`);
                if (bold) buttonClasses.push('actions-button-bold');
                if (disabled) buttonClasses.push('disabled');
                if (label) {
                  return `<div class="${buttonClasses.join(
                    ' '
                  )}">${text}</div>`;
                }
                return `
                <div class="${buttonClasses.join(' ')}">
                  ${
                    icon
                      ? `<div class="actions-button-media">${icon}</div>`
                      : ''
                  }
                  <div class="actions-button-text">${text}</div>
                </div>`.trim();
              })
              .join('')}
          </div>`
          )
          .join('')}
      </div>
    `.trim();
  }

  renderPopover() {
    const actions = this;
    if (actions.params.renderPopover)
      return actions.params.renderPopover.call(actions, actions);
    const {groups} = actions;
    return `
      <div class="popover popover-from-actions">
        <div class="popover-inner">
          ${groups
            .map(
              group => `
            <div class="list">
              <ul>
                ${group
                  .map(button => {
                    const itemClasses = [];
                    const {
                      color,
                      bg,
                      bold,
                      disabled,
                      label,
                      text,
                      icon,
                    } = button;
                    if (color) itemClasses.push(`color-${color}`);
                    if (bg) itemClasses.push(`bg-color-${bg}`);
                    if (bold) itemClasses.push('popover-from-actions-bold');
                    if (disabled) itemClasses.push('disabled');
                    if (label) {
                      itemClasses.push('popover-from-actions-label');
                      return `<li class="${itemClasses.join(
                        ' '
                      )}">${text}</li>`;
                    }
                    if (icon) {
                      itemClasses.push('item-link item-content');
                      return `
                      <li>
                        <a class="${itemClasses.join(' ')}">
                          <div class="item-media">
                            ${icon}
                          </div>
                          <div class="item-inner">
                            <div class="item-title">
                              ${text}
                            </div>
                          </div>
                        </a>
                      </li>
                    `;
                    }
                    itemClasses.push('list-button');
                    return `
                    <li>
                      <a class="${itemClasses.join(' ')}">${text}</a>
                    </li>
                  `;
                  })
                  .join('')}
              </ul>
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `.trim();
  }
}

export default Actions;
