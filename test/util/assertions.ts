import { strict as assert } from "assert";
import { runCodeInRhino } from "./rhino";
import { passthrough, transpile } from "./transpile";

/**
 * Pads a line of text with `-` on either sides so that it fits in a
 * 80-character terminal. This does _not_ check if the line is longer than 80
 * characters, or has double-wide characters.
 * @param line String to pad
 * @return Padded string
 */
function prettyPad(line: string): string {
  return line.padStart(40 + Math.floor(line.length / 2), "-").padEnd(80, "-");
}

const MSG_ORIGINAL_CODE = prettyPad(" Original code: ");
const MSG_TRANSPILED_CODE = prettyPad(" Transpiled code: ");
const MSG_EXEC_RESULT = prettyPad(" Execution result: ");

/**
 * Trim leading/trailing lines that only have whitespace.
 * @param text
 * @return Trimmed string
 */
function trimNewlines(text: string): string {
  return text.replace(/^[ \t]*\n/, "").replace(/\n[ \t]*$/, "");
}

/**
 * Expects that the given code is runnable in Rhino.
 * @param code Code to check
 * @param message Assertion message on fail
 */
export async function expectCanRunInRhino(
  code: string,
  message?: string
): Promise<void> {
  const result = await runCodeInRhino(code);
  assert.equal(
    result.status,
    0,
    message ||
      `The following code fails in Rhino, even though it should succeed.

${MSG_ORIGINAL_CODE}

${trimNewlines(code)}`
  );
}

/**
 * Expects that the given code is not runnable in Rhino.
 * @param code Code to check
 * @param message Assertion message on fail
 */
async function expectCannotRunInRhino(code: string, message?: string) {
  const result = await runCodeInRhino(code);
  assert.notEqual(
    result.status,
    0,
    message ||
      `The following code succeeds in Rhino, even though it should fail.

${MSG_ORIGINAL_CODE}

${trimNewlines(code)}`
  );
}

/**
 * Expects that the given code is not transpiled by the current Bublé config.
 * @param code Code to check
 */
function expectIsNotTranspiled(code: string) {
  // Babel can change whitespace even if no language features are actually
  // transpiled. Thus, we must compare the transpiled code against
  // "passthrough"-transformed code instead of the original.
  const transpiledCode = transpile(code);
  const passthroughCode = passthrough(code);
  assert.equal(transpiledCode, passthroughCode, "Unnecessary transpilation");
}

/**
 * Expects that code is transpiled by the current Bublé config into a form that
 * is runnable in Rhino.
 * @param code Code to check
 */
async function expectCanRunInRhinoWhenTranspiled(code: string) {
  const transpiledCode = transpile(code);
  const result = await runCodeInRhino(transpiledCode);
  assert.equal(
    result.status,
    0,
    `Failed to run transpiled code.

${MSG_ORIGINAL_CODE}

${trimNewlines(code)}

${MSG_TRANSPILED_CODE}

${trimNewlines(transpiledCode)}

${MSG_EXEC_RESULT}

${result.stderr}`
  );
}

/**
 * Asserts that:
 *
 *  1. The code can be executed in Rhino without transpiling
 *  2. The code is not transpiled by the current Bublé config
 *
 * If either expectation is invalid, fails the current test spec.
 *
 * This is used to verify that our Bublé config does not transpile language
 * features that are supported by Rhino.
 * @param code Code to transpile
 */
export async function expectNoUnneededTranspilation(
  code: string
): Promise<void> {
  await expectCanRunInRhino(code);
  expectIsNotTranspiled(code);
}

/**
 * Asserts that:
 *
 *  1. The code cannot be executed in Rhino without transpiling
 *  2. The code is transpiled correctly by the current Bublé config
 *
 * If either expectation is invalid, fails the current test spec.
 *
 * This is used to verify that our Bublé config transpiles language features
 * that are unsupported by Rhino.
 * @param code Code to transpile
 */
export async function expectNeedsTranspilation(code: string): Promise<void> {
  await Promise.all([
    expectCannotRunInRhino(code),
    expectCanRunInRhinoWhenTranspiled(code),
  ]);
}
