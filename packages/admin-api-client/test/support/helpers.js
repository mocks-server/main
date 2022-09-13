const waitOn = require("wait-on");
const path = require("path");
const fsExtra = require("fs-extra");

import Spawn from "./Spawn";

const TEMP_FOLDER = path.resolve(__dirname, "temp");

const tempPath = (folderName) => {
  return path.resolve(TEMP_FOLDER, folderName);
};

const certFile = tempPath("localhost.cert");
const keyFile = tempPath("localhost.key");

const wait = (time = 1000) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

const waitForServer = (port) => {
  return waitOn({ resources: [`tcp:127.0.0.1:${port}`] });
};

const spawn = (args = [], options = {}) => {
  return new Spawn(args, {
    cwd: TEMP_FOLDER,
    ...options,
  });
};

const removeFile = (file) => {
  if (fsExtra.existsSync(file)) {
    fsExtra.removeSync(file);
  }
};

const removeCertFiles = () => {
  removeFile(certFile);
  removeFile(keyFile);
};

const createCertFiles = async () => {
  const generator = spawn([
    "openssl",
    "req",
    "-newkey",
    "rsa:4096",
    "-days",
    "1",
    "-nodes",
    "-x509",
    "-subj",
    "/C=US/ST=Denial/L=Springfield/O=Dis/CN=localhost",
    "-keyout",
    "localhost.key",
    "-out",
    "localhost.cert",
  ]);
  await generator.hasExited();
};

module.exports = {
  wait,
  waitForServer,
  spawn,
  removeCertFiles,
  createCertFiles,
  certFile,
  keyFile,
};
