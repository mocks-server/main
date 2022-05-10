/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/
const path = require("path");

const deepMerge = require("deepmerge");
const crossFetch = require("cross-fetch");
const waitOn = require("wait-on");

const Core = require("@mocks-server/core");
const CliRunner = require("@mocks-server/cli-runner");

const SERVER_PORT = 3100;
const DEFAULT_BINARY_PATH = "./starter";
const FIXTURES_PATH = path.resolve(__dirname, "..", "fixtures");

const defaultOptions = {
  log: "silent",
  server: {
    port: SERVER_PORT,
  },
  plugins: {
    filesLoader: {
      watch: false,
    },
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

const startExistingCore = (core, mocksPath, options = {}) => {
  const mocks = mocksPath || "web-tutorial";
  return core
    .init(
      deepMerge.all([
        defaultOptions,
        {
          plugins: {
            filesLoader: {
              ...defaultOptions.plugins.filesLoader,
              path: fixturesFolder(mocks),
            },
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

const startCore = (mocksPath, options = {}) => {
  return startExistingCore(createCore(options), mocksPath, options);
};

const serverUrl = (port) => {
  return `http://127.0.0.1:${port || SERVER_PORT}`;
};

const fetch = (uri, options = {}) => {
  const requestOptions = {
    ...defaultRequestOptions,
    ...options,
  };

  return crossFetch(`${serverUrl(options.port)}${uri}`, {
    ...requestOptions,
  }).then((res) => {
    return res
      .json()
      .then((processedRes) => ({ body: processedRes, status: res.status, headers: res.headers }))
      .catch(() => ({ body: null, status: res.status, headers: res.headers }));
  });
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

const mocksRunner = (args = [], options = {}) => {
  const argsToSend = [...args];
  argsToSend.unshift(DEFAULT_BINARY_PATH);
  return new CliRunner(argsToSend, {
    cwd: FIXTURES_PATH,
    ...options,
  });
};

const filterAlerts = (alertContextFragment, alerts) => {
  return alerts.filter((alert) => alert.context.includes(alertContextFragment));
};

const findAlert = (alertContextFragment, alerts) => {
  return alerts.find((alert) => alert.context.includes(alertContextFragment));
};

const findTrace = (traceFragment, traces) => {
  return traces.find((trace) => trace.includes(traceFragment));
};

module.exports = {
  createCore,
  startExistingCore,
  startCore,
  fetch,
  TimeCounter,
  mocksRunner,
  wait,
  waitForServer,
  waitForServerUrl,
  fixturesFolder,
  filterAlerts,
  findAlert,
  findTrace,
};
