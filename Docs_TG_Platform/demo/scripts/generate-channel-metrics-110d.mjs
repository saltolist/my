/**
 * Генерирует demo/data/channelMetrics110d.json — 110 дней дельт по метрикам канала.
 * Запуск: node scripts/generate-channel-metrics-110d.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../data/channelMetrics110d.json");

const DAY_COUNT = 110;

function mulberry32(seed) {
  return function next() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rand = mulberry32(20260214);
const randn = () => rand() * 2 - 1;

function maybeNegative(value, chance = 0.14) {
  if (rand() < chance) return -Math.abs(Math.round(value * (0.15 + rand() * 0.85)));
  return value;
}

const days = [];
let erLevel = 2.2;

for (let d = 0; d < DAY_COUNT; d++) {
  const t = d / (DAY_COUNT - 1);
  const wave = Math.sin(d / 9) * 0.35 + Math.sin(d / 23) * 0.25;
  const growthPhase = 0.55 + t * 1.15 + wave * 0.2;

  const subscribers = maybeNegative(
    Math.round((4 + t * 78 + randn() * 18) * growthPhase),
    0.1,
  );

  const reactions = maybeNegative(
    Math.round((6 + t * 22 + randn() * 14) * growthPhase * (0.85 + rand() * 0.35)),
    0.16,
  );

  const views = maybeNegative(
    Math.round((40 + t * 420 + randn() * 120) * growthPhase * (0.7 + rand() * 0.6)),
    0.12,
  );

  const comments = maybeNegative(
    Math.round((0 + t * 2.4 + rand() * 3) * growthPhase + (rand() < 0.08 ? -1 : 0)),
    0.2,
  );

  const reposts = maybeNegative(
    Math.round((0 + t * 1.1 + rand() * 2) * growthPhase),
    0.18,
  );

  erLevel += randn() * 0.09 + t * 0.012 + (rand() < 0.11 ? -0.35 : 0);
  erLevel = Math.min(6.8, Math.max(1.4, erLevel));

  days.push({
    subscribers,
    reactions,
    views,
    comments,
    reposts,
    er: Math.round(erLevel * 10) / 10,
  });
}

const startTotals = {
  subscribers: 200,
  reactions: 0,
  views: 0,
  comments: 0,
  reposts: 0,
  er: 2.2,
};

const cumulative = { ...startTotals };
for (const day of days) {
  cumulative.subscribers += day.subscribers;
  cumulative.reactions += day.reactions;
  cumulative.views += day.views;
  cumulative.comments += day.comments;
  cumulative.reposts += day.reposts;
  cumulative.er = day.er;
}

const payload = {
  version: 1,
  dayCount: DAY_COUNT,
  startTotals,
  endTotals: cumulative,
  days,
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log(`Wrote ${OUT}`);
console.log("End totals:", cumulative);
