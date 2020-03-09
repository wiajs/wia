# Wia Core

## 简介

`wia路由`是[wia](https://www.wia.pub)官方路由器。它与 wia 深度集成，从而使构建复杂、大型苹果、安卓手机应用变得轻而易举。

功能包括：

- \$.go(网址)快速切换到任意页面
- 每个页面的 html、css，js 动态加载
- 大型应用被自动拆成一个个小页面，从启动文件中剥离，秒开应用，无需下载安装
- 加载后缓存内存，第二次打开之间从内存获取，非常快
- 页面切换实现动画效果
- 页面无需预先定义
- 页面之间数据通过对象传递
- 支持网址参数传递数据
- 基于 Hash 页内跳转模式，无需刷新整个页面，实现高速切换
- 页面 html 标签 id、样式、代码自动隔离，重名不冲突

## 编译构建

需要安装 Node.js，通过命令行进入当前项目路径。

运行以下指令，安装项目依赖包

```bash
$ npm install
```

生成开发版本:

```bash
$ npm run build-dev
```

生成文件如下:

1. dist/core.common.js
2. dist/core.common.map
3. dist/core.esm.js
4. dist/core.esm.map
5. dist/core.umd.js
6. dist/core.umd.map

生成生产版本 (混淆最小化) :

```bash
$ npm run build
```

生成文件如下:

1. dist/core.common.js
2. dist/core.common.min.js
3. dist/core.esm.js
4. dist/core.esm.min.js
5. dist/core.umd.js
6. dist/core.min.js

## 使用

```js
  import Router from @wiajs/router
```

## hash

- 通过 hash 实现页面切换导航,分离 page 到不同文件,实现动态加载,动画切换
- 由于 pushState 不支持微信侧滑返回, 因此采用了最传统的 hash 模式,兼容性最好。
- 建议与传统 hash 区分开来, 请使用 #! 作为 路由 hash!!!

## 页面跳转

- 页面跳转：`$.go('a', {x: 1, y: 2}, refresh)`
- 页面回退：`$.back(refresh)`
  页面回退时，请使用 back，而不是 go，go 会在浏览器的 history 里面新增一个节点。
  比如 A->B->C，如果从 C 回退到 B，使用了 go('B')，浏览器的路由路径为：A->B->C-B，此时使用浏览器的回退按键回退时，页面切换到 C，而不是 A。
  使用 back，浏览器的路由路径为：A->B，此时使用浏览器的回退按键回退时，页面切换到 A。
- refresh：是否强制刷新, 默认 false。
  跳转时，如果目的页面已缓存，则从缓存加载，触发 show 事件，不会触发 load 和 ready。
  如果为 true，跳转时，如果有缓存，删除缓存，重新 触发 load、ready

## 2018-07-12

1. \* view 改为 load
2. \+ show、hide 事件
   用户回退等缓存页面事件，一些代码逻辑要放到 show 中
3. ready、show 参数 改为 page, param、page 是 div 层。
   \$.router.route.data = {x:1, y:2}，回退时，可传递参数到 show 的 data 中
4. A->B，旧版本把 A 隐藏后显示 B，如果 A、B 有同名 ID，会冲突报错。
   新版本改为加载 B 后，删除 A。
5. a 页面被缓存，回退、\$.router.go('a', {x:1})时，直接从缓存中加载。
   不再触发 load、ready 事件，只触发 show 事件！使用新版本，要注意！

## page 生命周期

页面整个从无到有到无生命周期，分为五个事件：

`load -> ready -> show / hide -> unload`

page 代码示例：

```js
import Page from '../../../wiajs/core/page';

/* global btnLogin,  */

let _data = {};
const _list = {
  cache: {},
  data: null,
};

const _name = 'home';
const _title = 'e差旅';

export default class Home extends Page {
  constructor(opt) {
    opt = opt || {};
    super(opt.app || $.app, opt.name || _name, opt.title || _title);
    _data = this.data;
    console.log('home constructor:', {opt, cfg: this.cfg});
  }

  load(param) {
    super.load(param);
    console.log('home load param:', param);
  }

  // 在已经加载的视图上操作
  ready(view, param, back) {
    super.ready(view, param, back);
    console.log('home ready:', {param, back});
    bind();
  }

  show(view, param, back) {
    super.show(view, param, back);
    console.log('home show:', {param, back});
  }
}

function bind() {
  btnLogin.onclick = function() {
    $.page.data = {x: 1, y: 2};
    $.back(true);
    // $.go('login', {user: {name: 'test'}}, false);
  };
}
```

1. load：可选，加载视图、代码，第一次加载后缓存，后续不会重复加载。
   该事件主要用于干预加载的数据，使用比较少。
2. ready：重要，一般用于对视图中的对象事件绑定。
   注意，已缓存的视图，二次访问，比如回退，不会触发 ready 事件。
   需在此函数中完成事件绑定，一般会调用 bind 方法，bind 中实现事件绑定。
   页面各种初始化也需要在此函数中完成。
3. show：重要，视图显示时触发，可以接收参数，操作视图。
   无论是否缓存（比如回退）都会触发。
   由于回退等二次显示不会触发 ready，只会触发 show，因此回退或者需要通过传入参数进行处理的函数，要在 show 中完成。
4. hide：视图从可视界面卸载删除时触发。
   适合保存隐藏页面的数据，卸载的页面从视图删除，进入缓存。
5. unload：可选，页面从缓存中删除时触发，目前暂未实现。

### 参数

- view：页面层的 Dom 对象，已经使用`$(#page-name)`，做了处理。
  每个页面会加载到一个 div 里面，这个 div 的 id 为 page-pagename，如 login 页面：

```html
<div id="wia-view" class="view view-main">
  <div id="page-login" class="page page-current">
    <div id="dvLogin" class="page-content"></div>
  </div>
</div>
```

这个 view 就是 `$(page-login)`，方便代码操作。
`$.view`则对应的是 `wia-view` 层，`$(wia-view)`。
Dom 对象，类似 jQuery，使用 dom 库封装的方法操作。

- param：go 函数的参数，或 网址中 url 中的参数。
- back：是否为回退，A->B, B->A，这种操作属于回退。
  回退往往用于 A 页面切换 B 页面，通过 B 页面获取用户数据，回退时传给 A。
  因此，back 参数用户识别这种操作，是进入 A 还是回退 A，来做不同的处理。

## 2019-04-11

1. 参照微信小程序，将 bind 改为 ready，就是 dom 已经顺利加载到页面，可以绑定事件
2. load=onLoad，ready=onReady，show=onShow, hide=onHide，unload=onUnload
   load 加载一次，ready 加载一次，show 和 hide 多次加载，从内存卸载时，触发 unload！
3. 与小程序不一样的是 ready 在 show 之前触发
   也就是先做相关事件绑定，然后才显示，避免显示后事件没有绑定

## 2020-02-01

1. 支持 f7，之前的版本支持 SUI，该 UI 库已经四年多未更新，切换到 f7。
2. 之前设计所有应用都是 hash，这种方式虽然页面不刷新，非常快。
   但是所有应用共享所有存储空间和变量，多应用是存在安全及冲突，导致互相干扰，混乱且不安全、不稳定。
   改为应用内跳转为 hash，不同应用之间，还是要切换页面，不同应用如果都在 wia.pub 域名下，则可以通过离线存储加载已经缓存的公共模块，以加快加载速度。
   这种方案等于应用之间跳转需要刷新页面，也就意味着运行环境被重置，应用更安全可靠。
3. 离线加速：不同页面切换，通过共同域名 wia.pub 下的离线缓存实现加载加速。
4. 代码审查：不同应用共享 wia 域名，需提交前端源代码到 wia 后台。
   审查代码是否越界访问其他 app 的离线缓存。
   该方案实际上是在速度与安全稳定性之间，做了一个折中。

### go 接受三种路由参数

- 应用内跳转：go('home')，go('auth/login')
  不以/开头，页面不刷新，打开速度最快
- wia 内跳转：go('/xhlm/etrip')
  以/开头，不带 http/https，页面刷新，共享缓存，打开速度快
- 外链跳转：go('https://xxx.com/xxx')
  带 http/https，普通网页跳转，不能共享缓存加速，普通正常速度

## 2020-02-20

1. 支持 f7 的 page 样式，实现 page 切换动画。
2. 实现本地调试，动态加载 css，隐藏时，动态删除。
3. css 采用动态添加 style 标签层，写入 css 定义实现。

### css 要求

由于新旧页面切换有个动画，此时新旧页面同时存在，两个页面的样式也同时存在。
新页面的样式在旧页面的下面，意味着新页面样式可能覆盖旧层样式，
因此，两个页面样式需避免冲突，建议将样式定义限定到页面 id 里。比如 login 页面，其默认的 div 层 id 为 page-login，less 里面：

```css
#page-login {
  具体样式定义
}
```

将样式写在这个 id 里面，不同页面切换是，就不会相互干扰。

## 2020-02-21

1. \$.back 使用浏览器的 history.back 实现回退。
2. \$.back 回退，使用 data 传递数据，并在 show 事件中获取。
3. 属性 route 和 lastRoute 改为 page 和 lastPage，便于理解。
4. router 中的 page、lastPage 赋给 \$，方便访问，其他函数不得覆盖该属性。
5. \$ 中不可覆盖的关键字：app、view、page、lastPage、router。。。

### 数据交互

1. `data`：通过 page 的 data 交互实现跨页面数据交互。
   由于 this 的多变性，通常设置页面全局变量 `_data`,在 Page 的构造函数中 `_data = this.data`;
   这样在整个 page 代码中都可以操作`_data`，实际上操作的 page 实例中的 data。
   由于 page 实例可以通过 `$.page` 和 `$.lastPage` 访问，从而实现两个切换页面的数据交互。
   注意，data 仅仅用于跨页面数据交互，页面的数据，请使用内部变量。
2. `$.back`：回退前设置数据：
   `$.page.data = {x: 1, y: 2} 或 _data = {x: 1, y: 2}`
   回退后，通过 `$.lastPage.data` 即可读取。
   回退时，在 show 和 ready 中，back 为 true。
3. `$.go`：虽然 go 也能使用 data 传递数据，但还是建议使用 `param`，而不是 `data`。
   param 用于进入，data 用于应用内返回。
   跨应用返回，只能使用 go，页面刷新，等于重新进入应用，此时只能通过 url 传递参数。
   如果数据很多，超过 url 的大小，wia 内应用，可以选择使用跨应用数据交换本地存储。
   跨应用数据传递不能是敏感数据，敏感数据，需使用后台交互，否则容易泄露。
4. `param`：go 比 back 多一个 param 参数传递，类似 url 中使用?x=1&y=2 传递参数。
5. `url` 参数：外部或者浏览器直接输入 url 中可带参数。
   如 `wia.pub/my/app/#!a?x=1&y=2`
   问号后的 x 和 y 自动作为 param 参数传递到 ready 和 show 中。
   这种方式适合从其他 app 跳转到 wia app 时，指定页面和页面参数，实现指定功能。
6. 缓存：实际上每个 app 的 page 实例及其页面数据，都被 router 缓存。
   也就意味着一个 page 被再次访问时，包括回退，之前放在 page 实例 data 中的数据、页面填写的数据依然存在。
   好处是保留之前的操作数据，特别是回退。
7. 刷新：如果不需要缓存，在 go 和 back 中的参数 refresh 设置 true。
   刷新后，如果该页面之前已经访问过，直接删除缓存，按完全新的 page，重新加载。

## 社交媒体

- For latest releases and announcements, follow on Twitter: [@wiajs](https://twitter.com/wiajs)

## 版权

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2020-present Sibyl Yu
