/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const LibsMocks = require("./Libs.mocks");
const ConfigMock = require("./Config.mocks");

const Scaffold = require("../src/Scaffold");
const tracer = require("../src/tracer");

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
      config: configMock,
    });
    configMock.loadedFile = false;
    libsMocks.stubs.fsExtra.existsSync.returns(false);
  });

  afterEach(async () => {
    libsMocks.restore();
    sandbox.restore();
    configMock.restore();
  });

  describe("when initialized", () => {
    it("should create the mocks folder if it does not exists and neither config file", async () => {
      configMock.loadedFile = false;
      libsMocks.stubs.fsExtra.existsSync.returns(false);
      await scaffold.init({ filesLoaderPath: "foo" });
      expect(libsMocks.stubs.fsExtra.copySync.callCount).toEqual(1);
    });

    it("should create the mocks folder in provided filesLoaderPath", async () => {
      configMock.loadedFile = false;
      libsMocks.stubs.fsExtra.existsSync.returns(false);
      await scaffold.init({ filesLoaderPath: "foo" });
      expect(libsMocks.stubs.fsExtra.copySync.getCall(0).args[1]).toEqual("foo");
    });

    it("should not create the scaffold if mocks folder exists", async () => {
      libsMocks.stubs.fsExtra.existsSync.returns(true);
      await scaffold.init({ filesLoaderPath: "foo" });
      expect(libsMocks.stubs.fsExtra.copySync.callCount).toEqual(0);
    });

    it("should not create the scaffold if file was loaded", async () => {
      configMock.loadedFile = true;
      await scaffold.init({ filesLoaderPath: "foo" });
      expect(libsMocks.stubs.fsExtra.copySync.callCount).toEqual(0);
    });
  });
});
