const uglifier = require("rollup-plugin-uglify");
const commonjs = require("@rollup/plugin-commonjs");
const resolve = require("@rollup/plugin-node-resolve");
const babel = require("rollup-plugin-babel");

const BASE_CONFIG = {
  input: "index.js"
};

const BASE_PLUGINS = [
  resolve({
    mainFields: ["module", "main"],
    browser: true,
    preferBuiltins: true
  }),
  commonjs(),
  babel({
    babelrc: false,
    presets: ["@babel/env"]
  })
];

module.exports = [
  {
    ...BASE_CONFIG,
    output: {
      file: "dist/index.cjs.js",
      format: "cjs"
    },
    plugins: BASE_PLUGINS
  },
  {
    ...BASE_CONFIG,
    output: {
      file: "dist/index.umd.js",
      format: "umd",
      name: "mocksServerAdminApiClient"
    },
    plugins: [...BASE_PLUGINS, uglifier.uglify()]
  },
  {
    ...BASE_CONFIG,
    output: {
      file: "dist/index.esm.js",
      format: "esm"
    },
    plugins: BASE_PLUGINS
  }
];
