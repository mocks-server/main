const path = require("path");
const fsExtra = require("fs-extra");

const libPath = path.resolve(
  __dirname,
  "..",
  "..",
  "..",
  "packages",
  "admin-api-client-data-provider",
  "dist",
  "index.umd.js"
);
const publicJsPath = path.resolve(__dirname, "..", "public", "js");

const copyLib = () => {
  return fsExtra.copy(libPath, path.resolve(publicJsPath, "admin-api-client.js"));
};

copyLib();
