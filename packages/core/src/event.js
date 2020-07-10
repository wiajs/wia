/**
 * 事件类，提供对象的事件侦听、触发，只在类实例中有效。
 * 需要支持事件的对象，可以从这个类继承，则类实例具备事件功能。
 * Fork from Framework7，
 */
export default class Event {
  constructor(params = {}, parents = []) {
    const self = this;
    self.params = params;
    self.eventsParents = parents;
    self.eventsListeners = {};

    // 通过 params 中的 on 加载事件响应
    if (self.params && self.params.on) {
      Object.keys(self.params.on).forEach(eventName => {
        self.on(eventName, self.params.on[eventName]);
      });
    }
  }

  on(events, handler, priority) {
    const self = this;
    if (typeof handler !== 'function') return self;
    const method = priority ? 'unshift' : 'push';
    events.split(' ').forEach(event => {
      if (!self.eventsListeners[event]) self.eventsListeners[event] = [];
      self.eventsListeners[event][method](handler);
    });
    return self;
  }

  once(events, handler, priority) {
    const self = this;
    if (typeof handler !== 'function') return self;
    function onceHandler(...args) {
      self.off(events, onceHandler);
      if (onceHandler.proxy) {
        delete onceHandler.proxy;
      }
      handler.apply(self, args);
    }
    onceHandler.proxy = handler;
    return self.on(events, onceHandler, priority);
  }

  off(events, handler) {
    const self = this;
    if (!self.eventsListeners) return self;
    events.split(' ').forEach(event => {
      if (typeof handler === 'undefined') {
        self.eventsListeners[event] = [];
      } else if (self.eventsListeners[event]) {
        self.eventsListeners[event].forEach((eventHandler, index) => {
          if (
            eventHandler === handler ||
            (eventHandler.proxy && eventHandler.proxy === handler)
          ) {
            self.eventsListeners[event].splice(index, 1);
          }
        });
      }
    });
    return self;
  }

  emit(...args) {
    const self = this;
    if (!self.eventsListeners) return self;
    let events;
    let data;
    let context;
    let eventsParents;
    if (typeof args[0] === 'string' || Array.isArray(args[0])) {
      events = args[0];
      data = args.slice(1, args.length);
      context = self;
      eventsParents = self.eventsParents;
    } else {
      events = args[0].events;
      data = args[0].data;
      context = args[0].context || self;
      eventsParents = args[0].local
        ? []
        : args[0].parents || self.eventsParents;
    }
    const eventsArray = Array.isArray(events) ? events : events.split(' ');
    const localEvents = eventsArray.map(eventName =>
      eventName.replace('local::', '')
    );
    const parentEvents = eventsArray.filter(
      eventName => eventName.indexOf('local::') < 0
    );

    localEvents.forEach(event => {
      if (self.eventsListeners && self.eventsListeners[event]) {
        const handlers = [];
        self.eventsListeners[event].forEach(eventHandler => {
          handlers.push(eventHandler);
        });
        handlers.forEach(eventHandler => {
          eventHandler.apply(context, data);
        });
      }
    });
    if (eventsParents && eventsParents.length > 0) {
      eventsParents.forEach(eventsParent => {
        eventsParent.emit(parentEvents, ...data);
      });
    }
    return self;
  }
}
