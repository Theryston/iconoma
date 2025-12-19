import { Router, json } from "express";
import {
  actionsTable,
  createAction,
  getConfig,
  getLockFile,
  getPwd,
  setConfig,
  toPascalFromSeparated,
  getIconContent,
} from "./utils";
import path from "node:path";
import fs from "node:fs/promises";
import { Change, Config } from "./types";

const apiRoutes: Router = Router();

apiRoutes.use(json());

apiRoutes.get("/pwd", async (req, res) => {
  res.json({ pwd: await getPwd() });
});

apiRoutes.get("/config", async (req, res) => {
  const config = await getConfig();
  res.json(config);
});

apiRoutes.post("/config/changes", async (req, res) => {
  const currentConfig = await getConfig();
  const lockFile = await getLockFile();
  const newConfig = req.body as Config;

  if (!currentConfig) {
    return res.json({ changes: [] });
  }

  const addedExtraTargets = newConfig.extraTargets.filter(
    (newTarget) =>
      !currentConfig.extraTargets.some(
        (currentTarget) => currentTarget.targetId === newTarget.targetId
      )
  );

  const removedExtraTargets = currentConfig.extraTargets.filter(
    (currentTarget) =>
      !newConfig.extraTargets.some(
        (newTarget) => newTarget.targetId === currentTarget.targetId
      )
  );

  const changedExtraTargets = newConfig.extraTargets
    .filter((newTarget) =>
      currentConfig.extraTargets.some(
        (currentTarget) =>
          currentTarget.targetId === newTarget.targetId &&
          currentTarget.outputPath !== newTarget.outputPath
      )
    )
    .filter(
      (newTarget) =>
        !addedExtraTargets.some((t) => t.targetId === newTarget.targetId) &&
        !removedExtraTargets.some((t) => t.targetId === newTarget.targetId)
    );

  const changes: Change[] = [];

  const icons = lockFile?.icons || {};

  for (const iconKey of Object.keys(icons)) {
    const icon = icons[iconKey];
    if (!icon) continue;

    if (
      newConfig.svg.folder !== currentConfig.svg.folder ||
      newConfig.svg.inLock !== currentConfig.svg.inLock
    ) {
      const isFile = icon.svg.content.startsWith("file://");

      if (isFile && newConfig.svg.inLock) {
        changes.push({
          type: "MIGRATE_SVG_TO_LOCK",
          filePath: icon.svg.content.replace("file://", ""),
          metadata: {
            iconKey,
          },
        });
      }

      if (!isFile && !newConfig.svg.inLock) {
        if (!newConfig.svg.folder) continue;
        const filePath = path.join(newConfig.svg.folder, iconKey + ".svg");

        changes.push({
          type: "MIGRATE_SVG_TO_FILE",
          filePath,
          iconKey,
        });
      }
    }

    for (const addedTarget of addedExtraTargets) {
      const filePath = addedTarget.outputPath.replace("{name}", iconKey);

      changes.push({
        type: "ADD_EXTRA_TARGET",
        targetId: addedTarget.targetId,
        filePath,
        iconKey,
      });
    }

    for (const removedTarget of removedExtraTargets) {
      const filePath = removedTarget.outputPath.replace("{name}", iconKey);

      changes.push({
        type: "REMOVE_EXTRA_TARGET",
        targetId: removedTarget.targetId,
        filePath,
        iconKey,
      });
    }

    for (const changedTarget of changedExtraTargets) {
      const filePath = changedTarget.outputPath.replace("{name}", iconKey);
      const originalFilePath = currentConfig.extraTargets
        .find((t) => t.targetId === changedTarget.targetId)
        ?.outputPath.replace("{name}", iconKey);

      changes.push({
        type: "REMOVE_EXTRA_TARGET",
        targetId: changedTarget.targetId,
        filePath: originalFilePath,
        iconKey,
      });

      changes.push({
        type: "ADD_EXTRA_TARGET",
        targetId: changedTarget.targetId,
        filePath,
        iconKey,
      });
    }
  }

  if (JSON.stringify(newConfig.svgo) !== JSON.stringify(currentConfig.svgo)) {
    changes.push({
      type: "REGENERATE_ALL",
    });
  }

  res.json({ changes });
});

apiRoutes.post("/config", async (req, res) => {
  const body = req.body as { config: Config; changes: Change[] };

  await setConfig(body.config);

  for (const change of body.changes) {
    createAction(change);
  }

  res.json({ success: true });
});

apiRoutes.get("/actions", async (req, res) => {
  const actions = actionsTable.getAll();
  res.json({ actions });
});

apiRoutes.get("/commit/changes", async (req, res) => {
  res.json({ changes: [] });
});

apiRoutes.post("/icons/create", async (req, res) => {
  const body = req.body as { name: string; tags: string[]; content: string };

  const icon = await createAction({
    type: "CREATE_ICON",
    metadata: {
      name: body.name,
      tags: body.tags,
      content: body.content,
    },
  });

  if (!icon) {
    return res.status(500).json({ error: "Icon not found after creation" });
  }

  res.json({ icon, pascalName: toPascalFromSeparated(body.name) });
});

apiRoutes.get("/icons/:iconKey", async (req, res) => {
  const iconKey = req.params.iconKey;

  if (!iconKey) {
    return res.status(400).json({ error: "Icon key is required" });
  }

  const lockFile = await getLockFile();
  if (!lockFile) {
    return res.status(404).json({ error: "Lock file not found" });
  }

  const icon = lockFile.icons[iconKey];
  if (!icon) {
    return res.status(404).json({ error: "Icon not found" });
  }

  const svgContent = await getIconContent(icon);

  res.json({
    icon,
    pascalName: toPascalFromSeparated(iconKey),
    svgContent,
  });
});

apiRoutes.get("/icons/content", async (req, res) => {
  const filePath = req.query.path as string;

  if (!filePath) {
    return res.status(400).json({ error: "Path is required" });
  }

  const pwd = await getPwd();
  const fullPath = path.join(pwd, filePath);

  try {
    const content = await fs.readFile(fullPath, "utf-8");
    res.setHeader("Content-Type", "image/svg+xml");
    res.send(content);
  } catch (error) {
    res.status(404).json({ error: "File not found" });
  }
});

export default apiRoutes;
