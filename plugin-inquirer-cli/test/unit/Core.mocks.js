/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

jest.mock("@mocks-server/core");

const { Core } = require("@mocks-server/core");

const doNothing = () => {
  // do nothing
};

class CoreMock {
  constructor() {
    this._sandbox = sinon.createSandbox();

    this._stubs = {
      init: this._sandbox.stub().resolves(),
      start: this._sandbox.stub().resolves(),
      stop: this._sandbox.stub().resolves(),
      restartServer: this._sandbox.stub().resolves(),
      settings: {
        get: this._sandbox.stub(),
        set: this._sandbox.stub(),
      },
      tracer: {
        silly: this._sandbox.stub(),
        debug: this._sandbox.stub(),
        verbose: this._sandbox.stub(),
        info: this._sandbox.stub(),
        warn: this._sandbox.stub(),
        error: this._sandbox.stub(),
      },
      onChangeSettings: this._sandbox.stub().returns(doNothing),
      onChangeAlerts: this._sandbox.stub().returns(doNothing),
      onChangeMocks: this._sandbox.stub().returns(doNothing),
      onChangeLegacyMocks: this._sandbox.stub().returns(doNothing),
      addRouter: this._sandbox.stub(),
      addSetting: this._sandbox.stub(),
      mocks: {
        current: "foo-current",
        plainMocks: [],
        plainRoutes: [],
        plainRoutesVariants: [],
        customRoutesVariants: [],
        ids: [],
        useRouteVariant: this._sandbox.stub(),
        restoreRoutesVariants: this._sandbox.stub(),
      },
      behaviors: {
        count: 0,
        currentId: "foo-current",
      },
      alerts: [],
      fixtures: {
        count: 0,
      },
      serverError: null,
      _eventEmitter: {
        on: this._sandbox.stub(),
        removeListener: this._sandbox.stub(),
        emit: this._sandbox.stub(),
      },
    };

    Core.mockImplementation(() => this._stubs);
  }

  get stubs() {
    return {
      Constructor: Core,
      instance: this._stubs,
    };
  }

  restore() {
    this._sandbox.restore();
  }

  reset() {
    this._sandbox.reset();
  }
}

module.exports = CoreMock;
