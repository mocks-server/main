/*
Copyright 2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/
const path = require("path");

const deepMerge = require("deepmerge");
const crossFetch = require("cross-fetch");
const waitOn = require("wait-on");
const fsExtra = require("fs-extra");

const { Core } = require("../../../src/index");

const SERVER_PORT = 3100;
const FIXTURES_PATH = path.resolve(__dirname, "..", "fixtures");
const CONFIG_FILE = path.resolve(FIXTURES_PATH, "mocks.config.js");
const CERT_FILE = path.resolve(FIXTURES_PATH, "localhost.cert");
const KEY_FILE = path.resolve(FIXTURES_PATH, "localhost.key");

const defaultOptions = {
  log: "silent",
  server: {
    port: SERVER_PORT,
  },
  files: {
    watch: false,
  },
};

const defaultRequestOptions = {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
};

const fixturesFolder = (folderName) => {
  return path.resolve(__dirname, "..", "fixtures", folderName);
};

const createCore = (options = {}) => {
  return new Core(
    deepMerge.all([
      {
        config: {
          readFile: false,
          readArguments: false,
          readEnvironment: false,
        },
      },
      options,
    ])
  );
};

const startCore = async (mocksPath, options = {}) => {
  const mocks = mocksPath || "web-tutorial";
  const core = createCore(
    deepMerge.all([
      options,
      {
        files: {
          ...defaultOptions.files,
          path: fixturesFolder(mocks),
        },
      },
    ])
  );
  await core.start();
  return core;
};

const serverUrl = (port, protocol) => {
  const protocolToUse = protocol || "http";
  return `${protocolToUse}://127.0.0.1:${port || SERVER_PORT}`;
};

const doFetchAndParse = (uri, options = {}, parser = "json") => {
  const requestOptions = {
    ...defaultRequestOptions,
    ...options,
  };

  return crossFetch(`${serverUrl(options.port, options.protocol)}${uri}`, {
    ...requestOptions,
  }).then((res) => {
    return res[parser]()
      .then((processedRes) => ({ body: processedRes, status: res.status, headers: res.headers }))
      .catch(() => ({ body: null, status: res.status, headers: res.headers }));
  });
};

const doFetch = (uri, options) => {
  return doFetchAndParse(uri, options, "json");
};

const doTextFetch = (uri, options = {}) => {
  return doFetchAndParse(uri, options, "text");
};

class TimeCounter {
  constructor() {
    this._startTime = new Date();
  }

  _getMiliseconds() {
    this._miliseconds = this._endTime - this._startTime;
  }

  get total() {
    return this._miliseconds;
  }

  stop() {
    this._endTime = new Date();
    this._getMiliseconds();
  }
}

const wait = (time = 1000) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

const waitForServer = (port) => {
  return waitOn({ resources: [`tcp:127.0.0.1:${port || SERVER_PORT}`] });
};

const waitForServerUrl = (url) => {
  return waitOn({ resources: [`${serverUrl()}${url}`] });
};

const filterAlerts = (alertContextFragment, alerts) => {
  return alerts.filter((alert) => alert.id.includes(alertContextFragment));
};

const findAlert = (alertContextFragment, alerts) => {
  return alerts.find((alert) => alert.id.includes(alertContextFragment));
};

const findTrace = (traceFragment, traces) => {
  return traces.find((trace) => trace.includes(traceFragment));
};

const removeFile = (file) => {
  if (fsExtra.existsSync(file)) {
    fsExtra.removeSync(file);
  }
};

const removeConfigFile = () => {
  removeFile(CONFIG_FILE);
};

const removeCertFiles = () => {
  removeFile(CERT_FILE);
  removeFile(KEY_FILE);
};

const removeNewLines = (str) => {
  return str.replace(/(\r\n|\n|\r)/gm, "");
};

module.exports = {
  createCore,
  startCore,
  doFetch,
  doTextFetch,
  TimeCounter,
  wait,
  waitForServer,
  waitForServerUrl,
  fixturesFolder,
  filterAlerts,
  findAlert,
  findTrace,
  removeConfigFile,
  removeCertFiles,
  removeNewLines,
};
