# base

## wia's base module

@wiajs/base - is the base module of [wia](https://www.wia.pub). Base must be included in index.html.

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

To build production(minified) version:

```bash
$ npm run build
```

The resulting files are:

1. dist/base.js
2. dist/base.min.js

To build development version:

```bash
$ npm run build-dev
```

The resulting files are:

1. dist/base.js
