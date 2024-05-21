import * as vscode from "vscode";
import { Log } from "./log/logger";

export function activate(context: vscode.ExtensionContext) {
  Log("INFO", "Congratulations, your extension is now active!");

  const config = vscode.workspace.getConfiguration("background-image");
  const images = config.get<string[]>("images", []);
  const currentlySelectedImage = config.get<number>("selectedImage", 0);

  Log("DEBUG", `Currently selected image: ${images[currentlySelectedImage]}`);

  if (currentlySelectedImage >= images.length) {
    config.update("selectedImage", 0, vscode.ConfigurationTarget.Global);
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
}

export function deactivate() {}
