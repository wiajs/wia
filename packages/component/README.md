English | [��������](./README.CN.md)

# Wia Dom

## Minimalistic JavaScript library for DOM manipulation, with a jQuery-compatible API

Fork from Dom7 and Zepto.

Dom - is the default DOM manipulation library built-in [wia](https://www.wia.pub). It utilizes most edge and high-performance methods for DOM manipulation. You don't need to learn something new, its usage is very simple because it has the same syntax as well known jQuery library with support of the most popular and widely used methods and jQuery-like chaining.

See [wia Dom](https://www.wia.pub/doc/dom.html) documentation for usage examples and available methods.

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

1. dist/dom.common.js
2. dist/dom.common.map
3. dist/dom.esm.js
4. dist/dom.esm.map
5. dist/dom.umd.js
6. dist/dom.umd.map

To build production (minified) version:

```bash
$ npm run build
```

The resulting files are:

1. dist/dom.common.js
2. dist/dom.common.min.js
3. dist/dom.esm.js
4. dist/dom.esm.min.js
5. dist/dom.umd.js
6. dist/dom.min.js
