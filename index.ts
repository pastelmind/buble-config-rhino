import type { TransformOptions as BubleOptions } from "buble";

/** Transformation options that are not actually implemented by Bublé. */
type UnimplementedTransforms = "collections" | "constLoop" | "stickyRegExp";

/** Transform options supported by buble-config-rhino */
// @types/buble lists some transforms that are no longer available
export interface Transforms
  extends Omit<
    Exclude<BubleOptions["transforms"], undefined>,
    UnimplementedTransforms
  > {
  // @types/buble does not have these yet!
  exponentiation?: boolean;
  objectRestSpread?: boolean;
  trailingFunctionCommas?: boolean;
}

/** Options supported by buble-config-rhino */
export interface Options extends Omit<BubleOptions, "target" | "transforms"> {
  /**
   * `targets` is unsupported since we are specifically targeting Rhino.
   */
  target?: never;
  transforms?: Transforms;
}

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
