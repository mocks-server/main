/*
Copyright 2019-present Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");
const PluginProxy = require("@mocks-server/plugin-proxy");
const AdminApi = require("@mocks-server/plugin-admin-api");
const InquirerCli = require("@mocks-server/plugin-inquirer-cli");
const OpenApi = require("@mocks-server/plugin-openapi").default;

const CoreMocks = require("./Core.mocks.js");

const { createCore } = require("../src/createCore");

describe("createCore method", () => {
  let sandbox;
  let coreMocks;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    coreMocks = new CoreMocks();
    expect.assertions(1);
  });

  afterEach(() => {
    sandbox.restore();
    coreMocks.restore();
  });

  it("should create a new Core, passing to it default options", async () => {
    createCore();
    expect(coreMocks.stubs.Constructor.mock.calls[0][0]).toEqual({
      config: {
        readArguments: false,
        readEnvironment: false,
        readFile: false,
      },
      plugins: {
        register: [PluginProxy, AdminApi, InquirerCli, OpenApi],
        inquirerCli: {
          enabled: false,
        },
      },
      files: {
        enabled: false,
      },
    });
  });

  it("should merge provided config", async () => {
    class FooPlugin {}
    createCore({
      plugins: {
        register: [FooPlugin],
      },
      files: {
        enabled: true,
      },
      mock: {
        collections: {
          selected: "foo",
        },
      },
    });
    expect(coreMocks.stubs.Constructor.mock.calls[0][0]).toEqual({
      config: {
        readArguments: false,
        readEnvironment: false,
        readFile: false,
      },
      plugins: {
        register: [PluginProxy, AdminApi, InquirerCli, OpenApi, FooPlugin],
        inquirerCli: {
          enabled: false,
        },
      },
      files: {
        enabled: true,
      },
      mock: {
        collections: {
          selected: "foo",
        },
      },
    });
  });
});
