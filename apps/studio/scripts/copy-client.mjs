import { cp, rm, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const root = path.resolve(__dirname, "..");

const src = path.join(root, "dist", "client");
const dest = path.join(root, ".bundle", "client");

await rm(dest, { recursive: true, force: true });
await mkdir(path.dirname(dest), { recursive: true });
await cp(src, dest, { recursive: true });

console.log(`Copied: ${src} -> ${dest}`);
