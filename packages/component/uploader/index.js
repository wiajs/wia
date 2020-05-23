/**
 * 文件选择、压缩、预览、上传
 * Referenced:
 *  https://github.com/impeiran/Blog/tree/master/uploader
 *  https://weui.io/#uploader
 * 
 *  使用方法：
  _uploader = new Uploader({
    upload: true, // 自动上传
    url: _url, // 上传网址
    dir: 'star/etrip/xhlm', // 图片存储路径，格式: 所有者/应用名称/分类
    el: pg.class('uploader'), // 组件容器
    input: pg.name('avatar'), // 上传成功后的url填入输入框，便于提交
    choose: pg.name('choose'), // 点击触发选择文件，可选，多文件时，可不填

    multiple: false, // 可否同时选择多个文件
    limit: 1, // 文件数限制 0 不限，1 则限制单个文件，如 头像
    accept: 'image/jpg,image/jpeg,image/png,image/gif', // 选择文件类型
    compress: true, // 自动压缩
    quality: 0.5, // 压缩比

    // xhr配置
    data: {}, // 添加到请求头的内容
  });

  _uploader
    .on('success', rs => {
      // 上传成功
    })
    .on('error', rs => {
      // 上传出错
    });

 */

import Compress from '@wiajs/core/lib/img/compress';

const parseError = xhr => {
  let msg = '';
  const {responseText, responseType, status, statusText} = xhr;
  if (!responseText && responseType === 'text') {
    try {
      msg = JSON.parse(responseText);
    } catch (error) {
      msg = responseText;
    }
  } else {
    msg = `${status} ${statusText}`;
  }

  const err = new Error(msg);
  err.status = status;
  return err;
};

const parseSuccess = rs => {
  if (rs) {
    try {
      return JSON.parse(rs);
    } catch (ex) {
      console.log('parseSuccess', {exp: ex.message});
    }
  }

  return rs;
};

export default class Uploader {
  constructor(option = {}) {
    this.id = 1;

    const defaultOption = {
      url: '',
      page: $('.page-current'), // 用于添加大图预览
      el: $('.uploader'), // 预览层
      multiple: true,
      limit: 0,
      upload: true,
      accept: '*',
      compress: true,
      quality: 0.5,
      preview: true, // 是否预览

      headers: {},
      data: {},
      withCredentials: false,
    };

    this.opt = Object.assign(defaultOption, option);

    this.init(this.opt);
  }

  init(opt) {
    this.files = [];

    this.input = this.initInput(opt);

    if (opt.preview) this.gallery = this.initGallery(opt);

    this.bind(opt);
  }

  /**
   * 创建并返回 file input 组件
   * @param {*} opt
   */
  initInput(opt) {
    this.changeHandler = e => {
      let {files} = e.target;
      const type = Object.prototype.toString.call(files);
      if (type === '[object FileList]') {
        files = [].slice.call(files);
      } else if (type === '[object Object]' || type === '[object File]') {
        files = [files];
      }

      const ret = this._callHook('choose', files);
      if (ret !== false) {
        this.loadFiles(ret || files);
      }
    };

    const el = document.createElement('input');

    Object.entries({
      type: 'file',
      accept: opt.accept,
      multiple: opt.multiple,
      hidden: true,
    }).forEach(([key, value]) => {
      el[key] = value;
    });

    el.addEventListener('change', this.changeHandler);
    opt.el.append(el);

    return el;
  }

  initGallery(opt) {
    const tmpl = `
  <div class="gallery">
    <span class="_img"></span>
    <div class="flex-center _opr">
      <a href="javascript:;" name="delete">
        <i class="icon iconfont iconshanchu"></i>
      </a>
    </div>
  </div>`;

    let gal = opt.page.class('gallery');
    if (gal.length === 0) {
      gal = $(tmpl);
      gal.insertBefore(opt.page.class('page-content'));
    }

    gal = opt.page.class('gallery');
    return gal;
  }

