#!/usr/bin/env node
/**
 * Summarize eslint.fsd-public-api.config.mjs output (JSON).
 * Usage: eslint ... --format json | node scripts/fsd-public-api-report.mjs
 */

const chunks = [];
for await (const chunk of process.stdin) chunks.push(chunk);
const raw = Buffer.concat(chunks).toString("utf8").trim();
if (!raw) {
  console.log("No ESLint output.");
  process.exit(0);
}

/** @type {Array<{ filePath: string, messages: Array<{ ruleId: string, message: string }> }>} */
const results = JSON.parse(raw);
const warnings = results.flatMap((file) =>
  file.messages
    .filter((m) => m.ruleId === "boundaries/dependencies" && m.severity === 1)
    .map((m) => ({ file: file.filePath.replace(/^.*\/web\//, ""), message: m.message })),
);

if (warnings.length === 0) {
  console.log("✓ No public API violations.");
  process.exit(0);
}

const byTarget = new Map();
const byFile = new Map();

for (const { file, message } of warnings) {
  const target = message.replace(/^Import (.+) via public API.*/, "$1");
  byTarget.set(target, (byTarget.get(target) ?? 0) + 1);
  byFile.set(file, (byFile.get(file) ?? 0) + 1);
}

const sortDesc = (map) => [...map.entries()].sort((a, b) => b[1] - a[1]);

console.log(`\nPublic API violations: ${warnings.length} warnings\n`);

console.log("By target slice:");
for (const [target, count] of sortDesc(byTarget)) {
  console.log(`  ${String(count).padStart(3)}  ${target}`);
}

console.log("\nTop source files:");
for (const [file, count] of sortDesc(byFile).slice(0, 15)) {
  console.log(`  ${String(count).padStart(3)}  ${file}`);
}

console.log("");
