import path from "node:path";
import { vscode } from "./vsc";

const base = path.dirname(require.main?.filename ?? "");

const cssName = "workbench.desktop.main.css";
const webCssName = "workbench.web.main.css";

const cssPath = (() => {
  const getCssPath = (cssFileName: string): string =>
    path.join(base, "vs", "workbench", cssFileName);

  const defPath = getCssPath(cssName);
  const webPath = getCssPath(webCssName);

  switch (vscode?.env.appHost) {
    case "desktop":
      return defPath;
    case "web":
    default:
      return webPath;
  }
})();

const indexDir = path.join(
  base,
  "vs",
  "workbench",
  "electron-browser",
  "bootstrap"
);

export const vscodePath = {
  base,
  cssPath,
  indexDir,
};
