import {DATA_PREVIEW} from './constant';
import {forEach, getTransforms} from './util';

export default {
  initPreview() {
    const {el, crossOrigin} = this;
    const {preview} = this.opt;
    const url = crossOrigin ? this.crossOriginUrl : this.url;
    const alt = el.alt || 'The image to preview';
    const image = document.createElement('img');

    if (crossOrigin) {
      image.crossOrigin = crossOrigin;
    }

    image.src = url;
    image.alt = alt;
    this.viewBox.append(image);
    this.viewBoxImage = image;

    if (!preview) {
      return;
    }

    let previews = preview;

    if (typeof preview === 'string') {
      previews = el.ownerDocument.querySelectorAll(preview);
    } else if (preview.querySelector) {
      previews = [preview];
    }

    this.previews = previews;

    forEach(previews, el => {
      const img = document.createElement('img');

      // Save the original size for recover
      $(el).data(DATA_PREVIEW, {
        width: el.offsetWidth,
        height: el.offsetHeight,
        html: el.innerHTML,
      });

      if (crossOrigin) {
        img.crossOrigin = crossOrigin;
      }

      img.src = url;
      img.alt = alt;

      /**
       * Override img element styles
       * Add `display:block` to avoid margin top issue
       * Add `height:auto` to override `height` attribute on IE8
       * (Occur only when margin-top <= -height)
       */
      img.style.cssText =
        'display:block;' +
        'width:100%;' +
        'height:auto;' +
        'min-width:0!important;' +
        'min-height:0!important;' +
        'max-width:none!important;' +
        'max-height:none!important;' +
        'image-orientation:0deg!important;"';

      el.innerHTML = '';
      el.appendChild(img);
    });
  },

  resetPreview() {
    forEach(this.previews, element => {
      const data = $(element).data(DATA_PREVIEW);

      $(element).css({
        width: data.width,
        height: data.height,
      });

      element.innerHTML = data.html;
      $(element).removeData(DATA_PREVIEW);
    });
  },

  preview() {
    const {imageData, canvasData, cropBoxData} = this;
    const {width: cropBoxWidth, height: cropBoxHeight} = cropBoxData;
    const {width, height} = imageData;
    const left = cropBoxData.left - canvasData.left - imageData.left;
    const top = cropBoxData.top - canvasData.top - imageData.top;

    if (!this.cropped || this.disabled) {
      return;
    }

    $(this.viewBoxImage).css(
      $.assign(
        {
          width,
          height,
        },
        getTransforms(
          $.assign(
            {
              translateX: -left,
              translateY: -top,
            },
            imageData
          )
        )
      )
    );

    forEach(this.previews, element => {
      const data = $(element).data(DATA_PREVIEW);
      const originalWidth = data.width;
      const originalHeight = data.height;
      let newWidth = originalWidth;
      let newHeight = originalHeight;
      let ratio = 1;

      if (cropBoxWidth) {
        ratio = originalWidth / cropBoxWidth;
        newHeight = cropBoxHeight * ratio;
      }

      if (cropBoxHeight && newHeight > originalHeight) {
        ratio = originalHeight / cropBoxHeight;
        newWidth = cropBoxWidth * ratio;
        newHeight = originalHeight;
      }

      $(element).setStyle({
        width: newWidth,
        height: newHeight,
      });

      $(element)
        .findNode('img')
        .css(
          $.assign(
            {
              width: width * ratio,
              height: height * ratio,
            },
            getTransforms(
              $.assign(
                {
                  translateX: -left * ratio,
                  translateY: -top * ratio,
                },
                imageData
              )
            )
          )
        );
    });
  },
};
