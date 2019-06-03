const sinon = require("sinon");

const cliBase = require("../../../lib/base-cli");

class CallBackRunner {
  constructor() {
    this.runner = this.runner.bind(this);
    this.executeCb = this.executeCb.bind(this);
    this._execute = false;
    this._returns = null;
  }

  runner(eventName, cb) {
    if (this._execute) {
      if (cb) {
        if (cb.source) {
          return cb.source(null, this._returns);
        }
        return cb();
      }
      return eventName();
    }
  }

  executeCb(execute) {
    this._execute = execute;
  }

  returns(data) {
    this._returns = data;
  }
}

class Mock {
  constructor() {
    this._sandbox = sinon.createSandbox();

    const logsModeFake = new CallBackRunner();
    const logsModeStub = this._sandbox.stub().callsFake(logsModeFake.runner);
    logsModeStub.executeCb = logsModeFake.executeCb;

    const inquireFake = new CallBackRunner();

    this._stubs = {
      inquirer: {
        removeListeners: this._sandbox.stub(),
        exitLogsMode: this._sandbox.stub(),
        clearScreen: this._sandbox.stub(),
        inquire: this._sandbox.stub().resolves(),
        inquireFake: inquireFake,
        logsMode: logsModeStub
      }
    };

    this._stubs.Inquirer = this._sandbox.stub(cliBase, "Inquirer").returns(this._stubs.inquirer);
  }

  get stubs() {
    return this._stubs;
  }

  restore() {
    this._sandbox.restore();
  }
}

module.exports = Mock;
