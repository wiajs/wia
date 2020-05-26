import {
  ACTION_CROP,
  CLASS_CROP,
  CLASS_MODAL,
  DATA_ACTION,
  DRAG_MODE_CROP,
  DRAG_MODE_MOVE,
  DRAG_MODE_NONE,
  EVENT_CROP_END,
  EVENT_CROP_MOVE,
  EVENT_CROP_START,
  REGEXP_ACTIONS,
} from './constant';
import {getPointer} from './util';

export default {
  resize() {
    if (this.disabled) {
      return;
    }

    const {opt, container, containerData} = this;
    const ratio = container.offsetWidth / containerData.width;

    // Resize when width changed or height changed
    if (ratio !== 1 || container.offsetHeight !== containerData.height) {
      let canvasData;
      let cropBoxData;

      if (opt.restore) {
        canvasData = this.getCanvasData();
        cropBoxData = this.getCropBoxData();
      }

      this.render();

      if (opt.restore) {
        this.setCanvasData(
          $.forEach(canvasData, (n, i) => {
            canvasData[i] = n * ratio;
          })
        );
        this.setCropBoxData(
          $.forEach(cropBoxData, (n, i) => {
            cropBoxData[i] = n * ratio;
          })
        );
      }
    }
  },

  dblclick() {
    if (this.disabled || this.opt.dragMode === DRAG_MODE_NONE) {
      return;
    }

    this.setDragMode(
      this.dragBox.hasClass(CLASS_CROP) ? DRAG_MODE_MOVE : DRAG_MODE_CROP
    );
  },

  cropStart(event) {
    const {buttons, button} = event;

    if (
      this.disabled ||
      // Handle mouse event and pointer event and ignore touch event
      ((event.type === 'mousedown' ||
        (event.type === 'pointerdown' && event.pointerType === 'mouse')) &&
        // No primary button (Usually the left button)
        (($.isNumber(buttons) && buttons !== 1) ||
          ($.isNumber(button) && button !== 0) ||
          // Open context menu
          event.ctrlKey))
    ) {
      return;
    }

    const {opt, pointers} = this;

    if (event.changedTouches) {
      // Handle touch event
      $.forEach(event.changedTouches, touch => {
        pointers[touch.identifier] = getPointer(touch);
      });
    } else {
      // Handle mouse event and pointer event
      pointers[event.pointerId || 0] = getPointer(event);
    }

    const action = $(event.target).data(DATA_ACTION);

    if (!REGEXP_ACTIONS.test(action)) {
      return;
    }

    // // 触发 dom 节点事件
    // $(this.element).trigger(EVENT_CROP_START, {
    //   originalEvent: event,
    //   action,
    // });

    // 触发组件事件
    this.emit(`local::${EVENT_CROP_START} cropper${EVENT_CROP_START}`, {
      el: this.el,
      originalEvent: event,
      action,
    });

    // 调用事件处理函数，事件处理函数调用Event.preventDefault()
    // 则返回值为false；否则返回true
    // if (
    //   dispatchEvent(this.element, EVENT_CROP_START, {
    //     originalEvent: event,
    //     action,
    //   }) === false
    // ) {
    //   return;
    // }

    // This line is required for preventing page zooming in iOS browsers
    event.preventDefault();

    this.action = action;
    this.cropping = false;

    if (action === ACTION_CROP) {
      this.cropping = true;
      this.dragBox.addClass(CLASS_MODAL);
    }
  },

  cropMove(event) {
    const {action} = this;

    if (this.disabled || !action) {
      return;
    }

    const {pointers} = this;

    event.preventDefault();

    // 触发组件事件
    this.emit(`local::${EVENT_CROP_MOVE} cropper${EVENT_CROP_MOVE}`, {
      el: this.el,
      originalEvent: event,
      action,
    });

    // if (
    //   dispatchEvent(this.element, EVENT_CROP_MOVE, {
    //     originalEvent: event,
    //     action,
    //   }) === false
    // ) {
    //   return;
    // }

    if (event.changedTouches) {
      $.forEach(event.changedTouches, touch => {
        // The first parameter should not be undefined (#432)
        $.assign(pointers[touch.identifier] || {}, getPointer(touch, true));
      });
    } else {
      $.assign(pointers[event.pointerId || 0] || {}, getPointer(event, true));
    }

    this.change(event);
  },

  cropEnd(event) {
    if (this.disabled) {
      return;
    }

    const {action, pointers} = this;

    if (event.changedTouches) {
      $.forEach(event.changedTouches, touch => {
        delete pointers[touch.identifier];
      });
    } else {
      delete pointers[event.pointerId || 0];
    }

    if (!action) {
      return;
    }

    event.preventDefault();

    if (!Object.keys(pointers).length) {
      this.action = '';
    }

    if (this.cropping) {
      this.cropping = false;
      this.dragBox.toggleClass(CLASS_MODAL, this.cropped && this.opt.modal);
    }

    // 触发组件事件
    this.emit(`local::${EVENT_CROP_END} cropper${EVENT_CROP_END}`, {
      el: this.el,
      originalEvent: event,
      action,
    });
  },
};
