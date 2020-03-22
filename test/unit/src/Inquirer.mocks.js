/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const inquirer = require("../../../src/Inquirer");

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
        logsMode: logsModeStub,
      },
    };

    this._stubs.Inquirer = this._sandbox.stub(inquirer, "Inquirer").returns(this._stubs.inquirer);
  }

  get stubs() {
    return this._stubs;
  }

  restore() {
    this._sandbox.restore();
  }

  reset() {
    this._sandbox.reset();
    inquirer.Inquirer.returns(this._stubs.inquirer);
  }
}

module.exports = Mock;
