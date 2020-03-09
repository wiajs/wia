English | [��������](./README.CN.md)

# Wia Core

## wia's core libraries

@wiajs/core - are the core libraries of [wia](https://www.wia.pub).

See [wia core](https://www.wia.pub/doc/core.html) documentation for usage examples and available methods.

> Note: This package's part of the code is borrowed from [Framework7](https://github.com/framework7io/framework7). I am forever grateful for the gift they are to the web.

## Install

```bash
$ npm i -D @wiajs/core
```

## Use

To use in code:

```js
import {App, Page} from '@wiajs/core';
```

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

1. dist/core.common.js
2. dist/core.common.map
3. dist/core.esm.js
4. dist/core.esm.map
5. dist/core.umd.js
6. dist/core.umd.map

To build production (minified) version:

```bash
$ npm run build
```

The resulting files are:

1. dist/core.common.js
2. dist/core.common.min.js
3. dist/core.esm.js
4. dist/core.esm.min.js
5. dist/core.umd.js
6. dist/core.min.js

The main files are:

1. event.js
2. app.js
3. page.js
4. support.js
5. device.js
6. module.js
7. load.js
8. lazy.js
9. resize.js
10. ajax.js
11. sw.js
12. utils.js
