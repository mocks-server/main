/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

jest.mock("../src/Loaders");

const Loaders = require("../src/Loaders");

const INITIAL_FILES = {
  file1: {
    _mocksServer_isFile: true,
  },
  file2: {
    _mocksServer_isFile: true,
  },
  folder: {
    folder2: {
      file: {
        _mocksServer_isFile: true,
        fooProperty: "",
      },
    },
  },
};

class Mock {
  static get files() {
    return INITIAL_FILES;
  }

  constructor() {
    this._sandbox = sinon.createSandbox();

    this._stubs = {
      new: this._sandbox.stub(),
    };

    Loaders.mockImplementation(() => this._stubs);
  }

  get stubs() {
    return {
      Constructor: Loaders,
      instance: this._stubs,
    };
  }

  restore() {
    this._sandbox.restore();
  }
}

module.exports = Mock;
