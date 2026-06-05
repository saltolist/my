import boundaries from "eslint-plugin-boundaries";

/** Warn on cross-slice imports that bypass index.ts public API. */
export default [
  {
    plugins: { boundaries },
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
      "boundaries/dependencies": [
        "warn",
        {
          default: "allow",
          message: "Import {{to.type}}/{{to.captured.slice}} via public API (index.ts)",
          rules: [
            { allow: { dependency: { relationship: { to: "internal" } } } },
            {
              to: { type: ["screens", "widgets", "features", "entities"], internalPath: "!index.ts" },
              disallow: { dependency: { relationship: { to: ["sibling", "parent", "ancestor"] } } },
            },
          ],
        },
      ],
    },
  },
];
