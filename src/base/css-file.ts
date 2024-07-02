import { tmpdir } from "node:os";
import fs, { constants as fsConstants } from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import pkg from "../../package.json";
import { vscode } from "../constants/vsc";
import { lockfile, unlockfile } from "../log/file";
import { Log } from "../log/logger";

export enum ECSSEditType {
  NoModified,
  IsOld,
  IsNew,
}

export class CssFile {
  constructor(private filePath: string) {}

  public async backup(): Promise<boolean> {
    try {
      const content = await this.getContent();
      await fs.promises.writeFile(`${this.filePath}.bak`, content, "utf-8");
      return true;
    } catch (e: unknown) {
      Log("ERROR", (e as Error).message);
      return false;
    }
  }

  public async getEditType(): Promise<ECSSEditType> {
    if (!(await this.hasInstalled())) {
      return ECSSEditType.NoModified;
    }

    const cssContent = await this.getContent();

    const ifVerOld = !cssContent.includes(`/*background.ver.${pkg.version}*/`);

    if (ifVerOld) {
      return ECSSEditType.IsOld;
    }

    return ECSSEditType.IsNew;
  }

  public getContent(): Promise<string> {
    return fs.promises.readFile(this.filePath, "utf-8");
  }

  public async saveContent(content: string): Promise<boolean> {
    if (!content.length) {
      return false;
    }
    try {
      Log("DEBUG", `Saving content to ${this.filePath}`);

      await fs.promises.access(this.filePath, fsConstants.W_OK);
      await fs.promises.writeFile(this.filePath, content, "utf-8");
      return true;
    } catch (e: unknown) {
      if (!vscode) {
        return false;
      }

      const retry = "Retry with Admin/Sudo";
      const result = await vscode.window.showErrorMessage(
        (e as Error).message,
        retry
      );
      if (result !== retry) {
        return false;
      }
      const tempFilePath = await this.saveContentToTemp(content);
      try {
        const mvcmd = process.platform === "win32" ? "move /Y" : "mv -f";
        const cmdarg = `${mvcmd} "${tempFilePath}" "${this.filePath}"`;
        await vscode.commands.executeCommand("workbench.action.terminal.new");
        await vscode.commands.executeCommand("workbench.action.terminal.focus");
        await vscode.commands.executeCommand(
          "workbench.action.terminal.sendSequence",
          {
            text: `${cmdarg}\n`,
          }
        );
        await vscode.commands.executeCommand("workbench.action.terminal.kill");
        await vscode.commands.executeCommand("workbench.action.terminal.focus");

        return true;
      } catch (error: unknown) {
        await vscode.window.showErrorMessage((error as Error).message);
        return false;
      } finally {
        await fs.promises.rm(tempFilePath);
      }
    }
  }

  private async saveContentToTemp(content: string): Promise<string> {
    const tempPath = path.join(
      tmpdir(),
      `vscode-background-${randomUUID()}.css`
    );
    await fs.promises.writeFile(tempPath, content, "utf-8");
    return tempPath;
  }

  public clearContent(content: string): string {
    let modifiedContent = content.replace(
      /\/\*css-background-start\*\/[\s\S]*?\/\*css-background-end\*\//g,
      ""
    );
    modifiedContent = modifiedContent.replace(/\s*$/, "");
    return modifiedContent;
  }

  public async hasInstalled(): Promise<boolean> {
    const content = await this.getContent();
    if (!content) {
      return false;
    }

    return content.includes("background.ver");
  }

  public async uninstall(): Promise<boolean> {
    try {
      await lockfile();
      let content = await this.getContent();
      content = this.clearContent(content);

      if (!content.trim().length) {
        return false;
      }
      return this.saveContent(content);
    } catch (ex) {
      // eslint-disable-next-line no-console -- Log error
      console.log(ex);
      return false;
    } finally {
      await unlockfile();
    }
  }
}
