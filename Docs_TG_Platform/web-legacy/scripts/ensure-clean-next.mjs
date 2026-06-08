import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const nextDir = join(root, ".next");
const shellPage = join(nextDir, "server/app/(shell)/page.js");

if (existsSync(nextDir) && !existsSync(shellPage)) {
  console.warn("[dev] Corrupted .next cache (missing shell page) — removing…");
  rmSync(nextDir, { recursive: true, force: true });
}
