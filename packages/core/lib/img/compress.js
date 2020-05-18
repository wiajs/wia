/**
 * Fork from https://github.com/fengyuanchen/compressorjs
 * use example:
 
import axios from 'axios';
import Compressor from 'compressorjs';

document.getElementById('file').addEventListener('change', (e) => {
  const file = e.target.files[0];

  if (!file) {
    return;
  }

  new Compressor(file, {
    quality: 0.6,
    success(result) {
      const formData = new FormData();

      // The third parameter is required for server
      formData.append('file', result, result.name);

      // Send the compressed image file to server with XMLHttpRequest.
      axios.post('/path/to/upload', formData).then(() => {
        console.log('Upload success');
      });
    },
    error(err) {
      console.log(err.message);
    },
  });
});

 */

import {
  toBlob,
  isBlob,
  arrayBufferToDataURL,
  imageTypeToExtension,
  isImageType,
  normalizeDecimalNumber,
  parseOrientation,
  resetAndGetOrientation,
} from './util';

const {ArrayBuffer, FileReader} = window;
const URL = window.URL || window.webkitURL;
const REGEXP_EXTENSION = /\.\w+$/;
const AnotherCompressor = window.Compressor;

const DEFAULTS = {
  /**
   * Indicates if output the original image instead of the compressed one
   * when the size of the compressed image is greater than the original one's
   * @type {boolean}
   */
  strict: true,

  /**
   * Indicates if read the image's Exif Orientation information,
   * and then rotate or flip the image automatically.
   * @type {boolean}
   */
  checkOrientation: true,

  /**
   * The max width of the output image.
   * @type {number}
   */
  maxWidth: Infinity,

  /**
   * The max height of the output image.
   * @type {number}
   */
  maxHeight: Infinity,

  /**
   * The min width of the output image.
   * @type {number}
   */
  minWidth: 0,

  /**
   * The min height of the output image.
   * @type {number}
   */
  minHeight: 0,

  /**
   * The width of the output image.
   * If not specified, the natural width of the source image will be used.
   * @type {number}
   */
  width: undefined,

  /**
   * The height of the output image.
   * If not specified, the natural height of the source image will be used.
   * @type {number}
   */
  height: undefined,

  /**
   * The quality of the output image.
   * It must be a number between `0` and `1`,
   * and only available for `image/jpeg` and `image/webp` images.
   * Check out {@link https://developer.mozilla.org/en-US/docs/Web/API/HTMLCanvasElement/toBlob canvas.toBlob}.
   * @type {number}
   */
  quality: 0.8,

  /**
   * The mime type of the output image.
   * By default, the original mime type of the source image file will be used.
   * @type {string}
   */
  mimeType: 'auto',

  /**
   * PNG files over this value (5 MB by default) will be converted to JPEGs.
   * To disable this, just set the value to `Infinity`.
   * @type {number}
   */
  convertSize: 5000000,

  /**
   * The hook function to execute before draw the image into the canvas for compression.
   * @type {Function}
   * @param {CanvasRenderingContext2D} context - The 2d rendering context of the canvas.
   * @param {HTMLCanvasElement} canvas - The canvas for compression.
   * @example
   * function (context, canvas) {
   *   context.fillStyle = '#fff';
   * }
   */
  beforeDraw: null,

  /**
   * The hook function to execute after drew the image into the canvas for compression.
   * @type {Function}
   * @param {CanvasRenderingContext2D} context - The 2d rendering context of the canvas.
   * @param {HTMLCanvasElement} canvas - The canvas for compression.
   * @example
   * function (context, canvas) {
   *   context.filter = 'grayscale(100%)';
   * }
   */
  drew: null,

  /**
   * The hook function to execute when success to compress the image.
   * @type {Function}
   * @param {File} file - The compressed image File object.
   * @example
   * function (file) {
   *   console.log(file);
   * }
   */
  success: null,

  /**
   * The hook function to execute when fail to compress the image.
   * @type {Function}
   * @param {Error} err - An Error object.
   * @example
   * function (err) {
   *   console.log(err.message);
   * }
   */
  error: null,
};

/**
 * Creates a new image compressor.
 * @class
 */
