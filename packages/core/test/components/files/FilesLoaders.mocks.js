/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

jest.mock("../../../src/files/FilesLoaders");

const FilesLoader = require("../../../src/files/FilesLoaders");

class Mock {
  constructor() {
    this._sandbox = sinon.createSandbox();

    this._stubs = {
      init: this._sandbox.stub().resolves(),
      start: this._sandbox.stub().resolves(),
      stop: this._sandbox.stub(),
    };

    FilesLoader.mockImplementation(() => this._stubs);
  }

  get stubs() {
    return {
      Constructor: FilesLoader,
      instance: this._stubs,
    };
  }

  restore() {
    this._sandbox.restore();
  }
}

module.exports = Mock;
