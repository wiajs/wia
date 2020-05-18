/**
 * document 绑定click事件
 * 支持touch则绑定touch，否则绑定click
 * 无论touch 还是 click事件，都会触发事件响应函数
 * @param {*} cb
 */
function bindClick(cb) {
  let touchStartX;
  let touchStartY;
  function touchStart(ev) {
    // ev.preventDefault();
    touchStartX = ev.changedTouches[0].clientX;
    touchStartY = ev.changedTouches[0].clientY;
  }
  function touchEnd(ev) {
    // ev.preventDefault();
    const x = Math.abs(ev.changedTouches[0].clientX - touchStartX);
    const y = Math.abs(ev.changedTouches[0].clientY - touchStartY);
    // console.log('touchEnd', {x, y});

    if (x <= 5 && y <= 5) {
      cb.call(this, ev);
    }
  }

  // 在捕捉时触发，不影响后续冒泡阶段再次触发
  if ($.support.touch) {
    // console.log('bind touch');
    document.addEventListener('touchstart', touchStart, true);
    document.addEventListener('touchend', touchEnd, true);
  } else {
    // console.log('bind click');
    document.addEventListener('click', cb, true);
  }
}

function initClicks(app) {
  function appClick(ev) {
    app.emit({
      events: 'click',
      data: [ev],
    });
  }

  function handleClicks(e) {
    const $clickedEl = $(e.target);
    const $clickedLinkEl = $clickedEl.closest('a');
    const isLink = $clickedLinkEl.length > 0;
    const url = isLink && $clickedLinkEl.attr('href');

    // call Modules Clicks
    Object.keys(app.modules).forEach(moduleName => {
      const moduleClicks = app.modules[moduleName].clicks;
      if (!moduleClicks) return;
      if (e.preventF7Router) return;
      Object.keys(moduleClicks).forEach(clickSelector => {
        const matchingClickedElement = $clickedEl.closest(clickSelector).eq(0);
        if (matchingClickedElement.length > 0) {
          moduleClicks[clickSelector].call(
            app,
            matchingClickedElement,
            matchingClickedElement.dataset(),
            e
          );
        }
      });
    });
  }

  // 绑定click 或 touch 事件，触发时，发射click事件
  bindClick(appClick);
  // click event 响应
  app.on('click', handleClicks);
}

export default {
  name: 'clicks',
  params: {
    clicks: {
      // External Links
      externalLinks: '.ext',
    },
  },
  on: {
    // app 创建时被调用
    init() {
      const app = this;
      initClicks(app);
    },
  },
};
