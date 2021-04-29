import { spawn } from "child_process";

/** Result of running Rhino. Mimics the return value of `spawnSync()`. */
export interface RhinoResult {
  stdout: string;
  stderr: string;
  /** Exit code, or `null` if the Java process was terminated. */
  status: number | null;
  /** Termination signal, or `null` if the Java process exited on its own. */
  signal: NodeJS.Signals | null;
}

/**
 * Executes JavaScript code in Rhino shell as a child process and captures the
 * result.
 * @param {string} code Code
 * @return {Promise<RhinoResult>} Results of running Rhino
 */
export async function runCodeInRhino(code: string): Promise<RhinoResult> {
  // Force Rhino to run latest version
  const child = spawn(
    "java",
    ["-jar", "test/rhino/rhino-1.7.13.jar", "-version", "200", "-e", code],
    {
      timeout: 10000,
    }
  );
  child.on("error", (error) => {
    throw error;
  });

  let stdout = "";
  let stderr = "";
  child.stdout.setEncoding("utf8");
  child.stderr.setEncoding("utf8");
  child.stdout.on("data", (chunk) => {
    stdout += chunk;
  });
  child.stderr.on("data", (chunk) => {
    stderr += chunk;
  });

  return new Promise((resolve) => {
    child.on("close", (status, signal) => {
      resolve({ stdout, stderr, status, signal });
    });
  });
}
