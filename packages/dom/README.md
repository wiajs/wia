English | [Chinese](./README.CN.md)

# dom

## wia's dom module

## Minimalistic JavaScript library for DOM manipulation, with a jQuery-compatible API

Fork from jQuery Dom7 and Zepto.

Dom - is the default DOM manipulation library built-in [wia](https://www.wia.pub). It utilizes most edge and high-performance methods for DOM manipulation. You don't need to learn something new, its usage is very simple because it has the same syntax as well known jQuery library with support of the most popular and widely used methods and jQuery-like chaining.

See [wia dom](https://www.wia.pub/doc/dom.html) documentation for usage examples and available methods.

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

1. dist/dom.cmn.js
2. dist/dom.cmn.map
3. dist/dom.esm.js
4. dist/dom.esm.map
5. dist/dom.js
6. dist/dom.map

To build production (minified) version:

```bash
$ npm run build
```

The resulting files are:

1. dist/dom.cmn.js
2. dist/dom.esm.js
3. dist/dom.js
4. dist/dom.min.js
