English | [Chinese](./README.CN.md)

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

To build production (minified) version:

```bash
$ npm run build

> @wiajs/base@1.0.1 build
> cross-env NODE_ENV=production gulp build

env:production src:./src out:./dist
[09:05:38] Using gulpfile D:\prj\wiajs\wia\packages\base\gulpfile.js
[09:05:38] Starting 'build'...
[09:05:38] Starting 'clean'...
[09:05:38] Finished 'clean' after 45 ms
[09:05:38] Starting '<anonymous>'...
start build ...
dist\base.cmn.js 47.62kb
dist\base.js 39.49kb
dist\base.esm.js 47.61kb
[09:05:45] Finished '<anonymous>' after 7.41 s
[09:05:45] Finished 'build' after 7.47 s
dist\base.min.js 22.40kb (gzipped: 7.56kb)
build { spend: 7995 }
```

The resulting files are:

1. common: dist/base.cmn.js
2. esm: dist/base.esm.js
3. umd: dist/base.js
4. umd min: dist/base.min.js

To build development version:

```bash
$ npm run build-dev
```

The resulting files are:

1. dist/base.cmn.js
2. dist/base.cmn.js.map
3. dist/base.esm.js
4. dist/base.esm.js.map
5. dist/base.js
6. dist/base.js.map
7. dist/base.min.js

## License

[ELv2](https://www.elastic.co/cn/licensing/elastic-license)

Copyright (c) 2020-present Sibyl Yu
