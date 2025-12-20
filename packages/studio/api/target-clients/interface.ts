import { LockFileIcon } from "../types";

export interface TargetClient {
  addIcon(icon: LockFileIcon, iconKey: string, filePath: string): Promise<void>;
  removeIcon(
    icon: LockFileIcon,
    iconKey: string,
    filePath: string
  ): Promise<void>;
}
