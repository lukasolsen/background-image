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
      opacity: config.get<number>("opacity", 1),
      blur: config.get<number>("blur", 0),
      grayscale: config.get<number>("grayscale", 0),
      contrast: config.get<number>("contrast", 100),
    });
    context.subscriptions.push(background);
  }

  vscode.commands.registerCommand("background-image.helloWorld", () => {
    vscode.window.showInformationMessage("Hello World from Background Image!");
  });

  vscode.commands.registerCommand("background-image.selectImage", () => {
    vscode.window.showInformationMessage("Select Image from Background Image!");
  });

  vscode.commands.registerCommand("background-image.nextImage", () => {
    vscode.window.showInformationMessage("Next Image from Background Image!");
  });

  vscode.commands.registerCommand("background-image.previousImage", () => {
    vscode.window.showInformationMessage(
      "Previous Image from Background Image!"
    );
  });

  vscode.commands.registerCommand("background-image.uninstall", async () => {
    await background.uninstall();

    await context.globalState.update(
      `backgroundImage-${version}-firstTime`,
      true
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
}

export function deactivate() {}
