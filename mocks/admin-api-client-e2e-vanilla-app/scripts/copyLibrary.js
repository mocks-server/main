const path = require("path");
const fsExtra = require("fs-extra");

const libPath = path.resolve(
  __dirname,
  "..",
  "..",
  "..",
  "packages",
  "admin-api-client",
  "dist",
  "index.umd.js"
);
const publicJsPath = path.resolve(__dirname, "..", "public", "js");

const adminApiPathsLib = path.resolve(
  __dirname,
  "..",
  "..",
  "..",
  "packages",
  "admin-api-paths",
  "dist",
  "index.umd.js"
);

const copyLib = () => {
  return Promise.all([
    fsExtra.copy(libPath, path.resolve(publicJsPath, "admin-api-client.js")),
    fsExtra.copy(adminApiPathsLib, path.resolve(publicJsPath, "admin-api-paths.js")),
  ]);
};

copyLib();
