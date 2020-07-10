import Constructors from './constructors';

export default function (parameters = {}) {
  const { defaultSelector, constructor, app } = parameters;
  const methods = $.extend(
    Constructors({
      defaultSelector,
      constructor,
      app,
      domProp: 'f7Modal',
    }),
    {
      open(el, animate) {
        const $el = $(el);
        let instance = $el[0].f7Modal;
        if (!instance)
          instance = new constructor(app, {el: $el});
        return instance.open(animate);
      },
      close(el = defaultSelector, animate) {
        const $el = $(el);
        if ($el.length === 0)
          return undefined;
        let instance = $el[0].f7Modal;
        if (!instance)
          instance = new constructor(app, {el: $el});
        return instance.close(animate);
      },
    }
  );
  return methods;
}
