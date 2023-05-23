/*
Copyright 2019-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

jest.mock("../../src/Core");

const { Core } = require("../../src/Core");

class CoreMock {
  constructor() {
    this._sandbox = sinon.createSandbox();

    this._stubs = {
      init: this._sandbox.stub().resolves(),
      start: this._sandbox.stub().resolves(),
      stop: this._sandbox.stub().resolves(),
      addRoutesHandler: this._sandbox.stub(),
      restartServer: this._sandbox.stub().resolves(),
      tracer: {
        silly: this._sandbox.stub(),
        debug: this._sandbox.stub(),
        verbose: this._sandbox.stub(),
        info: this._sandbox.stub(),
        warn: this._sandbox.stub(),
        error: this._sandbox.stub(),
      },
      addRouter: this._sandbox.stub(),
      removeRouter: this._sandbox.stub(),
      onChangeMocks: this._sandbox.stub(),
      onChangeAlerts: this._sandbox.stub(),
      onChangeLogs: this._sandbox.stub(),
      mocks: {
        useRouteVariant: this._sandbox.stub(),
        restoreRoutesVariants: this._sandbox.stub(),
        restoreRouteVariants: this._sandbox.stub(),
      },
      logs: ["foo", "foo2"],
      logger: {
        silly: this._sandbox.stub(),
        debug: this._sandbox.stub(),
        verbose: this._sandbox.stub(),
        info: this._sandbox.stub(),
        warn: this._sandbox.stub(),
        error: this._sandbox.stub(),
      },
      loadMocks: this._sandbox.stub(),
      loadRoutes: this._sandbox.stub(),
      _deprecationAlerts: {
        set: this._sandbox.stub(),
      },
      server: {
        restart: this._sandbox.stub(),
        addRouter: this._sandbox.stub(),
        removeRouter: this._sandbox.stub(),
      },
      mock: {
        onChange: this._sandbox.stub(),
        useRouteVariant: this._sandbox.stub(),
        restoreRouteVariants: this._sandbox.stub(),
        createLoaders: this._sandbox.stub().returns({
          loadCollections: this._sandbox.stub(),
          loadRoutes: this._sandbox.stub(),
        }),
      },
      variantHandlers: {
        register: this._sandbox.stub(),
      },
      version: "foo-version",
      files: {
        start: this._sandbox.stub(),
        stop: this._sandbox.stub(),
        reload: this._sandbox.stub(),
        createLoader: this._sandbox.stub(),
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
