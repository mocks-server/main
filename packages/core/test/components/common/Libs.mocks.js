/*
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

jest.mock("express");
jest.mock("node-watch");

const http = require("http");
const https = require("https");
const express = require("express");
const watch = require("node-watch");
const fsExtra = require("fs-extra");
const fs = require("fs");
const globule = require("globule");

class CallBackRunner {
  constructor() {
    this.runner = this.runner.bind(this);
  }

  runner(_eventName, cb) {
    if (this._returns !== undefined) {
      if (!this._delay) {
        cb(this._returns);
      } else {
        setTimeout(() => {
          cb(this._returns);
        }, this._delay);
      }
    }
  }

  returns(code) {
    this._returns = code;
  }

  delay(time) {
    this._delay = time;
  }
}

class WatchRunner {
  constructor(closeStub) {
    this.runner = this.runner.bind(this);
    this.triggerChange = this.triggerChange.bind(this);
    this._closeStub = closeStub;
    this._change = false;
  }

  runner(_eventName, _options, cb) {
    if (this._change) {
      return cb();
    }
    return {
      close: this._closeStub,
    };
  }

  triggerChange(change) {
    this._change = change;
  }
}

class Mock {
  constructor({ mockFsExtraReadFileSync = false } = {}) {
    this._sandbox = sinon.createSandbox();

    const httpCreateServerOnError = new CallBackRunner();
    const httpCreateServerOnListen = new CallBackRunner();
    const watchClose = this._sandbox.stub();
    const watchRunner = new WatchRunner(watchClose);
    const watchStub = this._sandbox.stub().callsFake(watchRunner.runner);
    watchStub.triggerChange = watchRunner.triggerChange;

    const ensureDirSyncStub = this._sandbox.stub();
    const existsSyncStub = this._sandbox.stub();
    const copySyncStub = this._sandbox.stub();
    const copyStub = this._sandbox.stub();
    const writeStub = this._sandbox.stub();
    const readFileSyncStub = this._sandbox.stub();

    const readFileStub = this._sandbox
      .stub(fs, "readFile")
      .callsFake((_filePath, _encoding, cb) => cb());
    const writeFileStub = this._sandbox
      .stub(fs, "writeFile")
      .callsFake((_filePath, _fileContent, _encoding, cb) => cb());

    const expressRouterStub = {
      get: this._sandbox.stub(),
      post: this._sandbox.stub(),
      patch: this._sandbox.stub(),
      put: this._sandbox.stub(),
      delete: this._sandbox.stub(),
      all: this._sandbox.stub(),
      use: this._sandbox.stub(),
    };

    const createServer = {
      on: this._sandbox.stub().callsFake(httpCreateServerOnError.runner),
      onError: httpCreateServerOnError,
      listen: this._sandbox.stub().callsFake(httpCreateServerOnListen.runner),
      onListen: httpCreateServerOnListen,
      close: this._sandbox.stub().callsFake((cb) => cb()),
    };

    this._stubs = {
      watch: watchStub,
      watchTriggerChange: watchRunner.triggerChange,
      watchClose,
      expressRouter: expressRouterStub,
      express: {
        use: this._sandbox.stub(),
        options: this._sandbox.stub(),
        Router: express.Router,
      },
      globule: {
        find: this._sandbox.stub(globule, "find"),
      },
      http: {
        createServer,
      },
      https: {
        createServer,
      },
      fsExtra: {
        ensureDirSync: ensureDirSyncStub,
        existsSync: existsSyncStub,
        copySync: copySyncStub,
        copy: copyStub,
        writeFile: writeStub,
        readFileSync: readFileSyncStub,
      },
      fs: {
        readFile: readFileStub,
        writeFileStub: writeFileStub,
      },
    };

    express.mockImplementation(() => this._stubs.express);
    watch.mockImplementation(this._stubs.watch);
    jest.spyOn(http, "createServer").mockImplementation(() => this._stubs.http.createServer);
    jest.spyOn(https, "createServer").mockImplementation(() => this._stubs.https.createServer);
    jest.spyOn(fsExtra, "ensureDirSync").mockImplementation(ensureDirSyncStub);
    jest.spyOn(fsExtra, "existsSync").mockImplementation(existsSyncStub);
    jest.spyOn(fsExtra, "copySync").mockImplementation(copySyncStub);
    jest.spyOn(fsExtra, "copy").mockImplementation(copyStub);
    jest.spyOn(fsExtra, "writeFile").mockImplementation(writeStub);
    if (mockFsExtraReadFileSync) {
      jest.spyOn(fsExtra, "readFileSync").mockImplementation(readFileSyncStub);
    }

    this._sandbox.stub(express, "Router").returns(this._stubs.expressRouter);
    this._stubs.express.static = this._sandbox.stub(express, "static");
  }

  get stubs() {
    return this._stubs;
  }

  restore() {
    this._sandbox.restore();
  }
}

module.exports = Mock;
