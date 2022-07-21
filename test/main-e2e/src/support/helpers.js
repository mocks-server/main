/*
Copyright 2019-present Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const path = require("path");
const fsExtra = require("fs-extra");

const crossFetch = require("cross-fetch");
const waitOn = require("wait-on");

const InquirerCliRunner = require("@mocks-server/inquirer-cli-runner");

const DEFAULT_BINARY_PATH = "../../../../../packages/main/bin/mocks-server";

const SERVER_PORT = 3100;

const defaultRequestOptions = {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
};

const rootFolder = path.resolve(__dirname, "..", "..");
const baseFixturesFolder = path.resolve(__dirname, "..", "fixtures");

const fixturesFolder = (folderName) => {
  return path.resolve(baseFixturesFolder, folderName);
};

const scaffoldFolder = fixturesFolder("scaffold");

const defaultMocksRunnerOptions = {
  cwd: scaffoldFolder,
};

const cleanScaffold = async () => {
  await fsExtra.remove(path.resolve(scaffoldFolder, "mocks"));
  await fsExtra.remove(path.resolve(scaffoldFolder, "mocks.config.js"));
};

const cleanRootScaffold = async () => {
  await fsExtra.remove(path.resolve(rootFolder, "mocks"));
};

const serverUrl = (port) => {
  return `http://127.0.0.1:${port || SERVER_PORT}`;
};

const doFetch = (uri, options = {}) => {
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

const waitForServerAndCli = async (port) => {
  await waitForServer(port);
  await wait();
};

const mocksRunner = (args = [], options = {}) => {
  const argsToSend = [...args];
  argsToSend.unshift(DEFAULT_BINARY_PATH);
  return new InquirerCliRunner(
    argsToSend,
    {
      ...defaultMocksRunnerOptions,
      ...options,
    },
    wait
  );
};

module.exports = {
  doFetch,
  TimeCounter,
  mocksRunner,
  wait,
  waitForServer,
  waitForServerAndCli,
  fixturesFolder,
  cleanScaffold,
  cleanRootScaffold,
};
