import { transform } from "buble";
import createPreset, { Transforms } from "../../index";

/** Utility type that converts all fields in `T` to a required field. */
type Mandatory<T> = { [K in keyof T]-?: T[K] };

const preset = createPreset();

/**
 * Transpiles JavaScript code using the current Bublé configuration.
 * @param code JavaScript code to transpile
 * @return Transpiled code
 */
export function transpile(code: string): string {
  return transform(code, preset).code;
}

/**
 * Passes JavaScript code through Bublé without transpiling anything.
 * The returned value is useful for comparing against transpiled code to assert
 * that the transpile was a no-op.
 * @param code JavaScript code to pass through
 * @return Passed through
 */
export function passthrough(code: string): string {
  const transforms: Mandatory<Transforms> = {
    arrow: false,
    classes: false,
    computedProperty: false,
    conciseMethodProperty: false,
    dangerousForOf: false,
    dangerousTaggedTemplateString: false,
    defaultParameter: false,
    destructuring: false,
    exponentiation: false,
    forOf: false,
    generator: false,
    letConst: false,
    modules: false,
    numericLiteral: false,
    objectRestSpread: false,
    parameterDestructuring: false,
    reservedProperties: false,
    spreadRest: false,
    templateString: false,
    trailingFunctionCommas: false,
    unicodeRegExp: false,
  };
  return transform(code, { transforms }).code;
}
