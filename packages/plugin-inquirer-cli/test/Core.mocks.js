/*
Copyright 2019-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

jest.mock("@mocks-server/core");

const { Core } = require("@mocks-server/core");

const ConfigMock = require("./Config.mocks");

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
      onChangeAlerts: this._sandbox.stub().returns(doNothing),
      addRouter: this._sandbox.stub(),
      addSetting: this._sandbox.stub(),
      mock: {
        current: "foo-current",
        plainMocks: [],
        plainRoutes: [],
        plainRoutesVariants: [],
        customRoutesVariants: [],
        customRouteVariants: [],
        ids: [],
        useRouteVariant: this._sandbox.stub(),
        restoreRouteVariants: this._sandbox.stub(),
        onChange: this._sandbox.stub().returns(doNothing),
        routes: {
          plain: [],
          plainVariants: [],
        },
        collections: {
          selected: "foo-current",
          ids: [],
          plain: [],
        },
      },
      server: {
        restart: this._sandbox.stub(),
      },
      config: new ConfigMock().stubs.instance,
      alerts: {
        root: {
          customFlat: [],
          onChange: this._sandbox.stub().returns(doNothing),
        },
      },
      serverError: null,
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
