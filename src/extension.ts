import * as vscode from "vscode";
import { Log } from "./log/logger";
import { Background } from "./base/background";
import * as pgk from "../package.json";
import { configLoader } from "./constants/base";

export async function activate(context: vscode.ExtensionContext) {
  const version = pgk.version;

  const backgroundProcess = new Background();
  const firstTime = context.globalState.get(
    `backgroundImage-${version}-firstTime`,
    true
  );

  if (firstTime) {
    Log("INFO", "Users first time loading the extension. Installing...");
    context.globalState.update(`backgroundImage-${version}-firstTime`, false);
    vscode.window
      .showInformationMessage(
        "Thank you for installing Background Image! You can configure the extension in the settings.",
        "Reload Window"
      )
      .then((selection) => {
        if (selection === "Reload Window") {
          vscode.commands.executeCommand("workbench.action.reloadWindow");
        }
      });

    await backgroundProcess.install();
    context.subscriptions.push(backgroundProcess);
  }

  vscode.commands.registerCommand("background-image.select", async () => {
    const items: vscode.QuickPickItem[] = configLoader
      .getImages()
      .map((img) => ({
        label: img,
        picked: img === configLoader.getCurrentlySelectedImage(),
      }));

    const picker = vscode.window.showQuickPick(items, {
      canPickMany: false,
      placeHolder: "Select an image",
    });

    picker.then(async (selection) => {
      if (selection) {
        Log("INFO", `Selected image: ${selection.label}`);

        const index = configLoader.findImageByName(selection.label);
        Log("INFO", `Selected image index: ${index}`);
        await configLoader.updateSelectedImage(index);
        await backgroundProcess.refresh();

        vscode.commands.executeCommand("workbench.action.reloadWindow");
      }
    });
  });

  vscode.commands.registerCommand("background-image.refresh", async () => {
    await backgroundProcess.refresh();

    vscode.commands.executeCommand("workbench.action.reloadWindow");
  });

  vscode.commands.registerCommand("background-image.dev-reset", async () => {
    await context.globalState.update(
      `backgroundImage-${version}-firstTime`,
      true
    );

    await backgroundProcess.uninstall();

    vscode.window
      .showInformationMessage(
        "Development reset. Please reload the window to see the changes.",
        "Reload Window"
      )
      .then((selection) => {
        if (selection === "Reload Window") {
          vscode.commands.executeCommand("workbench.action.reloadWindow");
        }
      });
  });

  vscode.commands.registerCommand("background-image.uninstall", async () => {
    await backgroundProcess.uninstall();

    await context.globalState.update(
      `backgroundImage-${version}-firstTime`,
      true
    );

    // remove it
    await vscode.commands.executeCommand(
      "workbench.extensions.uninstallExtension",
      pgk.publisher + "." + pgk.name
    );

    vscode.window
      .showInformationMessage(
        "Background image uninstalled. Please reload the window to see the changes.",
        "Reload Window"
      )
      .then((selection) => {
        if (selection === "Reload Window") {
          vscode.commands.executeCommand("workbench.action.reloadWindow");
        }
      });
  });

  // check if the user has changed their configuration then do the refresh
  vscode.workspace.onDidChangeConfiguration(async (event) => {
    if (event.affectsConfiguration("background-image")) {
      // Introduce a delay to ensure all changes have been applied
      setTimeout(async () => {
        await backgroundProcess.refresh();

        vscode.window
          .showInformationMessage("Background image updated.", "Reload Window")
          .then((selection) => {
            if (selection === "Reload Window") {
              vscode.commands.executeCommand("workbench.action.reloadWindow");
            }
          });
      }, 1000);
    }
  });
}

export function deactivate() {}
