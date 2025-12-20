import { cp, rm, mkdir, access } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const root = path.resolve(__dirname, "..");

// Copy client files
const src = path.join(root, "dist", "client");
const dest = path.join(root, ".bundle", "client");

await rm(dest, { recursive: true, force: true });
await mkdir(path.dirname(dest), { recursive: true });
await cp(src, dest, { recursive: true });

console.log(`Copied: ${src} -> ${dest}`);

// Copy css-tree data files (required by bundled code)
// The bundled code expects ../data/patch.json relative to index.js
// When the bundle runs from packages/cli/dist/studio/index.js,
// it needs packages/cli/dist/data/patch.json
// So we put it in .bundle/../data which will be copied to the right place
async function findCssTreeData() {
  const nodeModulesPath = path.join(root, "node_modules");

  // Try multiple resolution strategies
  const strategies = [
    // Strategy 1: Try require.resolve (works for direct deps)
    async () => {
      try {
        const require = createRequire(import.meta.url);
        const cssTreePath = require.resolve("css-tree/package.json");
        return path.dirname(cssTreePath);
      } catch {
        return null;
      }
    },
    // Strategy 2: Search in node_modules and .pnpm structure
    async () => {
      try {
        const { readdir } = await import("node:fs/promises");

        // Check for css-tree in node_modules (flat structure)
        if (
          await access(nodeModulesPath)
            .then(() => true)
            .catch(() => false)
        ) {
          const entries = await readdir(nodeModulesPath, {
            withFileTypes: true,
          });
          for (const entry of entries) {
            if (entry.isDirectory() && entry.name === "css-tree") {
              const cssTreePath = path.join(nodeModulesPath, "css-tree");
              if (
                await access(path.join(cssTreePath, "data"))
                  .then(() => true)
                  .catch(() => false)
              ) {
                return cssTreePath;
              }
            }
          }
        }

        // Check in .pnpm structure (pnpm's virtual store)
        const pnpmPath = path.join(nodeModulesPath, ".pnpm");
        if (
          await access(pnpmPath)
            .then(() => true)
            .catch(() => false)
        ) {
          const pnpmEntries = await readdir(pnpmPath, { withFileTypes: true });
          for (const entry of pnpmEntries) {
            if (entry.isDirectory() && entry.name.includes("css-tree@")) {
              // Try different pnpm directory structures
              const possiblePaths = [
                path.join(pnpmPath, entry.name, "node_modules", "css-tree"),
                path.join(pnpmPath, entry.name, "css-tree"),
              ];

              for (const cssTreePath of possiblePaths) {
                const dataPath = path.join(cssTreePath, "data");
                if (
                  await access(dataPath)
                    .then(() => true)
                    .catch(() => false)
                ) {
                  return cssTreePath;
                }
              }
            }
          }
        }

        // Also check root node_modules (for workspace setups)
        const rootNodeModules = path.join(root, "..", "..", "node_modules");
        if (
          await access(rootNodeModules)
            .then(() => true)
            .catch(() => false)
        ) {
          const rootPnpmPath = path.join(rootNodeModules, ".pnpm");
          if (
            await access(rootPnpmPath)
              .then(() => true)
              .catch(() => false)
          ) {
            const pnpmEntries = await readdir(rootPnpmPath, {
              withFileTypes: true,
            });
            for (const entry of pnpmEntries) {
              if (
                entry.isDirectory() &&
                entry.name.includes("css-tree@3.1.0")
              ) {
                const cssTreePath = path.join(
                  rootPnpmPath,
                  entry.name,
                  "node_modules",
                  "css-tree"
                );
                const dataPath = path.join(cssTreePath, "data");
                if (
                  await access(dataPath)
                    .then(() => true)
                    .catch(() => false)
                ) {
                  return cssTreePath;
                }
              }
            }
          }
        }

        return null;
      } catch (err) {
        console.warn(`Search error: ${err.message}`);
        return null;
      }
    },
  ];

  for (const strategy of strategies) {
    const result = await strategy();
    if (result) {
      const dataPath = path.join(result, "data");
      if (
        await access(dataPath)
          .then(() => true)
          .catch(() => false)
      ) {
        return dataPath;
      }
    }
  }

  return null;
}