  bind(opt) {
    // ontouchstart/addEventListener 有时无法触发文件选择
    // opt.input.dom.onclick = ev => {
    //   this.chooseFile();
    // };
    // 更改input时，显示图片
    opt.input.change(ev => {
      const p = JSON.parse(opt.input.val());
      if (p) {
        this.clear();
        this.files = p.file.map(v => {
          const {dir} = p;
          const host = dir.replace(`/${opt.dir}`, '');
          const f = {
            id: this.id++,
            host,
            dir: opt.dir,
            file: v,
            status: 'upload',
          };
          return f;
        });
        this.preview();
      }
    });

    // 点击预览
    if (opt.el) {
      opt.el.click(ev => {
        // console.log('el click', {ev});
        ev.stopPropagation(); // 阻止冒泡，避免上层 choose再次触发
        ev.preventDefault();
        const file = $(ev.target).closest('._file');
        if (file.length > 0) {
          this.showGallery(file);
        } else this.chooseFile();
      });
    }

    // 点击选择文件
    if (opt.choose) {
      opt.choose.click(ev => {
        // console.log('choose click', {ev});
        this.chooseFile();
      });
    }

    // 图片预览
    if (opt.preview) {
      this.gallery.click(ev => {
        ev.stopPropagation(); // 阻止冒泡，避免上层 choose再次触发
        ev.preventDefault();
        this.gallery.hide();
        // $gallery.fadeOut(100);
      });

      this.gallery.name('delete').click(ev => {
        const file = this.gallery.class('_img').attr('file');
        const id = file.replace('img', '');
        this.remove(id);
      });
    }
  }

  showGallery(file) {
    if (file.length > 0) {
      this.gallery
        .class('_img')
        .attr('style', file.attr('style'))
        .attr('file', file.attr('name'));
      this.gallery.show();
    }
    // $gallery.fadeIn(100);
  }

  on(evt, cb) {
    if (evt && typeof cb === 'function') {
      this['on' + evt] = cb;
    }
    return this;
  }

  _callHook(evt, ...args) {
    if (evt && this['on' + evt]) {
      return this['on' + evt].apply(this, args);
    }

    return;
  }

  chooseFile() {
    this.input.value = '';
    this.input.click();
  }

  loadFiles(files) {
    if (!files) return false;

    if (
      this.opt.limit > 0 &&
      files.length &&
      files.length + this.files.length > this.opt.limit
    ) {
      if (this.opt.limit === 1) this.clear();
      // 单文件替换
      else {
        this._callHook('exceed', files);
        return false;
      }
    }

    this.files = this.files.concat(
      files.map(file => {
        if (file.id && file.rawFile) return file;

        const rg = /(\.(?:jpeg|jpg|png|gif))$/i.exec(file.name);

        return {
          id: this.id++,
          rawFile: file,
          name: file.name,
          ext: rg && rg[1],
          size: file.size,
          status: 'choose',
        };
      })
    );

    this._callHook('change', this.files);
    if (this.opt.preview) this.preview();
    this.opt.upload && this.upload();

    return true;
  }

  /**
   * 添加图片到附件框
   * @param {file} file
   */
  preview() {
    // const fs = this.files.filter(f => f.status === 'choose');
    if (this.files && this.files.length > 0) {
      this.files.forEach(f => {
        let src;
        let tp;
        if (f.status === 'choose') {
          f.status = 'preview';
          const url = window.URL || window.webkitURL || window.mozURL;
          src = url && f.rawFile && url.createObjectURL(f.rawFile);
          tp =
            '<div name="img#id#" class="flex-center _file _status" style="background-image: url(#url#);">' +
            '<div class="_content">50%</div></div>';
        } else if (f.status === 'upload') {
          const n = this.opt.el.name(`img${f.id}`);
          if (n.length === 0) src = `${f.host}/${f.dir}/${f.file}`;
          tp =
            '<div name="img#id#" class="flex-center _file" style="background-image: url(#url#);"></div>';
        }

        if (src) {
          $(tp.replace('#id#', f.id).replace('#url#', src)).insertBefore(
            this.opt.input
          );

          this._callHook('preview', f, this.files);
        }
      });
    }
  }

  compress(file, cb) {
    if (!file || file.compress || file.status === 'upload') return;

    const self = this;
    const press = new Compress(file.rawFile, {
      quality: this.opt.quality,
      success(r) {
        // The third parameter is required for server
        // formData.append('file', r, r.name);
        console.log('compress', {
          name: r.name,
          rate: Math.round((r.size * 100) / file.size, 2),
        });
        file.rawFile = r;
        file.size = r.size;
        file.compress = true;
        // console.log('compress', {r});
        if (cb) cb.call(self, file);
      },
      error(err) {
        console.log(err.message);
      },
    });
  }

  removeFile(file) {
    const id = file.id || file;
    this.remove(id);
  }

  remove(id) {
    const index = this.files.findIndex(f => f.id == id);
    if (index > -1) {
      this.files.splice(index, 1);
      this._callHook('change', this.files);
    }

    this.opt.el.name(`img${id}`).remove();
    this.updateInput();
  }

  /**
   * 上传结果写入 input，不触发 change
   */
  updateInput() {
    const fs = this.files.filter(f => f.status === 'upload');
    console.log('updateInput', {fs});

    if (fs.length > 0) {
      const pic = {
        dir: `${fs[0].host}/${fs[0].dir}`,
        file: fs.map(f => f.file),
      };
      this.opt.input.val(JSON.stringify(pic));
    } else this.opt.input.val('');
  }

