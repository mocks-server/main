const fsExtra = require("fs-extra");

function mocksFileToUse(mocksFileJs, mocksFileJson) {
  if (fsExtra.existsSync(mocksFileJs)) {
    return mocksFileJs;
  }
  if (fsExtra.existsSync(mocksFileJson)) {
    return mocksFileJson;
  }
  return null;
}

module.exports = {
  mocksFileToUse,
};
