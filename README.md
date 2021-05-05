# buble-config-rhino

[![Test & Lint](https://github.com/pastelmind/buble-config-rhino/actions/workflows/test.yml/badge.svg)](https://github.com/pastelmind/buble-config-rhino/actions/workflows/test.yml) [![npm](https://img.shields.io/npm/v/buble-config-rhino)](https://www.npmjs.com/package/buble-config-rhino)

A [Bublé] configuration that transpiles modern JavaScript for [Rhino], the
Java-based JavaScript engine made by [Mozilla].

Bublé is a JavaScript transpiler that transpiles modern JavaScript for legacy
JavaScript runtimes that only support ES5. Mozilla Rhino is one such system.

This package provides a configuration (i.e. preset) for Bublé that can be
reused across JavaScript projects targeting Rhino. It selectively enables
transpilation for ES2015+ features unsupported by Rhino, while allowing
supported features to be emitted as-is.

## How to use

buble-config-rhino exports a single function. This function returns a
configuration object that can be passed to `buble.transform()`, which then
transpiles modern ECMAScript to a subset of ES5+ that Rhino supports:

```js
const buble = require("buble");
const createPreset = require("buble-config-rhino");

const output = buble.transform(code, createPreset());
```

If there is a feature that you want to turn on or off, you can pass an options
object to `createPreset()` that will override the defaults:

```js
const output = buble.transform(
  code,
  createPreset({
    transforms: {
      arrow: true,
      dangerousTaggedTemplateString: false,
    },
  })
);
```

`createPreset()` accepts the same options object as `buble.transform()`.

### Rollup

Use [@rollup/plugin-buble](https://github.com/rollup/plugins/tree/master/packages/buble)
with this config:

```js
// rollup.config.js
import buble from "@rollup/plugin-buble";
import createPreset from "buble-config-rhino";

export default {
  // ...
  plugins: [buble(createPreset())],
};
```

### Webpack

Use [buble-loader](https://github.com/sairion/buble-loader) with this config:

```js
// webpack.config.js
const path = require("path");
const createPreset = require("buble-config-rhino");

module.exports = {
  // ...
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: "buble-loader",
        include: path.join(__dirname, "src"),
        options: createPreset(),
      },
    ],
  },
};
```

## Transpiled language features

See [`index.ts`](./index.ts) for a list of enabled/disabled transforms.

Note that, unlike [Babel], Bublé does _not_ add polyfills. You must add them
manually.

See also: [List of ES2015+ features supported by Rhino](https://mozilla.github.io/rhino/compat/engines.html)
(may be outdated)

[babel]: https://babeljs.io/
[bublé]: https://github.com/bublejs/buble
[mozilla]: http://www.mozilla.org/
[rhino]: https://github.com/mozilla/rhino
