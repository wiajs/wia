# Wia Dom

## 与 jQuery 调用兼容的 DOM 操作精简库

> 部分代码来源于 jQuery、Zepto 和 Dom7。

Dom-是[wia]（https://www.wia.pub）内置的默认DOM（Document Object Model）操作库。无论我们使用 vue 还是 react 等组件构建应用界面/视图，都不可避免与页面元素交互。DOM 交互的王者之剑毫无疑问非 jQuery 莫属，2006 年发布的 jQuery 确实太老了，也太臃肿了，现代浏览器已经内置了它的很多功能。针对手机和 HTML5 应用开发，我们仅仅需要其中一部分功能。因此，wia 从中裁剪了部分浏览器不具备，开发又需要用到的功能。

如果你熟悉 jQuery，恭喜你，无需学习任何新知识，使用你熟悉的 html、css、js 和 dom 交互，就能通过 wia 简单、快速开发手机和桌面应用。

## 为什么不用学习 vue、react、angular

vue、react、angular 主要通过组件化和虚拟 DOM，实现页面视图与数据之间的交互自动化，本质也就是 DOM 交互，对于大多数手机应用来说，手机屏幕小，界面功能并不复杂，使用标准 HTML 组件和 wia 内置的 83 个 web 原生 UI 组件，基本上能满足绝大部分手机应用需求，完全用不上 vue、react、angular 这些高级的自定义 UI 组件。

当然，vue、react、angular 具备更多的 UI 组件库，DOM 和 wia 内置 UI 组件不能满足需求时，可以在 wia 中使用 vue、react、angular，作为应用页面中视图组件。

[wia Dom](https://www.wia.pub/doc/dom.html) 使用示例和可用方法的文档。

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

1. dist/dom.common.js
2. dist/dom.common.map
3. dist/dom.esm.js
4. dist/dom.esm.map
5. dist/dom.umd.js
6. dist/dom.umd.map

生成生产版本 (混淆最小化) :

```bash
$ npm run build
```

生成文件如下:

1. dist/dom.common.js
2. dist/dom.common.min.js
3. dist/dom.esm.js
4. dist/dom.esm.min.js
5. dist/dom.umd.js
6. dist/dom.min.js
