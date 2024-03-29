/*
Copyright 2021-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

jest.mock("../../../src/mock/Mock");

const Mock = require("../../../src/mock/Mock");

const CURRENT = "foo";

class MockMock {
  constructor() {
    this._sandbox = sinon.createSandbox();

    this._loadersStubs = {
      loadCollections: this._sandbox.stub(),
      loadRoutes: this._sandbox.stub(),
    };

    this._stubs = {
      current: CURRENT,
      load: this._sandbox.stub(),
      init: this._sandbox.stub(),
      createLoaders: this._sandbox.stub().returns(this._loadersStubs),
      collections: {
        selected: CURRENT,
      },
    };

    Mock.mockImplementation(() => this._stubs);
  }

  get stubs() {
    return {
      Constructor: Mock,
      instance: this._stubs,
      loaders: this._loadersStubs,
    };
  }

  restore() {
    this._stubs.collections.selected = CURRENT;
    this._stubs.current = CURRENT;
    this._sandbox.restore();
  }
}

module.exports = MockMock;
