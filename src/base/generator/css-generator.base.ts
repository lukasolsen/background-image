import vscode from "vscode";
import * as stylis from "stylis";

export const css = (
  template: TemplateStringsArray,
  ...args: unknown[]
): string => {
  return template.reduce((prev, curr, i) => {
    let arg = args[i];

    if (typeof arg === "function") {
      arg = arg();
    }
    if (Array.isArray(arg)) {
      arg = arg.join("");
    }

    return prev + curr + (arg?.toString() ?? "");
  }, "");
};

export abstract class AbsCssGenerator<T = unknown> {
  protected normalizeImageUrls(images: string[]): string[] {
    return images.map((imageUrl) => {
      if (!imageUrl.startsWith("file://")) {
        return imageUrl;
      }

      // file:///Users/foo/bar.png => vscode-file://vscode-app/Users/foo/bar.png
      const url = imageUrl.replace("file://", "vscode-file://vscode-app");
      return vscode.Uri.parse(url).toString();
    });
  }

  protected createKeyFrames(
    images: string[],
    interval: number,
    animationName: string
  ): string {
    if (images.length <= 1 || interval < 1) {
      return "";
    }

    const perDuration = 0.6 / (interval * images.length); // 渐变时间/动画总时长，渐变时间在总时长中占比
    const toPercent = (num: number): string => `${(num * 100).toFixed(3)}%`;
    const perFrame = 1 / images.length; // 每片时长 eg: 0.5

    const frames = [...images, images[0]].map((url, index) => {
      let from = index * perFrame - perDuration + perDuration / 2;
      let to = (index + 1) * perFrame - perDuration - perDuration / 2;

      from = Math.max(from, 0);
      to = Math.min(to, 1);

      return {
        from: toPercent(from),
        to: toPercent(to),
        url,
      };
    });

    return css`
      @keyframes ${animationName} {
        ${frames.map(({ from, to, url }) => {
          return css`
            ${from}, ${to} {
              background-image: url("${url}");
            }
          `;
        })}
      }
    `;
  }

  private compileCSS(source: string): string {
    return stylis.serialize(stylis.compile(source), stylis.stringify);
  }

  protected abstract getCss(options: T): string;

  public create(options: T): string {
    const source = this.getCss(options);
    const styles = this.compileCSS(source);

    if (process.env.NODE_ENV === "development") {
      // eslint-disable-next-line no-console -- Log styles in development
      console.log(styles);
    }

    return `
        /*css-background-start*/
        ${styles}
        /*css-background-end*/
        `;
  }
}
