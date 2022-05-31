/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/
const path = require("path");

const fsExtra = require("fs-extra");
const sinon = require("sinon");

const LibsMocks = require("../Libs.mocks");
const ConfigMock = require("../Config.mocks");

const Scaffold = require("../../src/scaffold/Scaffold");
const tracer = require("../../src/tracer");

function readSnapshot(fileName) {
  return fsExtra.readFile(path.resolve(__dirname, "snapshots", fileName), {
    encoding: "utf8",
  });
}

describe("Scaffold", () => {
  let configMock;
  let sandbox;
  let libsMocks;
  let scaffold;

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    configMock = new ConfigMock();
    configMock.stubs.option.value = "foo-path";
    libsMocks = new LibsMocks();
    sandbox.stub(tracer, "verbose");
    sandbox.stub(tracer, "debug");
    sandbox.stub(tracer, "error");
    sandbox.stub(tracer, "info");
    sandbox.stub(tracer, "silly");

    scaffold = new Scaffold({
      config: configMock.stubs.instance,
      alerts: {
        set: sandbox.stub(),
      },
    });
    scaffold._mockSelectedOption = { value: null };
    scaffold._readConfigFileOption = { value: true };
    configMock.stubs.instance.loadedFile = false;
    libsMocks.stubs.fsExtra.existsSync.returns(false);
  });

  afterEach(async () => {
    libsMocks.restore();
    sandbox.restore();
    configMock.restore();
  });

  describe("when initialized", () => {
    it("should create the mocks folder if it does not exists and neither config file", async () => {
      configMock.stubs.instance.loadedFile = false;
      libsMocks.stubs.fsExtra.existsSync.returns(false);
      await scaffold.init({ filesLoaderPath: "foo" });
      expect(libsMocks.stubs.fsExtra.copy.callCount).toEqual(1);
    });

    it("should create the mocks folder in provided filesLoaderPath", async () => {
      configMock.stubs.instance.loadedFile = false;
      libsMocks.stubs.fsExtra.existsSync.returns(false);
      await scaffold.init({ filesLoaderPath: "foo" });
      expect(libsMocks.stubs.fsExtra.copy.getCall(0).args[1]).toEqual("foo");
    });

    it("should not create the mocks scaffold if mocks folder exists", async () => {
      libsMocks.stubs.fsExtra.existsSync.returns(true);
      await scaffold.init({ filesLoaderPath: "foo" });
      expect(libsMocks.stubs.fsExtra.copy.callCount).toEqual(0);
    });

    it("should create the mocks scaffold even if config file was loaded", async () => {
      configMock.stubs.instance.loadedFile = true;
      await scaffold.init({ filesLoaderPath: "foo" });
      expect(libsMocks.stubs.fsExtra.copy.callCount).toEqual(1);
    });

    it("should not create the config scaffold if file was loaded", async () => {
      configMock.stubs.instance.loadedFile = true;
      await scaffold.init({ filesLoaderPath: "foo" });
      expect(libsMocks.stubs.fsExtra.writeFile.callCount).toEqual(0);
    });

    it("should not create the config scaffold if config file was disabled", async () => {
      scaffold._readConfigFileOption.value = false;
      await scaffold.init({ filesLoaderPath: "foo" });
      expect(libsMocks.stubs.fsExtra.writeFile.callCount).toEqual(0);
    });

    it("should set the selected mock value if it has not value before creating config", async () => {
      scaffold._mockSelectedOption.value = null;
      await scaffold.init({ filesLoaderPath: "foo" });
      expect(scaffold._mockSelectedOption.value).toEqual("base");
    });

    it("should not set the selected mock value if it has value", async () => {
      scaffold._mockSelectedOption.value = "base2";
      await scaffold.init({ filesLoaderPath: "foo" });
      expect(scaffold._mockSelectedOption.value).toEqual("base2");
    });

    it("should create the config scaffold even if mocks folder exists", async () => {
      libsMocks.stubs.fsExtra.existsSync.returns(true);
      await scaffold.init({ filesLoaderPath: "foo" });
      expect(libsMocks.stubs.fsExtra.writeFile.callCount).toEqual(1);
    });
  });

  describe("create config file", () => {
    it("should write default config file in current process working directory", async () => {
      configMock.stubs.instance.loadedFile = false;
      await scaffold.init({ filesLoaderPath: "foo" });
      expect(libsMocks.stubs.fsExtra.writeFile.getCall(0).args[0]).toEqual(
        path.resolve(process.cwd(), "mocks.config.js")
      );
    });

    it("should format options and namespaces in an appropiate way, and write correspondent file", async () => {
      const expectedContent = await readSnapshot("config-1.js");
      configMock.stubs.instance.namespaces = [
        {
          name: "namespace1",
          options: [
            {
              namespace: "mocks",
              description: "It contains a string",
              type: "string",
              name: "selected",
              value: "foo",
              extraData: {
                scaffold: {
                  commented: false,
                  value: "base",
                },
              },
            },
            {
              description: "It contains a boolean",
              type: "boolean",
              name: "option12",
              value: true,
            },
          ],
          namespaces: [
            {
              name: "namespace1B",
              options: [
                {
                  description: "It contains an array",
                  name: "option1B-1",
                  type: "array",
                  value: [1, 2, 3, 4, 5, "6", null, { foo: "foo" }],
                },
                {
                  description: "It contains an object",
                  name: "option2B-2",
                  type: "object",
                  value: {
                    foo: "foo",
                    foo2: false,
                    foo3: { foo2: 5 },
                    foo4: 5,
                    foo6: [1, 2, 3, null, "foo", { var: "var" }],
                  },
                  extraData: {
                    scaffold: {
                      omit: true,
                    },
                  },
                },
              ],
            },
            {
              name: "namespace1C",
              options: [
                {
                  description: "It contains a string",
                  name: "option1C-1",
                  type: "string",
                  value: "foo",
                },
              ],
            },
          ],
        },
        {
          name: "namespace2",
          options: [
            {
              description: "It contains an array",
              name: "option2-1",
              type: "array",
              value: [
                {
                  foo: "foo",
                  foo2: () => {
                    /* do nothing; */
                  },
                },
              ],
            },
            {
              name: "option2-1",
              description: "It contains an string",
              type: "string",
              value: '""',
            },
          ],
        },
        {
          // simulate namespace with no name (root one)
          options: [
            {
              description: "It contains a string",
              name: "log",
              type: "string",
              value: "info",
              extraData: {
                scaffold: {
                  commented: false,
                },
              },
            },
            {
              description: "It contains undefined",
              name: "secondValue",
              type: "string",
              value: undefined,
            },
          ],
        },
        {
          // simulate config namespace
          name: "config",
          options: [
            {
              description: "It contains a string",
              name: "log",
              type: "string",
              value: "info",
              extraData: {
                scaffold: {
                  commented: false,
                },
              },
            },
            {
              description: "This one is no omitted",
              name: "allowUnknownArguments",
              type: "boolean",
              value: true,
            },
          ],
        },
      ];
      configMock.stubs.instance.options = [
        {
          description: "It contains a string",
          name: "log",
          type: "string",
          value: "info",
          extraData: {
            scaffold: {
              commented: false,
            },
          },
        },
        {
          description: "It contains undefined",
          name: "secondValue",
          type: "string",
          value: undefined,
        },
      ];
      configMock.stubs.instance.loadedFile = false;
      await scaffold.init({ filesLoaderPath: "foo" });
      expect(libsMocks.stubs.fsExtra.writeFile.getCall(0).args[1]).toEqual(expectedContent);
    });
  });
});
