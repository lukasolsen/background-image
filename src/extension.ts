import * as vscode from "vscode";
import { Log } from "./log/logger";
import { Background } from "./base/background";

export async function activate(context: vscode.ExtensionContext) {
  Log("INFO", "Congratulations, your extension is now active!");

  const config = vscode.workspace.getConfiguration("background-image");
  const images = config.get<string[]>("images", [
    "https://lh3.googleusercontent.com/drive-viewer/AKGpihbHfbd-FCo1dYmZwMNnSMIcA4Hz3QGNLFBjRpxAQ4YSpKzir_ysdbx5JOHIfLIodCwH84gu3n1cldFDukF_4a1QeV0bspucGQ=w1960-h4204-rw-v1",
  ]);
  const currentlySelectedImage = config.get<number>("selectedImage", 0);

  Log("DEBUG", `Currently selected image: ${images[currentlySelectedImage]}`);

  if (currentlySelectedImage >= images.length) {
    config.update("selectedImage", 0, vscode.ConfigurationTarget.Global);
  }

  const background = new Background();
  await background.install({
    image: images[currentlySelectedImage],
    opacity: config.get<number>("opacity", 1),
    blur: config.get<number>("blur", 0),
    grayscale: config.get<number>("grayscale", 0),
    contrast: config.get<number>("contrast", 100),
  });
  context.subscriptions.push(background);

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
}

export function deactivate() {}
