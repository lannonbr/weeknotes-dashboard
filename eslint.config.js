import globals from "globals";
import pluginJs from "@eslint/js";
import { globalIgnores } from "eslint/config";
import e18e from "@e18e/eslint-plugin";

export default [
  {
    files: ["statics/js/**/*.js"],
    languageOptions: {
      globals: globals.browser,
    },
  },
  { languageOptions: { globals: globals.node } },
  pluginJs.configs.recommended,
  e18e.configs.recommended,
  globalIgnores(["public/"]),
];
