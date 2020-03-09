# base

## wia's base module

@wiajs/base - is the base modules of [wia](https://www.wia.pub). Base must included by index.html.

```html
<script src="index.js"></script>
```

See [wia base](https://www.wia.pub/doc/base.html) documentation for usage examples and available methods.

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

1. dist/base.common.js
2. dist/base.common.map
3. dist/base.esm.js
4. dist/base.esm.map
5. dist/base.umd.js
6. dist/base.umd.map

To build production (minified) version:

```bash
$ npm run build
```

The resulting files are:

1. dist/base.common.js
2. dist/base.common.min.js
3. dist/base.esm.js
4. dist/base.esm.min.js
5. dist/base.umd.js
6. dist/base.min.js
