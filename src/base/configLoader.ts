import * as vscode from "vscode";

export class ConfigLoader {
  private config: vscode.WorkspaceConfiguration;
  private imageCache: Map<number, string> | null = null;

  constructor(configurationName: string = "background-image") {
    this.config = vscode.workspace.getConfiguration(configurationName);
  }

  private getValue<T>(key: string): T {
    return this.config.get<T>(key)!;
  }

  private async updateValue(key: string, value: any) {
    await this.config.update(key, value, vscode.ConfigurationTarget.Global);
  }

  public getImages(): Map<number, string> {
    if (this.imageCache) {
      return this.imageCache;
    }

    const images = this.getValue<string[]>("images");
    this.imageCache = new Map(images.map((image, index) => [index, image]));

    return this.imageCache;
  }

  public getSelectedImage(): number {
    return this.getValue<number>("selectedImage");
  }

  public getCurrentlySelectedImage(): string | undefined {
    return this.getImages().get(this.getSelectedImage());
  }

  public getOpacity(): number {
    return this.getValue<number>("opacity");
  }

  public async updateSelectedImage(value: number) {
    await this.updateValue("selectedImage", value);
  }

  public async updateOpacity(value: number) {
    await this.updateValue("opacity", value);
  }

  public async updateImages(value: string[]) {
    this.imageCache = null; // Invalidate cache
    await this.updateValue("images", value);
  }

  public findImageByName(name: string): number {
    const images = Array.from(this.getImages().values());
    return images.indexOf(name);
  }
}
