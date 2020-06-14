import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";

const BASE_CONFIG = {
  input: "index.js",
};

const BASE_PLUGINS = [
  resolve({
    mainFields: ["module", "main"],
    browser: true,
    preferBuiltins: true,
  }),
  commonjs(),
  babel({
    babelrc: false,
    presets: ["@babel/env"],
  }),
];

module.exports = [
  {
    ...BASE_CONFIG,
    output: {
      file: "dist/index.cjs.js",
      format: "cjs",
    },
    plugins: BASE_PLUGINS,
  },
  {
    ...BASE_CONFIG,
    output: {
      file: "dist/index.umd.js",
      format: "umd",
      name: "pluginAdminApiPaths",
    },
    plugins: [...BASE_PLUGINS, terser()],
  },
  {
    ...BASE_CONFIG,
    output: {
      file: "dist/index.esm.js",
      format: "esm",
    },
    plugins: BASE_PLUGINS,
  },
];
