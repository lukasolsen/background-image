/* eslint-disable @typescript-eslint/no-floating-promises -- no dup */
import * as vscode from "vscode";
import * as pgk from "../package.json";
import { Log } from "./log/logger";
import { Background } from "./base/background";
import { configLoader } from "./constants/base";
import { ImageGridDataProvider } from "./provider";

export async function activate(
  context: vscode.ExtensionContext
): Promise<void> {
  const version = pgk.version;

  const backgroundProcess = new Background();
  const firstTime: boolean = context.globalState.get(
    `backgroundImage-${version}-firstTime`,
    true
  );

  const supportedImageExtensions = context.globalState.get(
    "supportedImageExtensions",
    []
  );

  Log(
    "DEBUG",
    `Supported image extensions: ${supportedImageExtensions.join(", ")}`
  );

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- This is necessary
  if (firstTime) {
    Log("INFO", "Users first time loading the extension. Installing...");
    context.globalState.update(`backgroundImage-${version}-firstTime`, false);
    context.globalState.update("supportedImageExtensions", [
      "png",
      "jpg",
      "jpeg",
      "gif",
      "bmp",
      "webp",
    ]);
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

  vscode.commands.registerCommand("background-image.select", (): void => {
    const items: vscode.QuickPickItem[] = Array.from(
      configLoader.getImages()
    ).map(([index, image]) => {
      return {
        label: image,
        description:
          index === configLoader.getSelectedImage() ? "Selected" : "",
      };
    });

    const picker = vscode.window.showQuickPick(items, {
      canPickMany: false,
      placeHolder: "Select an image",
    });

    picker.then(async (selection) => {
      if (selection) {
        Log("INFO", `Selected image: ${selection.label}`);

        const index = configLoader.findImageByName(selection.label);
        Log("INFO", `Selected image index: ${String(index)}`); // Convert index to string
        await configLoader.updateSelectedImage(index);
      }
    });
  });

  vscode.commands.registerCommand(
    "background-image.select-image",
    async (image: string): Promise<void> => {
      Log("INFO", `Selected image: ${image}`);

      const index = configLoader.findImageByName(image);
      Log("INFO", `Selected image index: ${String(index)}`); // Convert index to string
      await configLoader.updateSelectedImage(index);
    }
  );

  vscode.commands.registerCommand("background-image.refresh", async () => {
    await backgroundProcess.refresh();
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
      `${pgk.publisher}.${pgk.name}`
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

  vscode.workspace.onDidChangeConfiguration((event): void => {
    if (event.affectsConfiguration("background-image")) {
      // Introduce a delay to ensure all changes have been applied
      setTimeout(() => {
        backgroundProcess.refresh();

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

  vscode.window.registerTreeDataProvider(
    "backgroundImageSelector",
    new ImageGridDataProvider()
  );
}

export function deactivate(): void {
  Log("INFO", "Deactivating extension.");
}
