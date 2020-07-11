import Event from './event';
import Utils from './utils';

const openedModals = [];
const dialogsQueue = [];
function clearDialogsQueue() {
  if (dialogsQueue.length === 0) return;
  const dialog = dialogsQueue.shift();
  dialog.open();
}
export default class Modal extends Event {
  constructor(app, params) {
    super(params, [app]);

    const modal = this;
    const defaults = {};
    modal.params = Utils.extend(defaults, params);
    modal.opened = false;
    return this;
  }

  onOpen() {
    const modal = this;
    modal.opened = true;
    openedModals.push(modal);
    $('html').addClass(`with-modal-${modal.type.toLowerCase()}`);
    modal.$el.trigger(`modal:open ${modal.type.toLowerCase()}:open`);
    modal.emit(`local::open modalOpen ${modal.type}Open`, modal);
  }

  onOpened() {
    const modal = this;
    modal.$el.trigger(`modal:opened ${modal.type.toLowerCase()}:opened`);
    modal.emit(`local::opened modalOpened ${modal.type}Opened`, modal);
  }

  onClose() {
    const modal = this;
    modal.opened = false;
    if (!modal.type || !modal.$el) return;
    openedModals.splice(openedModals.indexOf(modal), 1);
    $('html').removeClass(`with-modal-${modal.type.toLowerCase()}`);
    modal.$el.trigger(`modal:close ${modal.type.toLowerCase()}:close`);
    modal.emit(`local::close modalClose ${modal.type}Close`, modal);
  }

  onClosed() {
    const modal = this;
    if (!modal.type || !modal.$el) return;
    modal.$el.removeClass('modal-out');
    modal.$el.hide();
    modal.$el.trigger(`modal:closed ${modal.type.toLowerCase()}:closed`);
    modal.emit(`local::closed modalClosed ${modal.type}Closed`, modal);
  }

  open(animateModal) {
    const modal = this;
    const {app, $el, type, $backdropEl} = modal;
    const {moveToRoot} = modal.params;

    let animate = true;
    if (typeof animateModal !== 'undefined') animate = animateModal;
    else if (typeof modal.params.animate !== 'undefined') {
      animate = modal.params.animate;
    }

    if (!$el || $el.hasClass('modal-in')) {
      return modal;
    }

    if (type === 'dialog' && app.params.modal.queueDialogs) {
      let pushToQueue;
      if ($('.dialog.modal-in').length > 0) {
        pushToQueue = true;
      } else if (openedModals.length > 0) {
        openedModals.forEach(openedModal => {
          if (openedModal.type === 'dialog') pushToQueue = true;
        });
      }
      if (pushToQueue) {
        dialogsQueue.push(modal);
        return modal;
      }
    }

    const $modalParentEl = $el.parent();
    const wasInDom = $el.parents(document).length > 0;
    if (
      moveToRoot &&
      app.params.modal.moveToRoot &&
      !$modalParentEl.is(app.root)
    ) {
      app.root.append($el);
      modal.once(`${type}Closed`, () => {
        if (wasInDom) {
          $modalParentEl.append($el);
        } else {
          $el.remove();
        }
      });
    }
    // Show Modal
    $el.show();

    /* eslint no-underscore-dangle: ["error", { "allow": ["_clientLeft"] }] */
    modal._clientLeft = $el[0].clientLeft;

    // Modal
    function transitionEnd() {
      if ($el.hasClass('modal-out')) {
        modal.onClosed();
      } else if ($el.hasClass('modal-in')) {
        modal.onOpened();
      }
    }
    if (animate) {
      if ($backdropEl) {
        $backdropEl.removeClass('not-animated');
        $backdropEl.addClass('backdrop-in');
      }
      $el.animationEnd(() => {
        transitionEnd();
      });
      $el.transitionEnd(() => {
        transitionEnd();
      });
      $el.removeClass('modal-out not-animated').addClass('modal-in');
      modal.onOpen();
    } else {
      if ($backdropEl) {
        $backdropEl.addClass('backdrop-in not-animated');
      }
      $el.removeClass('modal-out').addClass('modal-in not-animated');
      modal.onOpen();
      modal.onOpened();
    }

    return modal;
  }

  close(animateModal) {
    const modal = this;
    const $el = modal.$el;
    const $backdropEl = modal.$backdropEl;

    let animate = true;
    if (typeof animateModal !== 'undefined') animate = animateModal;
    else if (typeof modal.params.animate !== 'undefined') {
      animate = modal.params.animate;
    }

    if (!$el || !$el.hasClass('modal-in')) {
      if (dialogsQueue.indexOf(modal) >= 0) {
        dialogsQueue.splice(dialogsQueue.indexOf(modal), 1);
      }
      return modal;
    }

    // backdrop
    if ($backdropEl) {
      let needToHideBackdrop = true;
      if (modal.type === 'popup') {
        modal.$el.prevAll('.popup.modal-in').each((index, popupEl) => {
          const popupInstance = popupEl.f7Modal;
          if (!popupInstance) return;
          if (
            popupInstance.params.closeByBackdropClick &&
            popupInstance.params.backdrop &&
            popupInstance.backdropEl === modal.backdropEl
          ) {
            needToHideBackdrop = false;
          }
        });
      }
      if (needToHideBackdrop) {
        $backdropEl[animate ? 'removeClass' : 'addClass']('not-animated');
        $backdropEl.removeClass('backdrop-in');
      }
    }

    // Modal
    $el[animate ? 'removeClass' : 'addClass']('not-animated');
    function transitionEnd() {
      if ($el.hasClass('modal-out')) {
        modal.onClosed();
      } else if ($el.hasClass('modal-in')) {
        modal.onOpened();
      }
    }
    if (animate) {
      $el.animationEnd(() => {
        transitionEnd();
      });
      $el.transitionEnd(() => {
        transitionEnd();
      });
      $el.removeClass('modal-in').addClass('modal-out');
      // Emit close
      modal.onClose();
    } else {
      $el
        .addClass('not-animated')
        .removeClass('modal-in')
        .addClass('modal-out');
      // Emit close
      modal.onClose();
      modal.onClosed();
    }

    if (modal.type === 'dialog') {
      clearDialogsQueue();
    }

    return modal;
  }

  destroy() {
    const modal = this;
    if (modal.destroyed) return;
    modal.emit(
      `local::beforeDestroy modalBeforeDestroy ${modal.type}BeforeDestroy`,
      modal
    );
    if (modal.$el) {
      modal.$el.trigger(
        `modal:beforedestroy ${modal.type.toLowerCase()}:beforedestroy`
      );
      if (modal.$el.length && modal.$el[0].f7Modal) {
        delete modal.$el[0].f7Modal;
      }
    }
    Utils.deleteProps(modal);
    modal.destroyed = true;
  }
}
