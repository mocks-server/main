const path = require("path");
const fsExtra = require("fs-extra");

const libPath = path.resolve(__dirname, "..", "..", "..", "..", "dist", "index.umd.js");
const publicJsPath = path.resolve(__dirname, "..", "public", "js");

const copyLib = () => {
  return fsExtra.copy(libPath, path.resolve(publicJsPath, "admin-api-client.js"));
};

copyLib();
