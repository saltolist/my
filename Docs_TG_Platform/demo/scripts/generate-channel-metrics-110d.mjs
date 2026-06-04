/**
 * Генерирует demo/data/channelMetrics110d.json — 110 дней дельт по метрикам канала.
 * startTotals — накопленное на начало окна (канал ~200 подписчиков уже с историей постов).
 * Запуск: node scripts/generate-channel-metrics-110d.mjs
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../data/channelMetrics110d.json");

const DAY_COUNT = 110;

/** Накопленные значения на день 0 (до массива days). */
const startTotals = {
  subscribers: 200,
  reactions: 418,
  views: 12400,
  comments: 31,
  reposts: 12,
  er: 2.8,
};

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
  if (value <= 0) return value;
  if (rand() < chance) return -Math.abs(Math.round(value * (0.15 + rand() * 0.85)));
  return value;
}

const days = [];
let erLevel = startTotals.er;

for (let d = 0; d < DAY_COUNT; d++) {
  const t = d / (DAY_COUNT - 1);
  const wave = Math.sin(d / 9) * 0.35 + Math.sin(d / 23) * 0.25;
  const growthPhase = 0.55 + t * 1.15 + wave * 0.2;
  /** В начале периода реже отрицательные дни — база уже ненулевая. */
  const negScale = d < 20 ? 0.55 : 1;

  const subscribers = maybeNegative(
    Math.round((4 + t * 78 + randn() * 18) * growthPhase),
    0.1 * negScale,
  );

  const reactions = maybeNegative(
    Math.round((5 + t * 20 + randn() * 12) * growthPhase * (0.85 + rand() * 0.35)),
    0.14 * negScale,
  );

  const views = maybeNegative(
    Math.round((35 + t * 380 + randn() * 110) * growthPhase * (0.7 + rand() * 0.6)),
    0.1 * negScale,
  );

  const comments = maybeNegative(
    Math.round((0.15 + t * 2.2 + rand() * 2.5) * growthPhase),
    0.18 * negScale,
  );

  const reposts = maybeNegative(
    Math.round((0.08 + t * 1.05 + rand() * 1.8) * growthPhase),
    0.16 * negScale,
  );

  erLevel += randn() * 0.09 + t * 0.011 + (rand() < 0.1 * negScale ? -0.28 : 0);
  erLevel = Math.min(6.5, Math.max(1.6, erLevel));

  days.push({
    subscribers,
    reactions,
    views,
    comments,
    reposts,
    er: Math.round(erLevel * 10) / 10,
  });
}

const endTotals = { ...startTotals };
for (const day of days) {
  endTotals.subscribers += day.subscribers;
  endTotals.reactions += day.reactions;
  endTotals.views += day.views;
  endTotals.comments += day.comments;
  endTotals.reposts += day.reposts;
  endTotals.er = day.er;
}

const payload = {
  version: 1,
  dayCount: DAY_COUNT,
  startTotals,
  endTotals,
  days,
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
console.log(`Wrote ${OUT}`);
console.log("Start totals:", startTotals);
console.log("End totals:", endTotals);
