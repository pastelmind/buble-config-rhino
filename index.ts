import type { TransformOptions as BubleOptions } from "buble";

/** Options supported by buble-config-rhino */
export interface Options extends Omit<BubleOptions, "target"> {
  /**
   * `targets` is unsupported since we are specifically targeting Rhino.
   */
  target?: never;
}

/** Transform options supported by buble-config-rhino */
// For now, we support everything
export type Transforms = Exclude<Options["transforms"], undefined>;

/**
 * Generates an options object for Bublé.
 * @param opts Bublé options. This will override options provided by
 * `buble-config-rhino`.
 * @return Options object that can be passed to `buble.transform()`
 */
export default function createPreset(opts?: Options): BubleOptions {
  if (opts) {
    if (opts.target !== undefined) {
      throw new Error(`opts.targets is unsupported by buble-config-rhino`);
    }
  }

  const { transforms: transformOverrides, ...configOverrides } = opts || {};

  return {
    transforms: {
      // Disable transforms that are already supported by Rhino
      arrow: false,
      classes: true,
      computedProperty: true,
      conciseMethodProperty: true,
      dangerousForOf: false,
      dangerousTaggedTemplateString: true, // Dangerous but useful
      defaultParameter: true,
      destructuring: true,
      exponentiation: true,
      forOf: false,
      generator: false,
      letConst: true,
      numericLiteral: false,
      objectRestSpread: true,
      parameterDestructuring: true,
      reservedProperties: false,
      spreadRest: true,
      templateString: true,
      trailingFunctionCommas: true,
      unicodeRegExp: true,
      ...transformOverrides,
    },
    objectAssign: true,
    ...configOverrides,
  };
}