export default class Compress {
  /**
   * The constructor of Compressor.
   * @param {File|Blob} file - The target image file for compressing.
   * @param {Object} [options] - The options for compressing.
   */
  constructor(file, options) {
    this.file = file;
    this.image = new Image();
    this.options = {
      ...DEFAULTS,
      ...options,
    };
    this.aborted = false;
    this.result = null;
    this.init();
  }

  init() {
    const {file, options} = this;

    if (!isBlob(file)) {
      this.fail(new Error('The first argument must be a File or Blob object.'));
      return;
    }

    const mimeType = file.type;

    if (!isImageType(mimeType)) {
      this.fail(
        new Error('The first argument must be an image File or Blob object.')
      );
      return;
    }

    if (!URL || !FileReader) {
      this.fail(
        new Error('The current browser does not support image compression.')
      );
      return;
    }

    if (!ArrayBuffer) {
      options.checkOrientation = false;
    }

    if (URL && !options.checkOrientation) {
      this.load({
        url: URL.createObjectURL(file),
      });
    } else {
      const reader = new FileReader();
      const checkOrientation =
        options.checkOrientation && mimeType === 'image/jpeg';

      this.reader = reader;
      reader.onload = ({target}) => {
        const {result} = target;
        const data = {};

        if (checkOrientation) {
          // Reset the orientation value to its default value 1
          // as some iOS browsers will render image with its orientation
          const orientation = resetAndGetOrientation(result);

          if (orientation > 1 || !URL) {
            // Generate a new URL which has the default orientation value
            data.url = arrayBufferToDataURL(result, mimeType);

            if (orientation > 1) {
              Object.assign(data, parseOrientation(orientation));
            }
          } else {
            data.url = URL.createObjectURL(file);
          }
        } else {
          data.url = result;
        }

        this.load(data);
      };
      reader.onabort = () => {
        this.fail(new Error('Aborted to read the image with FileReader.'));
      };
      reader.onerror = () => {
        this.fail(new Error('Failed to read the image with FileReader.'));
      };
      reader.onloadend = () => {
        this.reader = null;
      };

      if (checkOrientation) {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsDataURL(file);
      }
    }
  }

  load(data) {
    const {file, image} = this;

    image.onload = () => {
      this.draw({
        ...data,
        naturalWidth: image.naturalWidth,
        naturalHeight: image.naturalHeight,
      });
    };
    image.onabort = () => {
      this.fail(new Error('Aborted to load the image.'));
    };
    image.onerror = () => {
      this.fail(new Error('Failed to load the image.'));
    };

    // Match all browsers that use WebKit as the layout engine in iOS devices,
    // such as Safari for iOS, Chrome for iOS, and in-app browsers.
    if (
      window.navigator &&
      /(?:iPad|iPhone|iPod).*?AppleWebKit/i.test(window.navigator.userAgent)
    ) {
      // Fix the `The operation is insecure` error (#57)
      image.crossOrigin = 'anonymous';
    }

    image.alt = file.name;
    image.src = data.url;
  }

