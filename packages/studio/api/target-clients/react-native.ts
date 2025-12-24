import { transform } from "@svgr/core";
import { LockFileIcon } from "../types";
import { getConfig, getIconContent, keyToComponentName } from "../utils";
import { TargetClient } from "./interface";
import { ReactTargetClient } from "./react";

export class ReactNativeTargetClient
  extends ReactTargetClient
  implements TargetClient
{
  async addIcon(
    icon: LockFileIcon,
    iconKey: string,
    filePath: string
  ): Promise<void> {
    const content = await getIconContent(icon);

    const componentName = keyToComponentName(iconKey);

    const config = await getConfig();

    const reactContent = await transform(
      content,
      {
        plugins: [
          "@svgr/plugin-svgo",
          "@svgr/plugin-jsx",
          "@svgr/plugin-prettier",
        ],
        icon: true,
        svgoConfig: config?.svgo,
        typescript: filePath.endsWith(".tsx"),
        native: true,
      },
      { componentName }
    );

    await this.writeComponent(iconKey, reactContent, filePath);
  }
}
