import * as vscode from "vscode";
import { type Disposable } from "vscode";
import { Log } from "../log/logger";
import { vscodePath } from "../constants/vscode-paths";
import { unlockfile } from "../log/file";
import { configLoader } from "../constants/base";
import { CssFile } from "./css-file";
import { CssGenerator } from "./css-generator";

export class Background implements Disposable {
  private disposes: Disposable[] = [];
  public cssFile = new CssFile(vscodePath.cssPath);

  public async install(): Promise<void> {
    try {
      await this.cssFile.backup();

      const css = (
        await CssGenerator.create({
          image: configLoader.getCurrentlySelectedImage()?.toString() ?? "",
          opacity: configLoader.getOpacity() ?? 1,
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
    } catch (e: unknown) {
      Log("ERROR", (e as Error).message);
      void unlockfile();
    }
  }

  public async uninstall(): Promise<void> {
    try {
      let cssContent = await this.cssFile.getContent();
      cssContent = this.cssFile.clearContent(cssContent);

      if (await this.cssFile.saveContent(cssContent)) {
        Log("INFO", "Background image uninstalled successfully.");
      }
    } catch (e: unknown) {
      Log("ERROR", (e as Error).message);
      void unlockfile();
    }
  }

  public async refresh(): Promise<void> {
    try {
      let cssContent = await this.cssFile.getContent();
      cssContent = this.cssFile.clearContent(cssContent);

      const css = (
        await CssGenerator.create({
          image: configLoader.getCurrentlySelectedImage()?.toString() ?? "",
          opacity: configLoader.getOpacity() ?? 1,
        })
      ).trimEnd();

      cssContent += css;

      if (await this.cssFile.saveContent(cssContent)) {
        Log("INFO", "Background image refreshed successfully.");
      }

      await vscode.commands.executeCommand("workbench.action.reloadWindow");
    } catch (e: unknown) {
      Log("ERROR", (e as Error).message);
      void unlockfile();
    }
  }

  public dispose(): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return -- Disposes are not returning anything
    this.disposes.forEach((d) => d.dispose());
  }
}