  draw({naturalWidth, naturalHeight, rotate = 0, scaleX = 1, scaleY = 1}) {
    const {file, image, options} = this;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const aspectRatio = naturalWidth / naturalHeight;
    const is90DegreesRotated = Math.abs(rotate) % 180 === 90;
    let maxWidth = Math.max(options.maxWidth, 0) || Infinity;
    let maxHeight = Math.max(options.maxHeight, 0) || Infinity;
    let minWidth = Math.max(options.minWidth, 0) || 0;
    let minHeight = Math.max(options.minHeight, 0) || 0;
    let width = Math.max(options.width, 0) || naturalWidth;
    let height = Math.max(options.height, 0) || naturalHeight;

    if (is90DegreesRotated) {
      [maxWidth, maxHeight] = [maxHeight, maxWidth];
      [minWidth, minHeight] = [minHeight, minWidth];
      [width, height] = [height, width];
    }

    if (maxWidth < Infinity && maxHeight < Infinity) {
      if (maxHeight * aspectRatio > maxWidth) {
        maxHeight = maxWidth / aspectRatio;
      } else {
        maxWidth = maxHeight * aspectRatio;
      }
    } else if (maxWidth < Infinity) {
      maxHeight = maxWidth / aspectRatio;
    } else if (maxHeight < Infinity) {
      maxWidth = maxHeight * aspectRatio;
    }

    if (minWidth > 0 && minHeight > 0) {
      if (minHeight * aspectRatio > minWidth) {
        minHeight = minWidth / aspectRatio;
      } else {
        minWidth = minHeight * aspectRatio;
      }
    } else if (minWidth > 0) {
      minHeight = minWidth / aspectRatio;
    } else if (minHeight > 0) {
      minWidth = minHeight * aspectRatio;
    }

    if (height * aspectRatio > width) {
      height = width / aspectRatio;
    } else {
      width = height * aspectRatio;
    }

    width = Math.floor(
      normalizeDecimalNumber(Math.min(Math.max(width, minWidth), maxWidth))
    );
    height = Math.floor(
      normalizeDecimalNumber(Math.min(Math.max(height, minHeight), maxHeight))
    );

    const destX = -width / 2;
    const destY = -height / 2;
    const destWidth = width;
    const destHeight = height;

    if (is90DegreesRotated) {
      [width, height] = [height, width];
    }

    canvas.width = width;
    canvas.height = height;

    if (!isImageType(options.mimeType)) {
      options.mimeType = file.type;
    }

    let fillStyle = 'transparent';

    // Converts PNG files over the `convertSize` to JPEGs.
    if (file.size > options.convertSize && options.mimeType === 'image/png') {
      fillStyle = '#fff';
      options.mimeType = 'image/jpeg';
    }

    // Override the default fill color (#000, black)
    context.fillStyle = fillStyle;
    context.fillRect(0, 0, width, height);

    if (options.beforeDraw) {
      options.beforeDraw.call(this, context, canvas);
    }

    if (this.aborted) {
      return;
    }

    context.save();
    context.translate(width / 2, height / 2);
    context.rotate((rotate * Math.PI) / 180);
    context.scale(scaleX, scaleY);
    context.drawImage(image, destX, destY, destWidth, destHeight);
    context.restore();

    if (options.drew) {
      options.drew.call(this, context, canvas);
    }

    if (this.aborted) {
      return;
    }

    const done = result => {
      if (!this.aborted) {
        this.done({
          naturalWidth,
          naturalHeight,
          result,
        });
      }
    };

    // first use canvas.toBlob
    if (canvas.toBlob) {
      canvas.toBlob(done, options.mimeType, options.quality);
    } else {
      done(toBlob(canvas.toDataURL(options.mimeType, options.quality)));
    }
  }

  done({naturalWidth, naturalHeight, result}) {
    const {file, image, options} = this;

    if (URL && !options.checkOrientation) {
      URL.revokeObjectURL(image.src);
    }

    if (result) {
      // Returns original file if the result is greater than it and without size related options
      if (
        options.strict &&
        result.size > file.size &&
        options.mimeType === file.type &&
        !(
          options.width > naturalWidth ||
          options.height > naturalHeight ||
          options.minWidth > naturalWidth ||
          options.minHeight > naturalHeight
        )
      ) {
        result = file;
      } else {
        const date = new Date();

        result.lastModified = date.getTime();
        result.lastModifiedDate = date;
        result.name = file.name;

        // Convert the extension to match its type
        if (result.name && result.type !== file.type) {
          result.name = result.name.replace(
            REGEXP_EXTENSION,
            imageTypeToExtension(result.type)
          );
        }
      }
    } else {
      // Returns original file if the result is null in some cases.
      result = file;
    }

    this.result = result;

    if (options.success) {
      options.success.call(this, result);
    }
  }

  fail(err) {
    const {options} = this;

    if (options.error) {
      options.error.call(this, err);
    } else {
      throw err;
    }
  }

  abort() {
    if (!this.aborted) {
      this.aborted = true;

      if (this.reader) {
        this.reader.abort();
      } else if (!this.image.complete) {
        this.image.onload = null;
        this.image.onabort();
      } else {
        this.fail(new Error('The compression process has been aborted.'));
      }
    }
  }

  /**
   * Get the no conflict compressor class.
   * @returns {Compressor} The compressor class.
   */
  static noConflict() {
    window.Compress = AnotherCompressor;
    return Compress;
  }

  /**
   * Change the default options.
   * @param {Object} options - The new default options.
   */
  static setDefaults(options) {
    Object.assign(DEFAULTS, options);
  }
}
