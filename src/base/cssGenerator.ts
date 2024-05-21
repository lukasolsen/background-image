import { ImageOptions } from "../types/imageOptions";
import { DefaultCssGenerator } from "./generator/default.generator";

export class CssGenerator {
  public static create(options: ImageOptions) {
    if (!options.image) {
      return "";
    }

    return new DefaultCssGenerator().create(options);
  }
}
