/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const uglifier = require("rollup-plugin-uglify");
const commonjs = require("rollup-plugin-commonjs");
const resolve = require("rollup-plugin-node-resolve");
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
      name: "pluginAdminApiPaths"
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
