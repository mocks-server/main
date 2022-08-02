import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";

const BASE_CONFIG = {
  input: "src/index.ts",
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
