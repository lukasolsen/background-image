import type VSCODE_BASE from "vscode";

// eslint-disable-next-line import/no-mutable-exports -- This is necessary
let vscode: typeof VSCODE_BASE | undefined;

try {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- This is a valid assignment
  vscode = require("vscode");
} catch {
  vscode = undefined;
}

export { vscode };
