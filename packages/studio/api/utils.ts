import path from "node:path";
import fs from "node:fs/promises";
import { ActionModel, Change, Config, LockFile, LockFileIcon } from "./types";
import crypto from "node:crypto";
import { table } from "./db";
import { actionsQueue } from "./queue";

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
  const content = JSON.stringify(config, null, 2);
  const hash = crypto.createHash("sha256").update(content).digest("hex");
  await fs.writeFile(configPath, content, "utf-8");

  let lockFile = await getLockFile();

  if (!lockFile) {
    lockFile = {
      configHash: hash,
      icons: {},
    };
  }

  lockFile.configHash = hash;

  await setLockFile(lockFile);
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

export async function setLockFile(lockFile: LockFile): Promise<void> {
  const pwd = await getPwd();
  const lockPath = path.join(pwd, "iconoma.lock.json");
  await fs.writeFile(lockPath, JSON.stringify(lockFile, null, 2), "utf-8");
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

export async function getIconContent(icon: LockFileIcon): Promise<string> {
  const isFile = icon.svg.content.startsWith("file://");

  if (!isFile) return icon.svg.content;

  const iconPath = icon.svg.content.replace("file://", "");
  const pwd = await getPwd();
  const filePath = path.join(pwd, iconPath);
  const content = await fs.readFile(filePath, "utf-8");
  return content;
}

export function toPascalFromSeparated(input: string): string {
  return String(input)
    .trim()
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("");
}

export async function setContent(
  config: Config,
  iconKey: string,
  content: string
): Promise<{ content: string; hash: string }> {
  const hash = crypto.createHash("sha256").update(content).digest("hex");

  if (config.svg.inLock) {
    return {
      content,
      hash,
    };
  } else {
    if (!config.svg.folder) {
      throw new Error("SVG folder must be provided when inLock is false");
    }

    const pwd = await getPwd();
    const filePath = path.join(config.svg.folder, `${iconKey}.svg`);
    const fullPath = path.join(pwd, filePath);

    const folder = path.dirname(fullPath);
    await fs.mkdir(folder, { recursive: true });

    await fs.writeFile(fullPath, content, "utf-8");

    return {
      content: `file://${filePath}`,
      hash,
    };
  }
}

export const actionsTable = table<ActionModel>("actions");

export async function createAction(action: Change) {
  const createdActionId: number = actionsTable.create({
    ...action,
    status: "pending",
    percentage: 0,
  });

  return await actionsQueue.push({
    actionId: createdActionId,
    table: actionsTable,
  });
}
