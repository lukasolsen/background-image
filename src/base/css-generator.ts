import { type ImageOptions } from "../types/image-options";
import { DefaultCssGenerator } from "./generator/default.generator";

// eslint-disable-next-line @typescript-eslint/no-extraneous-class -- Class is exported
export class CssGenerator {
  public static create(options: ImageOptions): string | Promise<string> {
    if (!options.image) {
      return "";
    }

    return new DefaultCssGenerator().create(options);
  }
}
