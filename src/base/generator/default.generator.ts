import vscode from "vscode";
import { AbsCssGenerator, css } from "./CssGenerator.base";
import { ImageOptions } from "../../types/imageOptions";

// 从 1.78.0 开始使用 Chromium:108+，支持 :has 选择器
const BODY_SELECTOR =
  parseFloat(vscode.version) >= 1.78
    ? `body:has([id='workbench.parts.editor'])`
    : "body";

export class DefaultCssGenerator extends AbsCssGenerator {
  protected async getCss(options: ImageOptions) {
    const { image, opacity } = options;

    return css`
      ${BODY_SELECTOR} {
        background-size: cover;
        background-repeat: no-repeat;
        background-attachment: fixed; // 兼容 code-server，其他的不影响
        background-position: center;
        opacity: ${opacity};
        background-image: url("${image}");
      }
    `;
  }
}
