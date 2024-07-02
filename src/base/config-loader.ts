import * as vscode from "vscode";

export class ConfigLoader {
  private config: vscode.WorkspaceConfiguration =
    vscode.workspace.getConfiguration("background-image");
  private imageCache: Map<number, string> | null = null;

  private getValue<T>(key: string): T | undefined {
    return this.config.get<T>(key);
  }

  public getImages(): Map<number, string> {
    if (this.imageCache) {
      return this.imageCache;
    }

    const images = this.getValue<string[]>("images");
    if (!images) {
      return new Map();
    }

    this.imageCache = new Map(images.map((image, index) => [index, image]));

    return this.imageCache;
  }

  public getSelectedImage(): number | undefined {
    return this.getValue<number>("selectedImage");
  }

  public getCurrentlySelectedImage(): string | undefined {
    return this.getImages().get(this.getSelectedImage() ?? 0);
  }

  private async updateValue(key: string, value: unknown): Promise<void> {
    await this.config.update(key, value, vscode.ConfigurationTarget.Global);
  }

  public getOpacity(): number | undefined {
    return this.getValue<number>("opacity");
  }

  public async updateSelectedImage(value: number): Promise<void> {
    await this.updateValue("selectedImage", value);
  }

  public async updateOpacity(value: number): Promise<void> {
    await this.updateValue("opacity", value);
  }

  public async updateImages(value: string[]): Promise<void> {
    this.imageCache = null; // Invalidate cache
    await this.updateValue("images", value);
  }

  public findImageByName(name: string): number {
    const images = Array.from(this.getImages().values());
    return images.indexOf(name);
  }
}