  clear() {
    this.id = 1;
    this.files = [];
    this.opt.el.classes('_file').remove();
    this._callHook('change', this.files);
  }

  upload(file) {
    if (!this.files.length && !file) return;

    if (file) {
      const target = this.files.find(
        item => item.id === file.id || item.id === file
      );
      target && target.status !== 'upload' && this.prePost(target);
    } else {
      const fs = this.files.filter(f => f.status !== 'upload');

      fs.forEach(f => {
        this.prePost(f);
      });
    }
  }

  prePost(file) {
    if (this.opt.compress) this.compress(file, f => this.post(f));
    else this.post(file);
  }

  /**
   * 图片上传，将图片转成二进制Blob对象，装入formdata上传
   * 文件上传浏览器自动设置 content-type: multipart/form-data; 分片上传
   * @param {*} file
   */
  async post(file) {
    if (!file.rawFile || file.status === 'upload') return;
    console.log('post', {file});

    let percent = 0;
    let timer = null;
    const self = this;
    const ls = self.opt.input.parent();

    // 数据后50%用模拟进度
    function mockProgress() {
      if (!self.opt.preview || timer) return;
      const t3 = this;

      timer = setInterval(() => {
        percent += 5;

        // $li.find(".progress span").css('width', percent + "%");
        const f = ls.name(`img${file.id}`);
        const content = f.class('_content');
        content.html(`${percent}%`);

        // self.opt.input
        //   .parent()
        //   .name(file.name)
        //   .class('_content')
        //   .html(`${percent}%`);
        // console.log(`... ${percent}%`);

        if (percent >= 99) {
          clearInterval(timer);
          f.removeClass('_status');
          content.remove();
        }
      }, 50);
    }

    const {data, withCredentials} = this.opt;

    const formData = new FormData();
    formData.append(this.opt.dir, file.rawFile, `${file.id}${file.ext}`);

    Object.keys(data).forEach(key => {
      formData.append(key, data[key]);
    });

    const xhr = new XMLHttpRequest();
    xhr.withCredentials = !!withCredentials;

    xhr.open('POST', this.opt.url);
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4)
        if (xhr.status === 200) {
          const rs = parseSuccess(xhr.responseText);
          if (rs.code === 200 && rs.data.length > 0) {
            file.status = 'upload';

            rs.data.forEach(r => {
              if (r.host) {
                const id = r.name.replace(/\.\w+/i, '');
                file.host = r.host;
                file.file = r.file;
                file.dir = r.dir;
                if (this.opt.preview)
                  this.opt.el
                    .name(`img${id}`)
                    .css(
                      'background-image',
                      `url(${r.host}/${r.dir}/${r.file})`
                    );
                else if (this.opt.img)
                  this.opt.img.attr('src', `${r.host}/${r.dir}/${r.file}`);
              }
            });

            this.updateInput();

            this._callHook('success', rs.data, file, this.files);
          }
        } else {
          file.status = 'error';
          this._callHook('error', parseError(xhr), file, this.files);
        }
    };

    xhr.onerror = e => {
      file.status = 'error';
      this._callHook('error', parseError(xhr), file, this.files);
    };

    // 数据发送进度，前50%展示该进度,后50%使用模拟进度!
    xhr.upload.onprogress = e => {
      if (!self.opt.preview || timer) return;
      const {total, loaded} = e;
      percent = total > 0 ? (100 * loaded) / total / 2 : 0;
      console.log(`... ${percent}%`);

      const t2 = this;

      if (percent >= 50) mockProgress();
      else {
        let n = this.opt.input.parent();
        n = n.name(file.name);
        n = n.class('_content');
        n.html(`${percent}%`);
      }

      e.percent = percent;
      this._callHook('progress', e, file, this.files);
    };

    // const headers = getHeaders(this.opt.headers);
    Object.keys(this.opt.headers).forEach(key => {
      xhr.setRequestHeader(key, this.opt.headers[key]);
    });

    console.log('post', {xhr, url: this.opt.url});
    xhr.send(formData);
  }

  destroy() {
    this.input.removeEventHandler('change', this.changeHandler);
    $(this.input).remove();
    this.gallery.remove();
  }
}

function getHeaders(headers) {
  const R = {
    'content-type': `multipart/form-data; boundary=${getBoundary()}`,
  };

  Object.keys(headers).forEach(k => {
    R[k.toLowerCase()] = headers[k];
  });

  return R;
}

function getBoundary() {
  // This generates a 50 character boundary similar to those used by Firefox.
  // They are optimized for boyer-moore parsing.
  let R = '----';
  for (let i = 0; i < 24; i++) {
    R += Math.floor(Math.random() * 10).toString(16);
  }

  return R;
}
