import { expectNeedsTranspilation } from "./util/assertions";

describe("ES2018 features", () => {
  // objectRestSpread
  it("should transpile object rest/spread", async () => {
    await expectNeedsTranspilation(`
      var obj = { x: 1, y: 2, z: 3 };
      var { x, ...rest } = { x: 9, ...obj, z: 10 };
      if (x !== 1 || rest.y !== 2 || rest.z !== 10) {
        throw new Error('transpile failed');
      }
    `);
  });
});
