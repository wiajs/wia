import {
  EVENT_CROP,
  EVENT_CROP_END,
  EVENT_CROP_MOVE,
  EVENT_CROP_START,
  EVENT_DBLCLICK,
  EVENT_POINTER_DOWN,
  EVENT_POINTER_MOVE,
  EVENT_POINTER_UP,
  EVENT_RESIZE,
} from './constant';

export default {
  bind() {
    const {el, opt, cropper} = this;

    cropper.on(
      EVENT_POINTER_DOWN,
      (this.onCropStart = this.cropStart.bind(this))
    );

    if (opt.toggleDragModeOnDblclick) {
      cropper.on(EVENT_DBLCLICK, (this.onDblclick = this.dblclick.bind(this)));
    }

    $(el.ownerDocument).on(
      EVENT_POINTER_MOVE,
      (this.onCropMove = this.cropMove.bind(this))
    );
    $(el.ownerDocument).on(
      EVENT_POINTER_UP,
      (this.onCropEnd = this.cropEnd.bind(this))
    );

    if (opt.responsive) {
      $(window).on(EVENT_RESIZE, (this.onResize = this.resize.bind(this)));
    }
  },

  unbind() {
    const {el, opt, cropper} = this;

    cropper.off(EVENT_POINTER_DOWN, this.onCropStart);

    if (opt.toggleDragModeOnDblclick) {
      cropper.off(EVENT_DBLCLICK, this.onDblclick);
    }

    $(el.ownerDocument).off(EVENT_POINTER_MOVE, this.onCropMove);
    $(el.ownerDocument).off(EVENT_POINTER_UP, this.onCropEnd);

    if (opt.responsive) {
      $(window).off(EVENT_RESIZE, this.onResize);
    }
  },
};
