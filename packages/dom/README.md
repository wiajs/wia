# Dom

## Minimalistic JavaScript library for DOM manipulation, with a jQuery-compatible API

Fork from jQuery, Zepto, and DOM7.

Dom - is the default DOM manipulation library built-in [wia](https://www.wia.pub). It utilizes most edge and high-performance methods for DOM manipulation. You don't need to learn anything new, its usage is very simple because it has the same syntax as the well known jQuery library with support of the most popular and widely used methods and jQuery-like chaining.

See [wia Dom](https://www.wia.pub/dom) documentation for usage examples and available methods.

> Note: A large part of the code of this package is borrowed from [jQuery](https://github.com/jquery/jquery), [Zepto] (https://github.com/madrobby/zepto), and [DOM7] (https://github.com/nolimits4web/dom7) I am forever grateful for the gift they are to the web.

## Build

You will need Node.js installed on your system.

First, install all required dependencies

```bash
$ npm install
```

To build development version:

```bash
$ npm run build-dev
```

The resulting files are:

1. lib/dom.js
2. lib/dom.m.js

To build production (minified) version:

```bash
$ npm run build
```

The resulting files are:

1. dist/dom.js
2. dist/dom.min.js
3. dist/dom.m.js
