import { tmpdir } from "os";
import fs, { constants as fsConstants } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import pkg from "../../package.json";

import { vscode } from "../constants/vsc";
import { lock, unlock } from "../log/file";
import { Log } from "../log/logger";

export enum ECSSEditType {
  NoModified,
  IsOld,
  IsNew,
}

export class CssFile {
  constructor(private filePath: string) {}

  public async getEditType(): Promise<ECSSEditType> {
    if (!(await this.hasInstalled())) {
      return ECSSEditType.NoModified;
    }

    const cssContent = await this.getContent();

    const ifVerOld = !~cssContent.indexOf(
      `/*${"background.ver"}.${pkg.version}*/`
    );

    if (ifVerOld) {
      return ECSSEditType.IsOld;
    }

    return ECSSEditType.IsNew;
  }

  public getContent(): Promise<string> {
    return fs.promises.readFile(this.filePath, "utf-8");
  }

  public async saveContent(content: string): Promise<boolean> {
    if (!content || !content.length) {
      return false;
    }
    try {
      Log("DEBUG", `Saving content to ${this.filePath}`);

      await fs.promises.access(this.filePath, fsConstants.W_OK);
      await fs.promises.writeFile(this.filePath, content, "utf-8");
      return true;
    } catch (e: any) {
      if (!vscode) {
        return false;
      }

      const retry = "Retry with Admin/Sudo";
      const result = await vscode.window.showErrorMessage(e.message, retry);
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
            text: cmdarg + "\n",
          }
        );
        await vscode.commands.executeCommand("workbench.action.terminal.kill");
        await vscode.commands.executeCommand("workbench.action.terminal.focus");

        return true;
      } catch (e: any) {
        await vscode.window.showErrorMessage(e.message);
        return false;
      } finally {
        await fs.promises.rm(tempFilePath);
      }
    }
  }

  private async saveContentToTemp(content: string) {
    const tempPath = path.join(
      tmpdir(),
      `vscode-background-${randomUUID()}.css`
    );
    await fs.promises.writeFile(tempPath, content, "utf-8");
    return tempPath;
  }

  public clearContent(content: string): string {
    content = content.replace(
      /\/\*css-background-start\*\/[\s\S]*?\/\*css-background-end\*\//g,
      ""
    );
    content = content.replace(/\s*$/, "");
    return content;
  }

  public async hasInstalled(): Promise<boolean> {
    const content = await this.getContent();
    if (!content) {
      return false;
    }

    return !!~content.indexOf("background.ver");
  }

  public async uninstall(): Promise<boolean> {
    try {
      await lock();
      let content = await this.getContent();
      content = this.clearContent(content);

      if (!content.trim().length) {
        return false;
      }
      return this.saveContent(content);
    } catch (ex) {
      console.log(ex);
      return false;
    } finally {
      await unlock();
    }
  }
}
