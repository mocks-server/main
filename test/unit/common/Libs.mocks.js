const sinon = require("sinon");

const http = require("http");

jest.mock("express");
jest.mock("node-watch");

const express = require("express");
const watch = require("node-watch");

class CallBackRunner {
  constructor() {
    this.runner = this.runner.bind(this);
  }

  runner(eventName, cb) {
    if (this._returns !== undefined) {
      cb(this._returns);
    }
  }

  returns(code) {
    this._returns = code;
  }
}

class WatchRunner {
  constructor(closeStub) {
    this.runner = this.runner.bind(this);
    this.triggerChange = this.triggerChange.bind(this);
    this._closeStub = closeStub;
    this._change = false;
  }

  runner(eventName, options, cb) {
    if (this._change) {
      return cb();
    }
    return {
      close: this._closeStub
    };
  }

  triggerChange(change) {
    this._change = change;
  }
}

class Mock {
  constructor() {
    this._sandbox = sinon.createSandbox();

    const httpCreateServerOnError = new CallBackRunner();
    const httpCreateServerOnListen = new CallBackRunner();
    const watchClose = this._sandbox.stub();
    const watchRunner = new WatchRunner(watchClose);
    const watchStub = this._sandbox.stub().callsFake(watchRunner.runner);
    watchStub.triggerChange = watchRunner.triggerChange;

    this._stubs = {
      watch: watchStub,
      watchTriggerChange: watchRunner.triggerChange,
      watchClose,
      express: {
        use: this._sandbox.stub(),
        options: this._sandbox.stub()
      },
      http: {
        createServer: {
          on: this._sandbox.stub().callsFake(httpCreateServerOnError.runner),
          onError: httpCreateServerOnError,
          listen: this._sandbox.stub().callsFake(httpCreateServerOnListen.runner),
          onListen: httpCreateServerOnListen,
          close: this._sandbox.stub()
        }
      }
    };

    express.mockImplementation(() => this._stubs.express);
    watch.mockImplementation(this._stubs.watch);
    this._sandbox.stub(http, "createServer").returns(this._stubs.http.createServer);
  }

  get stubs() {
    return this._stubs;
  }

  restore() {
    this._sandbox.restore();
  }
}

module.exports = Mock;
