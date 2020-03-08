/**
 * 所有页面从该类继承，并必须实现 load 事件！
 * 事件
 *  五个个事件：load -> ready -> show / hide -> unload
 *  load：必选，加载视图、代码，第一次加载后缓存，后续不会重复加载，动态代码也要在这里加载
 *    参数；param
 *    如果需要前路由数据，通过 $.lastPage.data 访问
 *    view 还未创建，隐藏page 不存在
 *  ready：可选，对视图中的对象事件绑定，已经缓存的视图，比如回退，不会再次触发 ready
 *    参数；view、param
 *    如果需要前路由数据，通过 $.lastPage.data 访问
 *  show：可选，视图显示时触发，可以接收参数，操作视图，无论是否缓存（比如回退）都会触发
 *    对于已经加载、绑定隐藏（缓存）的页面，重新显示时，不会触发load和ready，只会触发show
 *    参数：view、param
 *  hide：可选，视图卸载删除时触发，适合保存卸载页面的数据，卸载的页面从页面删除，进入缓存
 *  unload：可选，页面从缓存中删除时触发，目前暂未实现
 *
 * 数据传递
 *  每个页面都能访问当前路由，路由存在以下参数，用户跨页面数据传递
 *  url：页面跳转时的原始网址
 *  param：页面网址及go中传入的参数合并，保存在 param 中
 *  data：路由中需要保存的数据
 *  view：当前页面层，dom 对象，已经包括绑定的事件
 *  $.page：当前页面对象
 *  $.lastPage：前路由，可通过该参数，获取前路由的 data，在后续路由中使用
 *
 */
export default class Page {
  constructor(app, name, title, style) {
    this.app = app;
    this.cfg = app.cfg;
    this.name = name; // 名称，支持带路径：admin/login
    this.title = title; // 浏览器标题
    this.style = style || `./page/${name}.css`;
    this.path = `${name}`; // url 路径，不使用正则，直接查找
    this.view = null; // 包含当前页面的div层Dom对象
    this.html = ''; // 页面html文本
    this.css = ''; // 页面css样式
    this.js = ''; // 页面代码
    this.data = {}; // 页面数据对象
    this.param = {}; // 页面切换传递进来的参数对象
  }

  /**
   * 异步加载页面视图内容
   * 返回Promise对象
   * @param {*} param
   * @param {*} cfg
   */
  load(param) {
    this.param = param;
    // $.assign(this.data, param);
  }

  /**
   * 在已经加载就绪的视图上操作
   * @param {*} view 页面层的 Dom 对象，已经使用`$(#page-name)`，做了处理
   * @param {*} param go 函数的参数，或 网址中 url 中的参数
   * @param {*} back 是否为回退，A->B, B->A，这种操作属于回退
   */
  ready(view, param, back) {
    $.assign(this, {view, param, back});
    // $.assign(this.data, param);
  }

  // 在已经加载的视图上操作
  // dv：页面层，param：参数
  show(view, param, back) {
    $.assign(this, {view, param, back});
    // $.assign(this.data, param);
  }
}
