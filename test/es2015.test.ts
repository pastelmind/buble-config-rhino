import {
  expectCanRunInRhino,
  expectNoUnneededTranspilation,
  expectNeedsTranspilation as expectNeedsTranspilation,
} from "./util/assertions";

describe("ES2015 features", () => {
  // arrow
  it("should not transpile arrow functions", async () => {
    await expectNoUnneededTranspilation(`
      ((arg) => arg + 1)(1);
    `);
  });

  // classes
  it("should transpile classes", async () => {
    await expectNeedsTranspilation(`
      class MyClass {
        constructor(arg) { this.field = arg; }
        method1() { return this.field; }
      }
      var a = new MyClass('foo');
    `);
  });

  // computedProperty
  it("should transpile computed properties", async () => {
    await expectNeedsTranspilation(`
      var a = { x: 1, ['y']: 2, ['x' + '']: 3 };
      if (a.x !== 3 || a.y !== 2) throw new Error('transpile failed');
    `);
  });

  // conciseMethodProperty
  it("should transpile shorthand properties and methods", async () => {
    await expectNeedsTranspilation(`
      var a = 10;
      var b = { a, func() { return this.a + 10; } };
      if (b.a !== 10 || b.func() !== 20) throw new Error('transpile failed');
    `);
  });

  // dangerousTaggedTemplateString
  it("should transpile tagged template literals, dangerously", async () => {
    await expectNeedsTranspilation(`
      function tag(chunks) { return chunks.join(); }
      if (tag\`foo\${1}bar\${2}baz\` !== 'foo,bar,baz') {
        throw new Error('failed');
      }
    `);
  });

  // defaultParameter
  it("should transpile default parameters", async () => {
    await expectNeedsTranspilation(`
      function fun(a = 1) { return a; }
      if (fun() !== 1 || fun(5) !== 5) throw new Error('transpile failed');
    `);
  });

  // destructuring
  it("should transpile destructuring", async () => {
    // Rhino supports basic destructuring, but default values must be
    // transpiled
    await Promise.all([
      expectCanRunInRhino(`
        var [a, , b] = [1, 2, 3, 4];
      `),
      expectNeedsTranspilation(`
        var [a, , b, c = 9, d] = [1, 2, 3, undefined, 5, 6];
        if (a !== 1 || b !== 3 || c !== 9 || d !== 5) {
          throw new Error('array transpile failed');
        }
      `),
      expectCanRunInRhino(`
        var { x, y, z } = { x: 1, y: 2, w: 3 };
      `),
      expectNeedsTranspilation(`
        var { x, y = 5, z = 12 } = { x: 5, y: 10, w: 24 };
        if (x !== 5 || y !== 10 || z !== 12) {
          throw new Error('object transpile failed');
        }
      `),
    ]);
  });

  // exponentiation
  it("should transpile exponentiation", async () => {
    await expectNeedsTranspilation(`
      if (5 ** 3 !== 125) throw new Error('transpile failed');
    `);
  });

  // forOf, dnagerousForOf
  it("should not transpile for-of loops", async () => {
    await expectNoUnneededTranspilation(`
      for (var f of [1, 2, 3]) {}
      for (var g of new Set([1, 2, 3])) {}
      for (var h of new Map([['a', 1], ['b', 2]])) {}
    `);
  });

  // generator
  it("should not transpile generators", async () => {
    await expectNoUnneededTranspilation(`
      function* f() { yield 1; yield 2; }
      var g = f();
      if (g.next().value !== 1
          || g.next().value !== 2
          || g.next().done !== true
      ) {
        throw new Error('transpile failed');
      }
    `);
  });

  // letConst
  it("should transpile let and const", async () => {
    // Rhino supports `let` fine. However, `const` variables are block-scoped.
    await expectNeedsTranspilation(`
      const a = 1;
      {
        const a = 2;
      }
    `);
  });

  // numericLiteral
  it("should not transpile numeric literals", async () => {
    await expectNoUnneededTranspilation(`
      if (0o10 !== 8 || 0O10 !== 8) throw new Error('octal unsupported');
      if (0b11 !== 3 || 0B11 !== 3) throw new Error('binary unsupported');
    `);
  });

  // parameterDestructuring
  it("should transpile parameter destructuring", async () => {
    await expectNeedsTranspilation(`
      function foo({ a, b = 9, ...rest }) { return a + b + rest.d; }
      if (foo({ a: 5, d: 4 }) !== 18) throw new Error('transpile failed');
    `);
  });

  // reservedProperties
  it("should not transpile object properties with reserved names", async () => {
    await expectNoUnneededTranspilation(`
      var obj = { var: 1, let: 2, const: 3, try: 4, catch: 5 };
    `);
  });

  // spreadRest
  it("should transpile rest/spread for iterables", async () => {
    await Promise.all([
      expectNeedsTranspilation(`
        var b = [1, ...[2, 3, 4], 5, ...(new Set([6, 7, 8]))];
      `),
      expectNeedsTranspilation(`
        var [a, ...b] = [1, 2, 3];
        if (a !== 1 || b.length !== 2) throw new Error();
      `),
    ]);
  });

  // templateString
  it("should transpile template string literals", async () => {
    await expectNeedsTranspilation(`
      var a = 1, b = [2, 3, 4];
      if (\`foo\${a} \${b}bar\` !== 'foo1 2,3,4bar') throw new Error('failed');
    `);
  });

  // trailingFunctionCommas
  it("should transpile trailing commas in functions", async () => {
    // For some reason, Rhino supports trailing commas in function call
    // expressions, but not in function declarations
    await Promise.all([
      expectNeedsTranspilation(`
        function foo(a, b, c,) {}
      `),
      expectCanRunInRhino(`
        function foo(a, b, c) {}
        foo(1, 2, 3,);
      `),
    ]);
  });

  // unicodeRegExp
  it("should transpile RegExp unicode flag", async () => {
    await expectNeedsTranspilation(`
      if ("\\uD842\\uDFB7".match(/^.$/u)[0].length !== 2) {
        throw new Error('failed');
      }
    `);
  });
});
