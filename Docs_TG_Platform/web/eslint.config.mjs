import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { FlatCompat } from "@eslint/eslintrc";
import boundaries from "eslint-plugin-boundaries";

const __dirname = dirname(fileURLToPath(import.meta.url));

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const fsdLayers = ["app", "screens", "widgets", "features", "entities", "shared"];

/** @type {import("eslint").Linter.Config[]} */
const config = [
  ...compat.extends("next/core-web-vitals"),
  {
    plugins: { boundaries },
    settings: {
      "boundaries/root-path": __dirname,
      "boundaries/elements": [
        { type: "shared", pattern: "src/shared/*", mode: "folder", capture: ["slice"] },
        { type: "entities", pattern: "src/entities/*", mode: "folder", capture: ["slice"] },
        { type: "features", pattern: "src/features/*", mode: "folder", capture: ["slice"] },
        { type: "widgets", pattern: "src/widgets/*", mode: "folder", capture: ["slice"] },
        { type: "screens", pattern: "src/screens/*", mode: "folder", capture: ["slice"] },
        { type: "app", pattern: "src/app", mode: "folder" },
      ],
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
      },
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          message:
            "{{from.type}} cannot import {{to.type}} (FSD: import only downward; app store is an exception)",
          rules: [
            { from: { type: "app" }, allow: { to: { type: fsdLayers } } },
            {
              from: { type: "screens" },
              allow: { to: { type: ["widgets", "features", "entities", "shared", "app"] } },
            },
            {
              from: { type: "widgets" },
              allow: { to: { type: ["features", "entities", "shared", "app"] } },
            },
            {
              from: { type: "features" },
              allow: { to: { type: ["entities", "shared", "app"] } },
            },
            { from: { type: "entities" }, allow: { to: { type: "shared" } } },
            { from: { type: "shared" }, allow: { to: { type: "shared" } } },
            { from: { type: "screens" }, allow: { to: { type: "screens" } } },
            { from: { type: "widgets" }, allow: { to: { type: "widgets" } } },
            { from: { type: "features" }, allow: { to: { type: "features" } } },
            { from: { type: "entities" }, allow: { to: { type: "entities" } } },
            { allow: { dependency: { relationship: { to: "internal" } } } },
          ],
        },
      ],
      "boundaries/no-unknown": "off",
      "boundaries/no-unknown-files": "off",
    },
  },
];

export default config;
