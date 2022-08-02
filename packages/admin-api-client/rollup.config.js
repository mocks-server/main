import typescript from "@rollup/plugin-typescript";
import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import babel from "@rollup/plugin-babel";
import { terser } from "rollup-plugin-terser";

const BASE_CONFIG = {
  input: "src/index.ts",
  external: ["cross-fetch", "@mocks-server/admin-api-paths"],
};

const GLOBALS = {
  "@mocks-server/admin-api-paths": "pluginAdminApiPaths",
};

const BASE_PLUGINS = [
  typescript({
    compilerOptions: {
      declaration: false,
    },
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
    input: "src/index.ts",
    external: ["@mocks-server/admin-api-paths"],
    output: {
      file: "dist/index.umd.js",
      format: "umd",
      name: "mocksServerAdminApiClient",
      globals: {
        "@mocks-server/admin-api-paths": "pluginAdminApiPaths",
      },
    },
    plugins: [
      typescript({
        compilerOptions: {
          declaration: false,
        },
      }),
      resolve({
        mainFields: ["module", "main", "jsnext"],
        browser: true,
        preferBuiltins: true,
      }),
      commonjs({
        include: [/node_modules/],
      }),
      babel({
        babelHelpers: "bundled",
        babelrc: false,
        presets: ["@babel/env"],
      }),
      terser(),
    ],
  },
  {
    ...BASE_CONFIG,
    output: {
      file: "dist/index.esm.js",
      format: "esm",
      globals: GLOBALS,
    },
    plugins: BASE_PLUGINS,
  },
];
