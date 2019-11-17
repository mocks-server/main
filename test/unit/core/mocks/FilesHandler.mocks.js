/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

jest.mock("../../../../lib/core/mocks/FilesHandler");

const FilesHandler = require("../../../../lib/core/mocks/FilesHandler");

const INITIAL_FILES = {
  file1: {
    behavior1: {
      fixtures: [
        {
          url: "/api/foo/foo-uri",
          method: "GET",
          response: {
            status: 200,
            body: {
              fooProperty: "foo"
            }
          }
        }
      ],
      totalFixtures: 1,
      methods: {
        POST: {
          "/api/foo/foo-uri": {
            route: "foo-route-parser",
            response: {
              status: 200,
              body: {
                fooProperty: "foo"
              }
            }
          }
        }
      }
    }
  },
  file2: {
    behavior2: {
      fixtures: [
        {
          url: "/api/foo/foo-uri-2",
          method: "POST",
          response: {
            status: 422,
            body: {
              fooProperty2: "foo2"
            }
          }
        }
      ],
      totalFixtures: 1,
      methods: {
        POST: {
          "/api/foo/foo-uri-2": {
            route: "foo-route-parser",
            response: {
              status: 422,
              body: {
                fooProperty2: "foo2"
              }
            }
          }
        }
      }
    }
  },
  folder: {
    folder2: {
      file: {
        fooProperty: ""
      }
    }
  }
};

class Mock {
  static get files() {
    return INITIAL_FILES;
  }

  constructor() {
    this._sandbox = sinon.createSandbox();

    this._stubs = {
      files: INITIAL_FILES,
      init: this._sandbox.stub().resolves(),
      start: this._sandbox.stub().resolves()
    };

    FilesHandler.mockImplementation(() => this._stubs);
  }

  get stubs() {
    return {
      Constructor: FilesHandler,
      instance: this._stubs
    };
  }

  restore() {
    this._stubs.files = INITIAL_FILES;
    this._sandbox.restore();
  }
}

module.exports = Mock;
