import {
  CLASS_CROP,
  CLASS_DISABLED,
  CLASS_HIDDEN,
  CLASS_MODAL,
  CLASS_MOVE,
  DATA_ACTION,
  DRAG_MODE_CROP,
  DRAG_MODE_MOVE,
  DRAG_MODE_NONE,
  NAMESPACE,
} from './constant';

import {
  forEach,
  getAdjustedSizes,
  getPointersCenter,
  getSourceCanvas,
  isPlainObject,
  isUndefined,
  normalizeDecimalNumber,
} from './util';

export default {
  // Show the crop box manually
  crop() {
    if (this.ready && !this.cropped && !this.disabled) {
      this.cropped = true;
      this.limitCropBox(true, true);

      if (this.opt.modal) this.dragBox.addClass(CLASS_MODAL);

      this.cropBox.removeClass(CLASS_HIDDEN);
      this.setCropBoxData(this.initialCropBoxData);
    }

    return this;
  },

  // Reset the image and crop box to their initial states
  reset() {
    if (this.ready && !this.disabled) {
      this.imageData = $.assign({}, this.initialImageData);
      this.canvasData = $.assign({}, this.initialCanvasData);
      this.cropBoxData = $.assign({}, this.initialCropBoxData);
      this.renderCanvas();

      if (this.cropped) {
        this.renderCropBox();
      }
    }

    return this;
  },

  // Clear the crop box
  clear() {
    if (this.cropped && !this.disabled) {
      $.assign(this.cropBoxData, {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
      });

      this.cropped = false;
      this.renderCropBox();
      this.limitCanvas(true, true);

      // Render canvas after crop box rendered
      this.renderCanvas();
      this.dragBox.removeClass(CLASS_MODAL);
      this.cropBox.addClass(CLASS_HIDDEN);
    }

    return this;
  },

  /**
   * Replace the image's src and rebuild the cropper
   * @param {string} url - The new URL.
   * @param {boolean} [hasSameSize] - Indicate if the new image has the same size as the old one.
   * @returns {Cropper} this
   */
  replace(url, hasSameSize = false) {
    if (!this.disabled && url) {
      if (this.isImg) {
        this.el.src = url;
      }

      if (hasSameSize) {
        this.url = url;
        this.image.src = url;

        if (this.ready) {
          this.viewBoxImage.src = url;

          forEach(this.previews, element => {
            element.getElementsByTagName('img')[0].src = url;
          });
        }
      } else {
        if (this.isImg) {
          this.replaced = true;
        }

        this.opt.data = null;
        this.uncreate();
        this.load(url);
      }
    }

    return this;
  },

  // Enable (unfreeze) the cropper
  enable() {
    if (this.ready && this.disabled) {
      this.disabled = false;
      removeClass(this.cropper, CLASS_DISABLED);
    }

    return this;
  },

  // Disable (freeze) the cropper
  disable() {
    if (this.ready && !this.disabled) {
      this.disabled = true;
      this.cropper.addClass(CLASS_DISABLED);
    }

    return this;
  },

  /**
   * Destroy the cropper and remove the instance from the image
   * @returns {Cropper} this
   */
  destroy() {
    const {el} = this;

    if (!el[NAMESPACE]) {
      return this;
    }

    el[NAMESPACE] = undefined;

    if (this.isImg && this.replaced) {
      el.src = this.originalUrl;
    }

    this.uncreate();
    return this;
  },

  /**
   * Move the canvas with relative offsets
   * @param {number} offsetX - The relative offset distance on the x-axis.
   * @param {number} [offsetY=offsetX] - The relative offset distance on the y-axis.
   * @returns {Cropper} this
   */
  move(offsetX, offsetY = offsetX) {
    const {left, top} = this.canvasData;

    return this.moveTo(
      isUndefined(offsetX) ? offsetX : left + Number(offsetX),
      isUndefined(offsetY) ? offsetY : top + Number(offsetY)
    );
  },

  /**
   * Move the canvas to an absolute point
   * @param {number} x - The x-axis coordinate.
   * @param {number} [y=x] - The y-axis coordinate.
   * @returns {Cropper} this
   */
  moveTo(x, y = x) {
    const {canvasData} = this;
    let changed = false;

    x = Number(x);
    y = Number(y);

    if (this.ready && !this.disabled && this.opt.movable) {
      if ($.isNumber(x)) {
        canvasData.left = x;
        changed = true;
      }

      if ($.isNumber(y)) {
        canvasData.top = y;
        changed = true;
      }

      if (changed) {
        this.renderCanvas(true);
      }
    }

    return this;
  },

  /**
   * Get the cropped area position and size data (base on the original image)
   * @param {boolean} [rounded=false] - Indicate if round the data values or not.
   * @returns {Object} The result cropped data.
   */
  getData(rounded = false) {
    const {opt, imageData, canvasData, cropBoxData} = this;
    let data;

    if (this.ready && this.cropped) {
      data = {
        x: cropBoxData.left - canvasData.left,
        y: cropBoxData.top - canvasData.top,
        width: cropBoxData.width,
        height: cropBoxData.height,
      };

      const ratio = imageData.width / imageData.naturalWidth;

      forEach(data, (n, i) => {
        data[i] = n / ratio;
      });

      if (rounded) {
        // In case rounding off leads to extra 1px in right or bottom border
        // we should round the top-left corner and the dimension (#343).
        const bottom = Math.round(data.y + data.height);
        const right = Math.round(data.x + data.width);

        data.x = Math.round(data.x);
        data.y = Math.round(data.y);
        data.width = right - data.x;
        data.height = bottom - data.y;
      }
    } else {
      data = {
        x: 0,
        y: 0,
        width: 0,
        height: 0,
      };
    }

    return data;
  },

  /**
   * Set the cropped area position and size with new data
   * @param {Object} data - The new data.
   * @returns {Cropper} this
   */
  setData(data) {
    const {opt, imageData, canvasData} = this;
    const cropBoxData = {};

    if (this.ready && !this.disabled && isPlainObject(data)) {
      const ratio = imageData.width / imageData.naturalWidth;

      if ($.isNumber(data.x)) {
        cropBoxData.left = data.x * ratio + canvasData.left;
      }

      if ($.isNumber(data.y)) {
        cropBoxData.top = data.y * ratio + canvasData.top;
      }

      if ($.isNumber(data.width)) {
        cropBoxData.width = data.width * ratio;
      }

      if ($.isNumber(data.height)) {
        cropBoxData.height = data.height * ratio;
      }

      this.setCropBoxData(cropBoxData);
    }

    return this;
  },

  /**
   * Get the container size data.
   * @returns {Object} The result container data.
   */
  getContainerData() {
    return this.ready ? $.assign({}, this.containerData) : {};
  },

  /**
   * Get the image position and size data.
   * @returns {Object} The result image data.
   */
  getImageData() {
    return this.sized ? $.assign({}, this.imageData) : {};
  },

  /**
   * Get the canvas position and size data.
   * @returns {Object} The result canvas data.
   */
  getCanvasData() {
    const {canvasData} = this;
    const data = {};

    if (this.ready) {
      forEach(
        ['left', 'top', 'width', 'height', 'naturalWidth', 'naturalHeight'],
        n => {
          data[n] = canvasData[n];
        }
      );
    }

    return data;
  },

  /**
   * Set the canvas position and size with new data.
   * @param {Object} data - The new canvas data.
   * @returns {Cropper} this
   */
  setCanvasData(data) {
    const {canvasData} = this;
    const {aspectRatio} = canvasData;

    if (this.ready && !this.disabled && isPlainObject(data)) {
      if ($.isNumber(data.left)) {
        canvasData.left = data.left;
      }

      if ($.isNumber(data.top)) {
        canvasData.top = data.top;
      }

      if ($.isNumber(data.width)) {
        canvasData.width = data.width;
        canvasData.height = data.width / aspectRatio;
      } else if ($.isNumber(data.height)) {
        canvasData.height = data.height;
        canvasData.width = data.height * aspectRatio;
      }

      this.renderCanvas(true);
    }

    return this;
  },

  /**
   * Get the crop box position and size data.
   * @returns {Object} The result crop box data.
   */
  getCropBoxData() {
    const {cropBoxData} = this;
    let data;

    if (this.ready && this.cropped) {
      data = {
        left: cropBoxData.left,
        top: cropBoxData.top,
        width: cropBoxData.width,
        height: cropBoxData.height,
      };
    }

    return data || {};
  },

  /**
   * Set the crop box position and size with new data.
   * @param {Object} data - The new crop box data.
   * @returns {Cropper} this
   */
  setCropBoxData(data) {
    const {cropBoxData} = this;
    const {aspectRatio} = this.opt;
    let widthChanged;
    let heightChanged;

    if (this.ready && this.cropped && !this.disabled && isPlainObject(data)) {
      if ($.isNumber(data.left)) {
        cropBoxData.left = data.left;
      }

      if ($.isNumber(data.top)) {
        cropBoxData.top = data.top;
      }

      if ($.isNumber(data.width) && data.width !== cropBoxData.width) {
        widthChanged = true;
        cropBoxData.width = data.width;
      }

      if ($.isNumber(data.height) && data.height !== cropBoxData.height) {
        heightChanged = true;
        cropBoxData.height = data.height;
      }

      if (aspectRatio) {
        if (widthChanged) {
          cropBoxData.height = cropBoxData.width / aspectRatio;
        } else if (heightChanged) {
          cropBoxData.width = cropBoxData.height * aspectRatio;
        }
      }

      this.renderCropBox();
    }

    return this;
  },

  /**
   * Get a canvas drawn the cropped image.
   * @param {Object} [opt={}] - The config opt.
   * @returns {HTMLCanvasElement} - The result canvas.
   */
  getCroppedCanvas(opt = {}) {
    if (!this.ready || !window.HTMLCanvasElement) {
      return null;
    }

    const {canvasData} = this;
    const source = getSourceCanvas(this.image, this.imageData, canvasData, opt);

    // Returns the source canvas if it is not cropped.
    if (!this.cropped) {
      return source;
    }

    let {
      x: initialX,
      y: initialY,
      width: initialWidth,
      height: initialHeight,
    } = this.getData();
    const ratio = source.width / Math.floor(canvasData.naturalWidth);

    if (ratio !== 1) {
      initialX *= ratio;
      initialY *= ratio;
      initialWidth *= ratio;
      initialHeight *= ratio;
    }

    const aspectRatio = initialWidth / initialHeight;
    const maxSizes = getAdjustedSizes({
      aspectRatio,
      width: opt.maxWidth || Infinity,
      height: opt.maxHeight || Infinity,
    });
    const minSizes = getAdjustedSizes(
      {
        aspectRatio,
        width: opt.minWidth || 0,
        height: opt.minHeight || 0,
      },
      'cover'
    );
    let {width, height} = getAdjustedSizes({
      aspectRatio,
      width: opt.width || (ratio !== 1 ? source.width : initialWidth),
      height: opt.height || (ratio !== 1 ? source.height : initialHeight),
    });

    width = Math.min(maxSizes.width, Math.max(minSizes.width, width));
    height = Math.min(maxSizes.height, Math.max(minSizes.height, height));

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    canvas.width = normalizeDecimalNumber(width);
    canvas.height = normalizeDecimalNumber(height);

    context.fillStyle = opt.fillColor || 'transparent';
    context.fillRect(0, 0, width, height);

    const {imageSmoothingEnabled = true, imageSmoothingQuality} = opt;

    context.imageSmoothingEnabled = imageSmoothingEnabled;

    if (imageSmoothingQuality) {
      context.imageSmoothingQuality = imageSmoothingQuality;
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D.drawImage
    const sourceWidth = source.width;
    const sourceHeight = source.height;

    // Source canvas parameters
    let srcX = initialX;
    let srcY = initialY;
    let srcWidth;
    let srcHeight;

    // Destination canvas parameters
    let dstX;
    let dstY;
    let dstWidth;
    let dstHeight;

    if (srcX <= -initialWidth || srcX > sourceWidth) {
      srcX = 0;
      srcWidth = 0;
      dstX = 0;
      dstWidth = 0;
    } else if (srcX <= 0) {
      dstX = -srcX;
      srcX = 0;
      srcWidth = Math.min(sourceWidth, initialWidth + srcX);
      dstWidth = srcWidth;
    } else if (srcX <= sourceWidth) {
      dstX = 0;
      srcWidth = Math.min(initialWidth, sourceWidth - srcX);
      dstWidth = srcWidth;
    }

    if (srcWidth <= 0 || srcY <= -initialHeight || srcY > sourceHeight) {
      srcY = 0;
      srcHeight = 0;
      dstY = 0;
      dstHeight = 0;
    } else if (srcY <= 0) {
      dstY = -srcY;
      srcY = 0;
      srcHeight = Math.min(sourceHeight, initialHeight + srcY);
      dstHeight = srcHeight;
    } else if (srcY <= sourceHeight) {
      dstY = 0;
      srcHeight = Math.min(initialHeight, sourceHeight - srcY);
      dstHeight = srcHeight;
    }

    const params = [srcX, srcY, srcWidth, srcHeight];

    // Avoid "IndexSizeError"
    if (dstWidth > 0 && dstHeight > 0) {
      const scale = width / initialWidth;

      params.push(
        dstX * scale,
        dstY * scale,
        dstWidth * scale,
        dstHeight * scale
      );
    }

    // All the numerical parameters should be integer for `drawImage`
    // https://github.com/fengyuanchen/cropper/issues/476
    context.drawImage(
      source,
      ...params.map(param => Math.floor(normalizeDecimalNumber(param)))
    );

    return canvas;
  },

  /**
   * Change the aspect ratio of the crop box.
   * @param {number} aspectRatio - The new aspect ratio.
   * @returns {Cropper} this
   */
  setAspectRatio(aspectRatio) {
    const {opt} = this;

    if (!this.disabled && !isUndefined(aspectRatio)) {
      // 0 -> NaN
      opt.aspectRatio = Math.max(0, aspectRatio) || NaN;

      if (this.ready) {
        this.initCropBox();

        if (this.cropped) {
          this.renderCropBox();
        }
      }
    }

    return this;
  },

  /**
   * Change the drag mode.
   * @param {string} mode - The new drag mode.
   * @returns {Cropper} this
   */
  setDragMode(mode) {
    const {opt, dragBox, face} = this;

    if (this.ready && !this.disabled) {
      const croppable = mode === DRAG_MODE_CROP;
      const movable = opt.movable && mode === DRAG_MODE_MOVE;

      mode = croppable || movable ? mode : DRAG_MODE_NONE;

      opt.dragMode = mode;
      dragBox.data(DATA_ACTION, mode);
      dragBox
        .toggleClass(CLASS_CROP, croppable)
        .toggleClass(CLASS_MOVE, movable);

      if (!opt.cropBoxMovable) {
        // Sync drag mode to crop box when it is not movable
        face.data(DATA_ACTION, mode);
        face
          .toggleClass(CLASS_CROP, croppable)
          .toggleClass(CLASS_MOVE, movable);
      }
    }

    return this;
  },
};
