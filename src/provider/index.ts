import { type TreeItem, Uri } from "vscode";
import { configLoader } from "~/constants/base";

export class ImageGridDataProvider {
  private images: { title: string; url: string }[];

  constructor() {
    this.images = Array.from(configLoader.getImages()).map(
      ([_index, image]) => {
        return {
          title: image,
          url: image,
        };
      }
    );
  }

  getTreeItem(element: { title: string; url: string }): TreeItem {
    return {
      label: element.title,
      iconPath: Uri.parse(element.url),
      command: {
        command: "background-image.select-image",
        title: "Set Image Background",
        arguments: [element.url],
      },
    };
  }

  getChildren(): { title: string; url: string }[] {
    return this.images;
  }
}
