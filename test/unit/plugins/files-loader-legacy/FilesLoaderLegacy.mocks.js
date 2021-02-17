/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");
const Behavior = require("../../../../src/mocks-legacy/Behavior");

jest.mock("../../../../src/plugins/files-loader-legacy/FilesLoaderLegacy");

const FilesLoader = require("../../../../src/plugins/files-loader-legacy/FilesLoaderLegacy");

let INITIAL_FILES = {
  file1: {
    _mocksServer_isFile: true,
    behavior1: new Behavior([
      {
        url: "/api/foo/foo-uri",
        method: "GET",
        response: {
          status: 200,
          body: {
            fooProperty: "foo",
          },
        },
      },
    ]),
  },
  file2: {
    _mocksServer_isFile: true,
    behavior2: new Behavior([
      {
        url: "/api/foo/foo-uri-2",
        method: "POST",
        response: {
          status: 422,
          body: {
            fooProperty2: "foo2",
          },
        },
      },
    ]),
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

INITIAL_FILES.file1.behavior1._mocksServer_lastPath = "behavior1";
INITIAL_FILES.file2.behavior2._mocksServer_lastPath = "behavior2";

let INITIAL_CONTENTS = [INITIAL_FILES.file1.behavior1, INITIAL_FILES.file2.behavior2, {}];

class Mock {
  static get files() {
    return INITIAL_FILES;
  }

  static set contents(newContents) {
    INITIAL_CONTENTS = newContents;
  }

  static get contents() {
    return INITIAL_CONTENTS;
  }

  constructor() {
    this._sandbox = sinon.createSandbox();

    this._stubs = {
      files: INITIAL_FILES,
      contents: INITIAL_CONTENTS,
      init: this._sandbox.stub().resolves(),
      start: this._sandbox.stub().resolves(),
      stop: this._sandbox.stub(),
      cleanContentsCustomProperties: this._sandbox.stub(),
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
    this._stubs.files = INITIAL_FILES;
    this._stubs.contents = INITIAL_CONTENTS;
    this._sandbox.restore();
  }
}

module.exports = Mock;
