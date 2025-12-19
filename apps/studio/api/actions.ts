import { Table } from "./db";
import { ActionModel } from "./types";
import { getIconContent, getLockFile, getPwd, setLockFile } from "./utils";
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import { TargetClient } from "./target-clients/interface";
import { ReactTargetClient } from "./target-clients/react";
import { ReactNativeTargetClient } from "./target-clients/react-native";

export async function actionsWorker({
  actionId,
  table,
}: {
  actionId: number;
  table: Table<ActionModel>;
}) {
  const action = table.get(actionId);

  if (!action) return;

  try {
    switch (action.type) {
      case "MIGRATE_SVG_TO_LOCK":
        await migrateSvgToLock(action.filePath, action.metadata);
        break;
      case "MIGRATE_SVG_TO_FILE":
        await migrateSvgToFile(action.filePath!, action.iconKey!);
        break;
      case "ADD_EXTRA_TARGET":
        await addExtraTarget(action);
        break;
      case "REMOVE_EXTRA_TARGET":
        await removeExtraTarget(action);
        break;
    }

    table.update(actionId, {
      ...action!,
      status: "completed",
      percentage: 100,
    });
  } catch (error) {
    console.error(error);
    table.update(actionId, {
      ...action!,
      status: "failed",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

async function removeExtraTarget(action: ActionModel) {
  const lockFile = await getLockFile();
  if (!lockFile) throw new Error(`Lock file not found`);
  const icon = lockFile.icons[action.iconKey!];
  if (!icon) throw new Error(`Icon ${action.iconKey} not found in lock file`);

  let targetClient: TargetClient | undefined;

  switch (action.targetId) {
    case "react":
      targetClient = new ReactTargetClient();
      break;
    case "react-native":
      targetClient = new ReactNativeTargetClient();
      break;
  }

  if (!targetClient) throw new Error(`Target client not found`);

  await targetClient.removeIcon(icon, action.iconKey!, action.filePath!);

  delete icon.targets[action.targetId!];
  lockFile.icons[action.iconKey!] = icon;
  await setLockFile(lockFile);

  console.log(`Removed target ${action.targetId} for ${action.iconKey}`);
}

async function addExtraTarget(action: ActionModel) {
  const lockFile = await getLockFile();
  if (!lockFile) throw new Error(`Lock file not found`);
  const icon = lockFile.icons[action.iconKey!];
  if (!icon) throw new Error(`Icon ${action.iconKey} not found in lock file`);

  let targetClient: TargetClient | undefined;

  switch (action.targetId) {
    case "react":
      targetClient = new ReactTargetClient();
      break;
    case "react-native":
      targetClient = new ReactNativeTargetClient();
      break;
  }

  if (!targetClient) throw new Error(`Target client not found`);

  await targetClient.addIcon(icon, action.iconKey!, action.filePath!);

  icon.targets[action.targetId!] = {
    path: action.filePath!,
    builtFrom: {
      svgHash: icon.svg.hash,
      configHash: lockFile.configHash,
    },
  };
  lockFile.icons[action.iconKey!] = icon;
  await setLockFile(lockFile);

  console.log(`Added target ${action.targetId} for ${action.iconKey}`);
}

async function migrateSvgToLock(
  filePath?: string,
  metadata?: { iconKey: string }
) {
  if (!filePath || !metadata?.iconKey) return;
  const lockFile = await getLockFile();
  if (!lockFile) return;
  const icon = lockFile.icons[metadata.iconKey];
  if (!icon) return;

  const pwd = await getPwd();
  const fullPath = path.join(pwd, filePath);

  const exists = await fs
    .access(fullPath)
    .then(() => true)
    .catch(() => false);

  if (!exists) throw new Error(`File ${fullPath} does not exist`);

  const content = await getIconContent(icon);

  if (icon.svg.content !== content) {
    icon.svg.content = content;
    icon.svg.hash = crypto.createHash("sha256").update(content).digest("hex");
    lockFile.icons[metadata.iconKey] = icon;
    await setLockFile(lockFile);
  } else {
    console.log(`SVG for ${metadata.iconKey} is already in lock`);
  }

  await fs.unlink(fullPath);

  const folder = path.dirname(fullPath);

  const files = await fs.readdir(folder);

  if (files.length === 0) {
    await fs.rmdir(folder);
    console.log(`Deleted folder ${folder}`);
  }

  console.log(`Migrated SVG to lock for ${metadata.iconKey}`);
}

async function migrateSvgToFile(filePath: string, iconKey: string) {
  if (!filePath || !iconKey) return;

  const pwd = await getPwd();
  const outputPath = path.join(pwd, filePath);

  const exists = await fs
    .access(outputPath)
    .then(() => true)
    .catch(() => false);

  if (exists) {
    console.log(`File ${outputPath} already exists`);
    return;
  }

  const lockFile = await getLockFile();

  if (!lockFile) throw new Error(`Lock file not found`);

  const icon = lockFile.icons[iconKey];

  if (!icon) throw new Error(`Icon ${iconKey} not found in lock file`);

  const folder = path.dirname(outputPath);
  await fs.mkdir(folder, { recursive: true });

  const content = await getIconContent(icon);
  await fs.writeFile(outputPath, content);

  icon.svg.content = `file://${filePath}`;
  icon.svg.hash = crypto.createHash("sha256").update(content).digest("hex");
  lockFile.icons[iconKey] = icon;
  await setLockFile(lockFile);

  console.log(`Migrated SVG to file for ${iconKey}`);
}
