/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

jest.mock("../../../lib/core/Server");

const Server = require("../../../lib/core/Server");

class CallBackRunner {
  constructor() {
    this.runner = this.runner.bind(this);
    this.executeCb = this.executeCb.bind(this);
    this._execute = false;
  }

  runner(eventName, cb) {
    if (this._execute) {
      cb();
    }
  }

  executeCb(execute) {
    this._execute = execute;
  }
}

class Mock {
  constructor() {
    this._sandbox = sinon.createSandbox();

    const eventsRemoveListenerFake = new CallBackRunner();
    const eventsRemoveListenerStub = this._sandbox
      .stub()
      .callsFake(eventsRemoveListenerFake.runner);
    eventsRemoveListenerStub.executeCb = eventsRemoveListenerFake.executeCb;

    const eventsOnFake = new CallBackRunner();
    const eventsOnStub = this._sandbox.stub().callsFake(eventsOnFake.runner);
    eventsOnStub.executeCb = eventsOnFake.executeCb;

    this._stubs = {
      error: null,
      watchEnabled: true,
      behaviors: {},
      settings: {},
      start: this._sandbox.stub(),
      restart: this._sandbox.stub(),
      switchWatch: this._sandbox.stub(),
      events: {
        removeListener: eventsRemoveListenerStub,
        on: eventsOnStub
      },
      stop: this._sandbox.stub()
    };

    Server.mockImplementation(() => this._stubs);
  }

  get stubs() {
    return {
      Constructor: Server,
      instance: this._stubs
    };
  }

  restore() {
    this._sandbox.restore();
  }
}

module.exports = Mock;
