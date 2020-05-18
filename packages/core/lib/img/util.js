/**
 * Fork from https://github.com/fengyuanchen/compressorjs
 */

const {slice} = Array.prototype;

/**
 * Convert array-like or iterable object to an array.
 * @param {*} value - The value to convert.
 * @returns {Array} Returns a new array.
 */
export function toArray(value) {
  return Array.from ? Array.from(value) : slice.call(value);
}

const REGEXP_IMAGE_TYPE = /^image\/.+$/;

/**
 * Check if the given value is a mime type of image.
 * @param {*} value - The value to check.
 * @returns {boolean} Returns `true` if the given is a mime type of image, else `false`.
 */
export function isImageType(value) {
  return REGEXP_IMAGE_TYPE.test(value);
}

/**
 * Convert image type to extension.
 * @param {string} value - The image type to convert.
 * @returns {boolean} Returns the image extension.
 */
export function imageTypeToExtension(value) {
  let extension = isImageType(value) ? value.substr(6) : '';

  if (extension === 'jpeg') {
    extension = 'jpg';
  }

  return `.${extension}`;
}

const {fromCharCode} = String;

/**
 * Get string from char code in data view.
 * @param {DataView} dataView - The data view for read.
 * @param {number} start - The start index.
 * @param {number} length - The read length.
 * @returns {string} The read result.
 */
export function getStringFromCharCode(dataView, start, length) {
  let str = '';
  let i;

  length += start;

  for (i = start; i < length; i += 1) {
    str += fromCharCode(dataView.getUint8(i));
  }

  return str;
}

const {btoa} = window;

/**
 * Transform array buffer to Data URL.
 * @param {ArrayBuffer} arrayBuffer - The array buffer to transform.
 * @param {string} mimeType - The mime type of the Data URL.
 * @returns {string} The result Data URL.
 */
export function arrayBufferToDataURL(arrayBuffer, mimeType) {
  const chunks = [];
  const chunkSize = 8192;
  let uint8 = new Uint8Array(arrayBuffer);

  while (uint8.length > 0) {
    // XXX: Babel's `toConsumableArray` helper will throw error in IE or Safari 9
    // eslint-disable-next-line prefer-spread
    chunks.push(
      fromCharCode.apply(null, toArray(uint8.subarray(0, chunkSize)))
    );
    uint8 = uint8.subarray(chunkSize);
  }

  return `data:${mimeType};base64,${btoa(chunks.join(''))}`;
}

/**
 * Get orientation value from given array buffer.
 * @param {ArrayBuffer} arrayBuffer - The array buffer to read.
 * @returns {number} The read orientation value.
 */
export function resetAndGetOrientation(arrayBuffer) {
  const dataView = new DataView(arrayBuffer);
  let orientation;

  // Ignores range error when the image does not have correct Exif information
  try {
    let littleEndian;
    let app1Start;
    let ifdStart;

    // Only handle JPEG image (start by 0xFFD8)
    if (dataView.getUint8(0) === 0xff && dataView.getUint8(1) === 0xd8) {
      const length = dataView.byteLength;
      let offset = 2;

      while (offset + 1 < length) {
        if (
          dataView.getUint8(offset) === 0xff &&
          dataView.getUint8(offset + 1) === 0xe1
        ) {
          app1Start = offset;
          break;
        }

        offset += 1;
      }
    }

    if (app1Start) {
      const exifIDCode = app1Start + 4;
      const tiffOffset = app1Start + 10;

      if (getStringFromCharCode(dataView, exifIDCode, 4) === 'Exif') {
        const endianness = dataView.getUint16(tiffOffset);

        littleEndian = endianness === 0x4949;

        if (littleEndian || endianness === 0x4d4d /* bigEndian */) {
          if (dataView.getUint16(tiffOffset + 2, littleEndian) === 0x002a) {
            const firstIFDOffset = dataView.getUint32(
              tiffOffset + 4,
              littleEndian
            );

            if (firstIFDOffset >= 0x00000008) {
              ifdStart = tiffOffset + firstIFDOffset;
            }
          }
        }
      }
    }

    if (ifdStart) {
      const length = dataView.getUint16(ifdStart, littleEndian);
      let offset;
      let i;

      for (i = 0; i < length; i += 1) {
        offset = ifdStart + i * 12 + 2;

        if (
          dataView.getUint16(offset, littleEndian) === 0x0112 /* Orientation */
        ) {
          // 8 is the offset of the current tag's value
          offset += 8;

          // Get the original orientation value
          orientation = dataView.getUint16(offset, littleEndian);

          // Override the orientation with its default value
          dataView.setUint16(offset, 1, littleEndian);
          break;
        }
      }
    }
  } catch (e) {
    orientation = 1;
  }

  return orientation;
}

/**
 * Parse Exif Orientation value.
 * @param {number} orientation - The orientation to parse.
 * @returns {Object} The parsed result.
 */
