/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const path = require("path");

const crossFetch = require("cross-fetch");
const waitOn = require("wait-on");

const { Core } = require("@mocks-server/core");
const AdminApiPlugin = require("../../../index");

const SERVER_PORT = 3100;

const defaultOptions = {
  port: SERVER_PORT,
  log: "silent",
  watch: false,
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

const createCore = () => {
  return new Core({
    onlyProgrammaticOptions: true,
    plugins: [AdminApiPlugin],
  });
};

const startExistingCore = (core, mocksPath, options = {}) => {
  const mocks = mocksPath || "web-tutorial";
  return core
    .init({
      ...defaultOptions,
      path: fixturesFolder(mocks),
      ...options,
    })
    .then(() => {
      return core.start().then(() => {
        return Promise.resolve(core);
      });
    });
};

const startServer = (mocksPath, options = {}) => {
  return startExistingCore(createCore(), mocksPath, options);
};

const serverUrl = (port) => {
  return `http://127.0.0.1:${port || SERVER_PORT}`;
};

const fetch = (uri, options = {}) => {
  const requestOptions = {
    ...defaultRequestOptions,
    ...options,
  };
  if (requestOptions.body) {
    requestOptions.body = JSON.stringify(requestOptions.body);
  }

  return crossFetch(`${serverUrl(options.port)}${uri}`, {
    ...requestOptions,
  }).then((res) => {
    return res
      .json()
      .then((processedRes) => ({
        body: processedRes,
        status: res.status,
        headers: res.headers,
      }))
      .catch(() => {
        return { status: res.status, headers: res.headers };
      });
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

const findAlert = (alertContextFragment, alerts) => {
  return alerts.find((alert) => alert.context.includes(alertContextFragment));
};

const findTrace = (traceFragment, traces) => {
  return traces.find((trace) => trace.includes(traceFragment));
};

module.exports = {
  createCore,
  startExistingCore,
  startServer,
  fetch,
  TimeCounter,
  wait,
  waitForServer,
  waitForServerUrl,
  fixturesFolder,
  findAlert,
  findTrace,
};
