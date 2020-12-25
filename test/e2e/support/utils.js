/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const path = require("path");

const requestPromise = require("request-promise");

const SERVER_PORT = 3100;

const BINARY_PATH = "../../mocks-server";

const defaultRequestOptions = {
  method: "GET",
};

const fixturesFolder = (folderName) => {
  return path.resolve(__dirname, "..", "main", "fixtures", folderName);
};

const request = (uri, options = {}) => {
  const requestOptions = {
    ...defaultRequestOptions,
    ...options,
  };

  return requestPromise({
    uri: `http://localhost:${SERVER_PORT}${uri}`,
    json: true,
    ...requestOptions,
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
