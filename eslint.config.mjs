import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      // Allow explicit any in specific cases (disable warning)
      "@typescript-eslint/no-explicit-any": "warn",
      // Allow unused variables starting with underscore
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      // Prefer const over let when not reassigned
      "prefer-const": "error",
      // No console in production code (warn only)
      "no-console": ["warn", { allow: ["warn", "error"] }],
    },
  },
  {
    ignores: [
      "node_modules/",
      ".next/",
      "out/",
      "coverage/",
      "*.config.js",
      "*.config.mjs",
    ],
  },
];

export default eslintConfig;
