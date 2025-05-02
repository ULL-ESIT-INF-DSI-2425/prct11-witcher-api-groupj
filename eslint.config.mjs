import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier";
import tsdoc from "eslint-plugin-tsdoc";


/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,ts}"] },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  eslintConfigPrettier,
  {
    plugins:
    {
      tsdoc
    }
  },
  { ignores: [
    "eslint.config.mjs",
    "dist/*",
    "docs/*"
  ] },
  {
    rules: {
      "prefer-const": "off", // Desactiva la sugerencia de usar 'const'
      "tsdoc/syntax": "warn"
    }
  }
];
