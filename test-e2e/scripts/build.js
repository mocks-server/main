const fs = require("fs");
const path = require("path");

const MAIN_FILE = "main.js";

function appPath(filePath) {
  return path.resolve(__dirname, "..", "app", filePath);
}

function appPublicPath(filePath) {
  return path.resolve(appPath("public"), filePath);
}

function port() {
  return process.argv[2];
}

function readJsFile() {
  return new Promise((resolve, reject) => {
    fs.readFile(appPath(MAIN_FILE), "utf8", (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data.replace('PORT = ""', `PORT = "${port()}"`));
      }
    });
  });
}

function writeJsFile(fileContent) {
  return new Promise((resolve, reject) => {
    fs.writeFile(appPublicPath(MAIN_FILE), fileContent, "utf8", (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

readJsFile().then((fileContent) => {
  return writeJsFile(fileContent);
});
