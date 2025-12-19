import path from "node:path";
import fs from "node:fs/promises";
import { Config, LockFile, LockFileIcon } from "./types";

export async function getPwd() {
  return process.env.ICONOMA_PWD || process.cwd();
}

export async function getConfig(): Promise<Config | null> {
  const pwd = await getPwd();
  const configPath = path.join(pwd, "iconoma.config.json");

  const exists = await fs
    .access(configPath)
    .then(() => true)
    .catch(() => false);

  if (!exists) return null;

  const configString = await fs.readFile(configPath, "utf-8");

  return JSON.parse(configString);
}

export async function setConfig(config: Config): Promise<void> {
  const pwd = await getPwd();
  const configPath = path.join(pwd, "iconoma.config.json");
  await fs.writeFile(configPath, JSON.stringify(config, null, 2), "utf-8");
}

export async function getLockFile(): Promise<LockFile | null> {
  const pwd = await getPwd();
  const lockPath = path.join(pwd, "iconoma.lock.json");

  const exists = await fs
    .access(lockPath)
    .then(() => true)
    .catch(() => false);

  if (!exists) return null;

  const lockString = await fs.readFile(lockPath, "utf-8");

  return JSON.parse(lockString);
}

export async function getSvgContent(
  icon: LockFileIcon
): Promise<string | null> {
  const isFile = icon.svg.content.startsWith("file://");

  if (isFile) {
    const iconPath = icon.svg.content.replace("file://", "");
    const pwd = await getPwd();
    const filePath = path.join(pwd, iconPath);

    const exists = await fs
      .access(filePath)
      .then(() => true)
      .catch(() => false);

    if (!exists) return null;

    const content = await fs.readFile(filePath, "utf-8");
    return content;
  } else {
    return icon.svg.content;
  }
}
