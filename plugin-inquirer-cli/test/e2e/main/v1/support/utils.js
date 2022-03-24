/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const path = require("path");

const crossFetch = require("cross-fetch");

const SERVER_PORT = 3100;

const BINARY_PATH = "./starter";

const defaultRequestOptions = {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
};

const fixturesFolder = (folderName) => {
  return path.resolve(__dirname, "..", "fixtures", folderName);
};

const serverUrl = (port) => {
  return `http://127.0.0.1:${port || SERVER_PORT}`;
};

const request = (uri, { resolveWithFullResponse = false } = {}) => {
  return crossFetch(`${serverUrl()}${uri}`, defaultRequestOptions).then((res) => {
    return res.json().then((processedRes) => {
      if (resolveWithFullResponse) {
        return { body: processedRes, statusCode: res.status, headers: res.headers };
      }
      return processedRes;
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

module.exports = {
  request,
  TimeCounter,
  wait,
  fixturesFolder,
  BINARY_PATH,
};