export function parseOrientation(orientation) {
  let rotate = 0;
  let scaleX = 1;
  let scaleY = 1;

  switch (orientation) {
    // Flip horizontal
    case 2:
      scaleX = -1;
      break;

    // Rotate left 180°
    case 3:
      rotate = -180;
      break;

    // Flip vertical
    case 4:
      scaleY = -1;
      break;

    // Flip vertical and rotate right 90°
    case 5:
      rotate = 90;
      scaleY = -1;
      break;

    // Rotate right 90°
    case 6:
      rotate = 90;
      break;

    // Flip horizontal and rotate right 90°
    case 7:
      rotate = 90;
      scaleX = -1;
      break;

    // Rotate left 90°
    case 8:
      rotate = -90;
      break;

    default:
  }

  return {
    rotate,
    scaleX,
    scaleY,
  };
}

const REGEXP_DECIMALS = /\.\d*(?:0|9){12}\d*$/;

/**
 * Normalize decimal number.
 * Check out {@link https://0.30000000000000004.com/}
 * @param {number} value - The value to normalize.
 * @param {number} [times=100000000000] - The times for normalizing.
 * @returns {number} Returns the normalized number.
 */
export function normalizeDecimalNumber(value, times = 100000000000) {
  return REGEXP_DECIMALS.test(value)
    ? Math.round(value * times) / times
    : value;
}

export function isBlob(input) {
  if (typeof Blob === 'undefined') {
    return false;
  }

  return (
    input instanceof Blob ||
    Object.prototype.toString.call(input) === '[object Blob]'
  );
}

/**
 * for img compress
 * canvas.toBlob(callback, type, encoderOptions);
 * A low performance polyfill based on toDataURL.
 * JavaScript Canvas to Blob
 * https://github.com/blueimp/JavaScript-Canvas-to-Blob
 */
export function toBlob() {
  if (typeof window === 'undefined') return;

  const CanvasPrototype =
    window.HTMLCanvasElement && window.HTMLCanvasElement.prototype;

  const hasBlobConstructor =
    window.Blob &&
    (function () {
      try {
        return Boolean(new Blob());
      } catch (e) {
        return false;
      }
    })();

  const hasArrayBufferViewSupport =
    hasBlobConstructor &&
    window.Uint8Array &&
    (function () {
      try {
        return new Blob([new Uint8Array(100)]).size === 100;
      } catch (e) {
        return false;
      }
    })();

  const BlobBuilder =
    window.BlobBuilder ||
    window.WebKitBlobBuilder ||
    window.MozBlobBuilder ||
    window.MSBlobBuilder;

  const dataURIPattern = /^data:((.*?)(;charset=.*?)?)(;base64)?,/;

  const dataURLtoBlob =
    (hasBlobConstructor || BlobBuilder) &&
    window.atob &&
    window.ArrayBuffer &&
    window.Uint8Array &&
    function (dataURI) {
      // let matches,
      //   mediaType,
      //   isBase64,
      //   dataString,
      //   byteString,
      //   arrayBuffer,
      //   intArray,
      //   i,
      //   bb;
      let byteString;

      // Parse the dataURI components as per RFC 2397
      const matches = dataURI.match(dataURIPattern);
      if (!matches) {
        throw new Error('invalid data URI');
      }
      // Default to text/plain;charset=US-ASCII
      const mediaType = matches[2]
        ? matches[1]
        : 'text/plain' + (matches[3] || ';charset=US-ASCII');
      const isBase64 = !!matches[4];
      const dataString = dataURI.slice(matches[0].length);
      if (isBase64) {
        // Convert base64 to raw binary data held in a string:
        byteString = atob(dataString);
      } else {
        // Convert base64/URLEncoded data component to raw binary:
        byteString = decodeURIComponent(dataString);
      }
      // Write the bytes of the string to an ArrayBuffer:
      const arrayBuffer = new ArrayBuffer(byteString.length);
      const intArray = new Uint8Array(arrayBuffer);
      for (let i = 0; i < byteString.length; i += 1) {
        intArray[i] = byteString.charCodeAt(i);
      }
      // Write the ArrayBuffer (or ArrayBufferView) to a blob:
      if (hasBlobConstructor) {
        return new Blob([hasArrayBufferViewSupport ? intArray : arrayBuffer], {
          type: mediaType,
        });
      }
      const bb = new BlobBuilder();
      bb.append(arrayBuffer);
      return bb.getBlob(mediaType);
    };

  if (window.HTMLCanvasElement && !CanvasPrototype.toBlob) {
    if (CanvasPrototype.mozGetAsFile) {
      CanvasPrototype.toBlob = function (callback, type, quality) {
        const self = this;
        setTimeout(function () {
          if (quality && CanvasPrototype.toDataURL && dataURLtoBlob) {
            callback(dataURLtoBlob(self.toDataURL(type, quality)));
          } else {
            callback(self.mozGetAsFile('blob', type));
          }
        });
      };
    } else if (CanvasPrototype.toDataURL && dataURLtoBlob) {
      if (CanvasPrototype.msToBlob) {
        CanvasPrototype.toBlob = function (callback, type, quality) {
          const self = this;
          setTimeout(function () {
            if (
              ((type && type !== 'image/png') || quality) &&
              CanvasPrototype.toDataURL &&
              dataURLtoBlob
            ) {
              callback(dataURLtoBlob(self.toDataURL(type, quality)));
            } else {
              callback(self.msToBlob(type));
            }
          });
        };
      } else {
        CanvasPrototype.toBlob = function (callback, type, quality) {
          const self = this;
          setTimeout(function () {
            callback(dataURLtoBlob(self.toDataURL(type, quality)));
          });
        };
      }
    }
  }
}
