import boundaries from "eslint-plugin-boundaries";
import tsParser from "@typescript-eslint/parser";
import nextPlugin from "@next/eslint-plugin-next";
import reactHooksPlugin from "eslint-plugin-react-hooks";

const fsdSliceTypes = ["screens", "widgets", "features", "entities"];

/** Warn on cross-slice imports that bypass index.ts public API. */
export default [
  {
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
        project: "./tsconfig.json",
      },
    },
    linterOptions: {
      reportUnusedDisableDirectives: false,
    },
    plugins: {
      boundaries,
      "@next/next": nextPlugin,
      "react-hooks": reactHooksPlugin,
    },
    settings: {
      "boundaries/root-path": import.meta.dirname,
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
      "@next/next/no-img-element": "off",
      "react-hooks/exhaustive-deps": "off",
      "boundaries/dependencies": [
        "warn",
        {
          default: "allow",
          message: "Import {{to.type}}/{{to.captured.slice}} via public API (index.ts)",
          rules: [
            { allow: { dependency: { relationship: { to: "internal" } } } },
            {
              from: { captured: { slice: "{{to.captured.slice}}" } },
              allow: { to: { type: fsdSliceTypes } },
            },
            {
              to: { type: fsdSliceTypes, internalPath: "!index.ts" },
              disallow: { from: { type: "*" } },
            },
          ],
        },
      ],
      "boundaries/no-unknown": "off",
      "boundaries/no-unknown-files": "off",
    },
  },
];
