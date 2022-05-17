/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

jest.mock("@mocks-server/config");

const Config = require("@mocks-server/config");

class ConfigMock {
  constructor() {
    this._sandbox = sinon.createSandbox();

    this._option = {
      onChange: this._sandbox.stub(),
    };

    this._namespace = {
      addNamespace: this._sandbox.stub().returns(this._namespace),
      addOptions: this._sandbox
        .stub()
        .returns([
          this._option,
          this._option,
          this._option,
          this._option,
          this._option,
          this._option,
          this._option,
        ]),
      option: this._sandbox.stub().returns(this._option),
    };

    this._namespace.namespace = this._sandbox.stub().returns(this._namespace);

    this._stubs = {
      init: this._sandbox.stub().resolves(),
      load: this._sandbox.stub().resolves(),
      addOptions: this._sandbox
        .stub()
        .returns([
          this._option,
          this._option,
          this._option,
          this._option,
          this._option,
          this._option,
          this._option,
        ]),
      addOption: this._sandbox.stub().returns(this._option),
      addNamespace: this._sandbox.stub().returns(this._namespace),
      namespace: this._sandbox.stub().returns(this._namespace),
      option: this._sandbox.stub().returns(this._option),
    };

    Config.mockImplementation(() => this._stubs);
  }

  get stubs() {
    return {
      Constructor: Config,
      instance: this._stubs,
      namespace: this._namespace,
      option: this._option,
    };
  }

  restore() {
    this._sandbox.restore();
  }
}

module.exports = ConfigMock;