// Helper function to find a package in node_modules
async function findPackage(packageName, versionHint = null) {
  const nodeModulesPath = path.join(root, "node_modules");

  const strategies = [
    // Strategy 1: Try require.resolve
    async () => {
      try {
        const require = createRequire(import.meta.url);
        const pkgPath = require.resolve(`${packageName}/package.json`);
        return path.dirname(pkgPath);
      } catch {
        return null;
      }
    },
    // Strategy 2: Search in node_modules and .pnpm structure
    async () => {
      try {
        const { readdir } = await import("node:fs/promises");

        // Check for package in node_modules (flat structure)
        if (
          await access(nodeModulesPath)
            .then(() => true)
            .catch(() => false)
        ) {
          const entries = await readdir(nodeModulesPath, {
            withFileTypes: true,
          });
          for (const entry of entries) {
            if (entry.isDirectory() && entry.name === packageName) {
              return path.join(nodeModulesPath, packageName);
            }
          }
        }

        // Check in .pnpm structure (pnpm's virtual store)
        const pnpmPath = path.join(nodeModulesPath, ".pnpm");
        if (
          await access(pnpmPath)
            .then(() => true)
            .catch(() => false)
        ) {
          const pnpmEntries = await readdir(pnpmPath, { withFileTypes: true });
          for (const entry of pnpmEntries) {
            if (entry.isDirectory() && entry.name.includes(`${packageName}@`)) {
              const possiblePaths = [
                path.join(pnpmPath, entry.name, "node_modules", packageName),
                path.join(pnpmPath, entry.name, packageName),
              ];

              for (const pkgPath of possiblePaths) {
                if (
                  await access(pkgPath)
                    .then(() => true)
                    .catch(() => false)
                ) {
                  return pkgPath;
                }
              }
            }
          }
        }

        // Also check root node_modules (for workspace setups)
        const rootNodeModules = path.join(root, "..", "..", "node_modules");
        if (
          await access(rootNodeModules)
            .then(() => true)
            .catch(() => false)
        ) {
          const rootPnpmPath = path.join(rootNodeModules, ".pnpm");
          if (
            await access(rootPnpmPath)
              .then(() => true)
              .catch(() => false)
          ) {
            const pnpmEntries = await readdir(rootPnpmPath, {
              withFileTypes: true,
            });
            for (const entry of pnpmEntries) {
              const matchPattern = versionHint
                ? `${packageName}@${versionHint}`
                : `${packageName}@`;
              if (entry.isDirectory() && entry.name.includes(matchPattern)) {
                const pkgPath = path.join(
                  rootPnpmPath,
                  entry.name,
                  "node_modules",
                  packageName
                );
                if (
                  await access(pkgPath)
                    .then(() => true)
                    .catch(() => false)
                ) {
                  return pkgPath;
                }
              }
            }
          }
        }

        return null;
      } catch (err) {
        return null;
      }
    },
  ];

  for (const strategy of strategies) {
    const result = await strategy();
    if (result) {
      return result;
    }
  }

  return null;
}

// Copy css-tree data files
try {
  const cssTreePath = await findPackage("css-tree", "3.1.0");

  if (cssTreePath) {
    const cssTreeDataSrc = path.join(cssTreePath, "data");
    if (
      await access(cssTreeDataSrc)
        .then(() => true)
        .catch(() => false)
    ) {
      // Put data one level up from .bundle so ../data works from index.js
      const cssTreeDataDest = path.join(root, "..", "data");

      await rm(cssTreeDataDest, { recursive: true, force: true });
      await mkdir(path.dirname(cssTreeDataDest), { recursive: true });
      await cp(cssTreeDataSrc, cssTreeDataDest, { recursive: true });
      console.log(`Copied: ${cssTreeDataSrc} -> ${cssTreeDataDest}`);
    }
  } else {
    console.warn(`Warning: Could not find css-tree package`);
  }
} catch (err) {
  console.warn(`Warning: Error copying css-tree data: ${err.message}`);
}

// Copy mdn-data package (required by css-tree)
// The bundled code expects mdn-data/css/*.json files to be available
// We need to make mdn-data available as a module
try {
  const mdnDataPath = await findPackage("mdn-data", "2.0.30");

  if (mdnDataPath) {
    // Create node_modules structure in the data directory so mdn-data can be resolved
    // The bundled code uses require('mdn-data/css/at-rules.json')
    // We'll put mdn-data in a node_modules-like structure
    const mdnDataDest = path.join(
      root,
      "..",
      "data",
      "node_modules",
      "mdn-data"
    );

    await rm(mdnDataDest, { recursive: true, force: true });
    await mkdir(path.dirname(mdnDataDest), { recursive: true });
    await cp(mdnDataPath, mdnDataDest, { recursive: true });
    console.log(`Copied: ${mdnDataPath} -> ${mdnDataDest}`);
  } else {
    console.warn(`Warning: Could not find mdn-data package`);
  }
} catch (err) {
  console.warn(`Warning: Error copying mdn-data: ${err.message}`);
}
