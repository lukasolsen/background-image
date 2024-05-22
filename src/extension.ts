import * as vscode from "vscode";
import { Log } from "./log/logger";
import { Background } from "./base/background";
import * as pgk from "../package.json";

export async function activate(context: vscode.ExtensionContext) {
  Log("INFO", "Congratulations, your extension is now active!");

  const config = vscode.workspace.getConfiguration("background-image");
  const images = config.get<string[]>("images", [
    "https://gitlab.com/kalilinux/packages/kali-wallpapers/-/raw/kali/master/2024/backgrounds/kali/kali-metal-dark-16x9.png?ref_type=heads",
  ]);
  const currentlySelectedImage = config.get<number>("selectedImage", 0);

  Log("DEBUG", `Currently selected image: ${images[currentlySelectedImage]}`);

  Log("DEBUG", `Images: ${images}`);

  if (currentlySelectedImage >= images.length) {
    config.update("selectedImage", 0, vscode.ConfigurationTarget.Global);
  }

  const version = pgk.version;

  const background = new Background();
  const firstTime = context.globalState.get(
    `backgroundImage-${version}-firstTime`,
    true
  );

  if (firstTime) {
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

    await background.install({
      image: images[currentlySelectedImage],
      opacity: config.get<number>("opacity", 0.91),
    });
    context.subscriptions.push(background);
  }

  vscode.commands.registerCommand("background-image.nextImage", async () => {
    let nextImage = currentlySelectedImage + 1;

    if (nextImage >= images.length) {
      nextImage = 0;
    }

    await config.update(
      "selectedImage",
      nextImage,
      vscode.ConfigurationTarget.Global
    );

    vscode.window
      .showInformationMessage("Background image updated.", "Reload Window")
      .then((selection) => {
        if (selection === "Reload Window") {
          vscode.commands.executeCommand("workbench.action.reloadWindow");
        }
      });
  });

  vscode.commands.registerCommand(
    "background-image.previousImage",
    async () => {
      let previousImage = currentlySelectedImage - 1;

      if (previousImage < 0) {
        previousImage = images.length - 1;
      }

      await config.update(
        "selectedImage",
        previousImage,
        vscode.ConfigurationTarget.Global
      );

      vscode.window
        .showInformationMessage("Background image updated.", "Reload Window")
        .then((selection) => {
          if (selection === "Reload Window") {
            vscode.commands.executeCommand("workbench.action.reloadWindow");
          }
        });
    }
  );

  vscode.commands.registerCommand("background-image.refresh", async () => {
    await background.refresh({
      image: images[currentlySelectedImage],
      opacity: config.get<number>("opacity", 0.91),
    });

    vscode.window
      .showInformationMessage("Background image updated.", "Reload Window")
      .then((selection) => {
        if (selection === "Reload Window") {
          vscode.commands.executeCommand("workbench.action.reloadWindow");
        }
      });
  });

  vscode.commands.registerCommand("background-image.dev-reset", async () => {
    await context.globalState.update(
      `backgroundImage-${version}-firstTime`,
      true
    );

    await background.uninstall();

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
    await background.uninstall();

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
      await background.refresh({
        image: images[currentlySelectedImage],
        opacity: config.get<number>("opacity", 0.91),
      });

      vscode.window
        .showInformationMessage("Background image updated.", "Reload Window")
        .then((selection) => {
          if (selection === "Reload Window") {
            vscode.commands.executeCommand("workbench.action.reloadWindow");
          }
        });
    }
  });
}

export function deactivate() {}
