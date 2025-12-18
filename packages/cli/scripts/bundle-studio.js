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
