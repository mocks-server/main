/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const path = require("path");

const fsExtra = require("fs-extra");
const deepMerge = require("deepmerge");
const crossFetch = require("cross-fetch");
const waitOn = require("wait-on");

const Core = require("@mocks-server/core");

const Spawn = require("./Spawn");
const AdminApiPlugin = require("../../index");

const SERVER_PORT = 3100;
const API_SERVER_PORT = 3110;

const defaultOptions = {
  server: {
    port: SERVER_PORT,
  },
  log: "silent",
  files: {
    watch: false,
  },
};

const defaultRequestOptions = {
  method: "get",
  headers: {
    "Content-Type": "application/json",
  },
};

const FIXTURES_PATH = path.resolve(__dirname, "..", "fixtures");

const fixturesFolder = (folderName) => {
  return path.resolve(FIXTURES_PATH, folderName);
};

const certFile = fixturesFolder("localhost.cert");
const keyFile = fixturesFolder("localhost.key");

const createCore = () => {
  return new Core({
    config: {
      allowUnknownArguments: true,
      readFile: false,
      readArguments: false,
      readEnvironment: false,
    },
    plugins: {
      register: [AdminApiPlugin],
    },
  });
};

const startExistingCore = (core, mocksPath, options = {}) => {
  const mocks = mocksPath || "web-tutorial";
  return core
    .init(
      deepMerge.all([
        defaultOptions,
        {
          files: {
            path: fixturesFolder(mocks),
          },
        },
        options,
      ])
    )
    .then(() => {
      return core.start().then(() => {
        return Promise.resolve(core);
      });
    });
};

const startServer = (mocksPath, options = {}) => {
  return startExistingCore(createCore(), mocksPath, options);
};

const serverUrl = (port, protocol) => {
  const protocolToUse = protocol || "http";
  return `${protocolToUse}://127.0.0.1:${port || SERVER_PORT}`;
};

const doFetch = (uri, options = {}) => {
  const requestOptions = {
    ...defaultRequestOptions,
    ...options,
  };
  if (requestOptions.body) {
    requestOptions.body = JSON.stringify(requestOptions.body);
  }

  return crossFetch(`${serverUrl(options.port, options.protocol)}${uri}`, {
    ...requestOptions,
  }).then((res) => {
    return res
      .json()
      .then((processedRes) => ({
        body: processedRes,
        status: res.status,
        headers: res.headers,
        url: res.url,
      }))
      .catch(() => {
        return { status: res.status, headers: res.headers, url: res.url };
      });
  });
};

const doServerFetch = (uri, options = {}) => {
  return doFetch(`${uri}`, {
    port: API_SERVER_PORT,
    ...options,
  });
};

const doApiFetch = (uri, options) => {
  return doServerFetch(`/api${uri}`, options);
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

const waitForServerUrl = (url, options = {}) => {
  return waitOn({ resources: [`${serverUrl(options.port, options.protocol)}${url}`] });
};

const findAlert = (alertContextFragment, alerts) => {
  return alerts.find((alert) => alert.context.includes(alertContextFragment));
};

const findTrace = (traceFragment, traces) => {
  return traces.find((trace) => trace.includes(traceFragment));
};

const spawn = (args = [], options = {}) => {
  return new Spawn(args, {
    cwd: FIXTURES_PATH,
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

module.exports = {
  certFile,
  keyFile,
  removeCertFiles,
  createCore,
  startExistingCore,
  startServer,
  doFetch,
  doServerFetch,
  doApiFetch,
  TimeCounter,
  wait,
  waitForServer,
  waitForServerUrl,
  fixturesFolder,
  findAlert,
  findTrace,
  spawn,
};
