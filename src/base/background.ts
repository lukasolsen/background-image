import vscode, { Disposable } from "vscode";
import { ImageOptions } from "../types/imageOptions";
import { CssGenerator } from "./cssGenerator";
import { Log } from "../log/logger";
import { CssFile } from "./CssFile";
import { vscodePath } from "../constants/vscodePaths";
import { unlock } from "../log/file";
import { configLoader } from "../constants/base";

export class Background implements Disposable {
  private disposes: Disposable[] = [];
  public cssFile = new CssFile(vscodePath.cssPath);

  public async install(): Promise<void> {
    try {
      const css = (
        await CssGenerator.create({
          image: configLoader.getCurrentlySelectedImage(),
          opacity: configLoader.getOpacity(),
        })
      ).trimEnd();

      Log("DEBUG", `CSS: ${css}`);

      let cssContent = await this.cssFile.getContent();

      cssContent = this.cssFile.clearContent(cssContent);

      if (!cssContent.trim().length) {
        return;
      }
      cssContent += css;

      if (await this.cssFile.saveContent(cssContent)) {
        Log("INFO", "Background image installed successfully.");
      }
    } catch (e: any) {
      Log("ERROR", e.message);
      unlock();
    }
  }

  public async uninstall(): Promise<void> {
    try {
      let cssContent = await this.cssFile.getContent();
      cssContent = this.cssFile.clearContent(cssContent);

      if (await this.cssFile.saveContent(cssContent)) {
        Log("INFO", "Background image uninstalled successfully.");
      }
    } catch (e: any) {
      Log("ERROR", e.message);
      unlock();
    }
  }

  public async refresh(): Promise<void> {
    try {
      await this.uninstall();
      await this.install();
    } catch (e: any) {
      Log("ERROR", e.message);
      unlock();
    }
  }

  public dispose() {
    this.disposes.forEach((d) => d.dispose());
  }
}
