import vscode from "vscode";

export class ConfigLoader {
  public config: vscode.WorkspaceConfiguration;

  constructor(configurationName: string) {
    this.config = vscode.workspace.getConfiguration(
      configurationName || "background-image"
    );
  }

  private getValue<T>(key: string): T {
    return this.config.get<T>(key)!;
  }

  private updateValue(key: string, value: any) {
    return this.config.update(key, value);
  }

  public getImages(): string[] {
    return this.getValue<string[]>("images");
  }

  public getSelectedImage(): number {
    return this.getValue<number>("selectedImage");
  }

  public getCurrentlySelectedImage(): string {
    return this.getImages()[this.getSelectedImage()];
  }

  public getOpacity(): number {
    return this.getValue<number>("opacity");
  }

  public async updateSelectedImage(value: number) {
    return this.updateValue("selectedImage", value);
  }

  public async updateOpacity(value: number) {
    return this.updateValue("opacity", value);
  }

  public async updateImages(value: string[]) {
    return this.updateValue("images", value);
  }
}
