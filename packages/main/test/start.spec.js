/*
Copyright 2019-present Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");
const PluginProxy = require("@mocks-server/plugin-proxy").default;
const AdminApi = require("@mocks-server/plugin-admin-api").default;
const InquirerCli = require("@mocks-server/plugin-inquirer-cli").default;
const OpenApi = require("@mocks-server/plugin-openapi").default;

const CoreMocks = require("./Core.mocks.js");

const { start } = require("../src/start");

describe("start method", () => {
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

  it("should create a new Core, passing to it options for CLI", async () => {
    await start();
    expect(coreMocks.stubs.Constructor.mock.calls[0][0]).toEqual({
      config: { readArguments: true, readEnvironment: true, readFile: true },
      plugins: {
        register: [PluginProxy, AdminApi, InquirerCli, OpenApi],
        inquirerCli: { enabled: true },
      },
      files: { enabled: true },
    });
  });

  it("should catch and trace errors while creating Core", async () => {
    const errorMessage = "Foo error";
    sandbox.stub(console, "error");
    coreMocks.stubs.Constructor.mockImplementationOnce(() => {
      throw new Error(errorMessage);
    });
    await start();
    expect(console.error.getCall(0).args[0]).toEqual(`Error: ${errorMessage}`);
  });

  it("should catch and trace start method errors", async () => {
    const errorMessage = "Foo error";
    sandbox.stub(console, "error");
    coreMocks.stubs.instance.start.rejects(new Error(errorMessage));
    await start();
    expect(console.error.getCall(0).args[0]).toEqual(`Error: ${errorMessage}`);
  });
});
