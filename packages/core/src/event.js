/**
 * 事件类，提供对象的事件侦听、触发，只在类实例中有效。
 * 需要支持事件的对象，可以从这个类继承，则类实例具备事件功能。
 * Fork from Framework7，
 */
export default class Event {
  /**
   * 页面Page实例事件触发，f7 UI组件需要
   * @param {Object} params 参数
   * @param {Array} parents 事件组件的父对象，用于向上传播事件！
   * 组件的parents 是 Page实例，Page实例的Parent是App实例
   * @param {String} pre 向上传播前缀，避免事件重名冲突
   * @private
   */
  constructor(params = {}, parents = [], pre = '') {
    const m = this;
    m.params = params;

    if (parents) {
      if (!Array.isArray(parents)) m.eventsParents = [parents];
      else m.eventsParents = parents.filter(p => p);
    } else m.eventsParents = [];

    m.eventsListeners = {};
    m.pre = pre;

    // 通过 params 中的 on 加载事件响应
    if (m.params && m.params.on) {
      Object.keys(m.params.on).forEach(eventName => {
        m.on(eventName, m.params.on[eventName]);
      });
    }
  }

  /**
   * 添加事件响应函数
   * @param {*} events 多个事件用空格隔开
   * @param {*} handler 事件响应函数
   * @param {*} priority 是否优先，缺省不优先
   * @returns
   */
  on(events, handler, priority = false) {
    const m = this;
    if (typeof handler !== 'function') return m;
    const method = priority ? 'unshift' : 'push';
    events.split(' ').forEach(event => {
      const lis = {
        owner: '',
        appName: '',
        handler,
      };

      // 对象自身事件
      if (!m.eventsListeners[event]) m.eventsListeners[event] = [];

      m.eventsListeners[event][method](lis);
    });

    return m;
  }

  /**
   * 调用一次后清除
   * @param {*} events 多个事件用空格隔开
   * @param {*} handler 事件响应函数
   * @param {*} priority 是否优先，缺省不优先
   * @returns
   */
  once(events, handler, priority = false) {
    const m = this;
    if (typeof handler !== 'function') return m;

    // 调用一次后自动删除事件
    function onceHandler(...args) {
      m.off(events, onceHandler);
      if (onceHandler.proxy) {
        onceHandler.proxy.apply(m, args);
        delete onceHandler.proxy;
      }
    }

    onceHandler.proxy = handler;
    return m.on(events, onceHandler, priority);
  }

  /**
   * 删除事件响应函数
   * @param {*} events 事件，多个事件空格隔开，不传则清除该对象所有事件响应函数
   * @param {*} handler 事件响应函数
   * @returns
   */
  off(events, handler) {
    const m = this;
    if (!m.eventsListeners) return m;

    if (events) {
      events.split(' ').forEach(event => {
        if (typeof handler === 'undefined') m.eventsListeners[event] = [];
        else if (m.eventsListeners[event]) {
          const arr = m.eventsListeners[event];
          for (let i = arr.length - 1; i >= 0; i--) {
            const lis = arr[i];
            if (lis.handler === handler || lis.handler?.proxy === handler) arr.splice(i, 1);
          }
        }
      });
    } else m.eventsListeners = {};

    return m;
  }

  /**
   * 事件触发，应用事件只能由 Page 实例触发，才能按同页面所有者触发事件
   * @param {*} 事件，字符串、数组或对象
   * @param {*} 数据，传递到事件响应函数的数据
   */
  emit(...args) {
    const m = this;
    if (!m.eventsListeners) return m;

    let events;
    let data;
    let context;
    let eventsParents;

    let pop = false;

    let event = args[0]; // 事件
    if (!event) return m;

    // 原始触发事件
    if (typeof event === 'string' || Array.isArray(event)) {
      event = event.split(' ');
      // 带前缀，自动添加前缀向父节点传递事件
      if (m.pre) {
        events = [];
        event.forEach(ev => {
          events.push(`.${ev}`); // 本组件事件
          events.push(`${m.pre}${ev[0].toUpperCase()}${ev.substr(1)}`); // 向上事件
        });
      } else events = event;

      data = args.slice(1, args.length);
      context = m;
      eventsParents = m.eventsParents;
    } else {
      // 冒泡向上传递事件，或指定对象触发事件
      pop = event.pop;
      events = event.events;
      data = event.data;
      context = event.context || m;
      eventsParents = event.local ? [] : event.parents || m.eventsParents;
    }

    const eventsArray = Array.isArray(events) ? events : events.split(' ');

    // 本对象事件
    // ['local::event'] or ['.event']，不向父组件传递
    const selfEvents = eventsArray.map(ev => ev.replace(/local::|^[.]/, ''));

    // 非本对象事件，向上传递时，转换为对象，记录来源
    let parentEvents = null;
    if (pop) parentEvents = event;
    else {
      const popEvents = eventsArray.filter(ev => !ev.match(/^local::|^[.]/));
      if (popEvents?.length) {
        parentEvents = {
          pop: true, // 冒泡事件
          events: popEvents,
          context: m, // 事件发起者
          data,
          owner: '',
          appName: '',
        };
      }
    }

    // 记录page属性，标记事件来源，冒泡到app时判断是否触发本页面应用事件
    // if (parentEvents && $.isPage(m)) {
    //    parentEvents.owner = m?.owner;
    //    parentEvents.appName = m?.appName;
    // }

    // 调用对象事件函数，父对象emit后，调用父对象事件函数
    selfEvents.forEach(ev => {
      if (m.eventsListeners && m.eventsListeners[ev]) {
        const handlers = [];
        m.eventsListeners[ev].forEach(lis => {
          // 一个页面，只有一个应用，不可能有多个应用
          // // 应用事件，需判断所有者
          // if (lis.owner && lis.appName) {
          //   // 同一html页面运行多个应用页面层时，只有所有者、应用名称相同才能触发跨页面事件，避免跨应用事件安全问题。
          //   // 页面冒泡到应用事件
          //   if (pop && lis.owner === ev.owner && lis.appName === ev.appName)
          //     handlers.push(lis.handler);
          // } else
          handlers.push(lis.handler);
        });

        // 由 window 对象异步调用，而不是事件对象直接调用
        handlers.forEach(fn => {
          // setTimeout(() => fn.apply(context, data), 0);
          fn.apply(context, data); // this 指针为原始触发事件对象，事件函数中可引用
        });
      }
    });

    // 向上一级一级迭代冒泡传递后，触发父对象事件响应函数
    if (parentEvents && eventsParents?.length > 0) {
      eventsParents.forEach(eventsParent => eventsParent.emit(parentEvents));
    }

    return m;
  }
}
