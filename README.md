# buble-config-rhino

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
configuration object that can be passed to `buble.transform()` to produce code
transpiled

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
