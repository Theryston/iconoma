import path from "path";
import { fileURLToPath } from "url";
import childProcess from "child_process";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const originalBundlePath = path.join(
  __dirname,
  "..",
  "..",
  "..",
  "apps/studio/.bundle"
);

if (!fs.existsSync(originalBundlePath)) {
  childProcess.execSync(`pnpm run build`, {
    cwd: path.join(__dirname, "..", "..", "..", "apps/studio"),
    stdio: "inherit",
  });
}

const targetBundlePath = path.join(__dirname, "..", "dist/studio");

fs.mkdirSync(targetBundlePath, { recursive: true });

fs.cpSync(originalBundlePath, targetBundlePath, { recursive: true });

// Copy data directory if it exists (required by css-tree in the bundle)
// The bundled code expects ../data/patch.json relative to index.js
// So from packages/cli/dist/studio/index.js, it needs packages/cli/dist/data/
const dataSrcPath = path.join(
  __dirname,
  "..",
  "..",
  "..",
  "apps/studio/../data"
);
const dataDestPath = path.join(__dirname, "..", "dist/data");

if (fs.existsSync(dataSrcPath)) {
  fs.mkdirSync(path.dirname(dataDestPath), { recursive: true });
  fs.cpSync(dataSrcPath, dataDestPath, { recursive: true });
  console.log(`Copied data directory: ${dataSrcPath} -> ${dataDestPath}`);

  // Also copy mdn-data to a location where it can be resolved as a module
  // The bundled code requires 'mdn-data/css/at-rules.json' etc.
  // Node.js will look for it in node_modules relative to the bundle
  const mdnDataSrc = path.join(dataSrcPath, "node_modules", "mdn-data");
  const mdnDataDest = path.join(
    __dirname,
    "..",
    "dist",
    "node_modules",
    "mdn-data"
  );

  if (fs.existsSync(mdnDataSrc)) {
    fs.mkdirSync(path.dirname(mdnDataDest), { recursive: true });
    fs.cpSync(mdnDataSrc, mdnDataDest, { recursive: true });
    console.log(`Copied mdn-data: ${mdnDataSrc} -> ${mdnDataDest}`);
  }

  // Copy css-tree package.json - the bundled code requires ../package.json
  // Since bundle is at packages/cli/dist/studio/index.js, it needs packages/cli/dist/package.json
  // This is for css-tree to read its version
  const rootPath = path.join(__dirname, "..", "..", "..");
  const cssTreePackageJsonDest = path.join(
    __dirname,
    "..",
    "dist",
    "package.json"
  );

  // Try to find css-tree package.json in various locations
  const possiblePaths = [
    path.join(
      rootPath,
      "node_modules",
      ".pnpm",
      "css-tree@3.1.0",
      "node_modules",
      "css-tree",
      "package.json"
    ),
    path.join(rootPath, "node_modules", "css-tree", "package.json"),
    path.join(
      rootPath,
      "apps",
      "studio",
      "node_modules",
      ".pnpm",
      "css-tree@3.1.0",
      "node_modules",
      "css-tree",
      "package.json"
    ),
    path.join(
      rootPath,
      "apps",
      "studio",
      "node_modules",
      "css-tree",
      "package.json"
    ),
  ];

  for (const cssTreePkgPath of possiblePaths) {
    if (fs.existsSync(cssTreePkgPath)) {
      fs.copyFileSync(cssTreePkgPath, cssTreePackageJsonDest);
      console.log(
        `Copied css-tree package.json: ${cssTreePkgPath} -> ${cssTreePackageJsonDest}`
      );
      break;
    }
  }
}
