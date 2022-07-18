/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const path = require("path");
const sinon = require("sinon");
const { cloneDeep } = require("lodash");
const { Logger } = require("@mocks-server/logger");

const Alerts = require("../../src/alerts/Alerts");
const LibsMocks = require("../common/Libs.mocks");
const CoreMocks = require("../Core.mocks");
const ConfigMock = require("../common/Config.mocks");

const FilesLoaders = require("../../src/files/FilesLoaders");

const wait = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 1000);
  });
};

describe("FilesLoaders", () => {
  const fooRequireCache = {
    "foo-path": {
      id: "foo-path",
      children: {
        "foo-path/foo-children": {
          id: "foo-path/foo-children",
        },
      },
    },
    "foo-path/foo-children": {
      id: "foo-path/foo-children",
      children: {
        "foo-path/foo-children-2": {
          id: "foo-path/foo-children-2",
        },
      },
    },
    "foo-path/foo-children-2": {
      id: "foo-path/foo-children-2",
      children: {
        "foo-children-3": {
          id: "foo-children-3",
        },
      },
    },
    "foo-not-children": {
      id: "foo-not-children",
    },
  };

  let configMock;
  let sandbox;
  let coreMocks;
  let coreInstance;
  let requireCache;
  let filesLoader;
  let libsMocks;
  let pluginMethods;
  let pathOption;
  let watchOption;
  let babelRegisterOption;
  let babelRegisterOptionsOption;
  let alerts;
  let logger;

  beforeEach(async () => {
    requireCache = cloneDeep(fooRequireCache);
    sandbox = sinon.createSandbox();
    configMock = new ConfigMock();
    configMock.stubs.option.value = "foo-path";
    coreMocks = new CoreMocks();
    libsMocks = new LibsMocks();
    coreInstance = coreMocks.stubs.instance;

    sandbox.stub(Logger.prototype, "warn");
    sandbox.stub(Logger.prototype, "verbose");
    sandbox.stub(Logger.prototype, "debug");
    sandbox.stub(Logger.prototype, "error");
    sandbox.stub(Logger.prototype, "info");
    sandbox.stub(Logger.prototype, "silly");
    logger = new Logger();

    alerts = new Alerts("files", { logger });
    pluginMethods = {
      core: coreInstance,
      loadRoutes: sandbox.stub(),
      loadMocks: sandbox.stub(),
      alerts,
      config: configMock.stubs.namespace,
      logger,
    };

    filesLoader = new FilesLoaders(pluginMethods, {
      requireCache,
    });
    sandbox.stub(path, "isAbsolute").returns(true);
    sandbox.stub(console, "log");
    libsMocks.stubs.fsExtra.existsSync.returns(true);
    libsMocks.stubs.globule.find.returns([]);
    pathOption = { value: "foo-path" };
    watchOption = { value: true };
    babelRegisterOption = { value: false };
    babelRegisterOptionsOption = { value: {} };

    filesLoader._pathOption = pathOption;
    filesLoader._watchOption = watchOption;
    filesLoader._babelRegisterOption = babelRegisterOption;
    filesLoader._babelRegisterOptionsOption = babelRegisterOptionsOption;
  });

  afterEach(async () => {
    await filesLoader.stop();
    libsMocks.restore();
    sandbox.restore();
    coreMocks.restore();
  });

  describe("id", () => {
    it("should return files", async () => {
      expect(FilesLoaders.id).toEqual("files");
    });
  });

  describe("path getter", () => {
    it("should return the resolved value of the path option", async () => {
      path.isAbsolute.returns(false);
      expect(filesLoader.path).toEqual(path.resolve(process.cwd(), "foo-path"));
    });
  });

  describe("when initialized", () => {
    it("should require all files from mocks folders calculating it from cwd if path is not absolute", async () => {
      path.isAbsolute.returns(false);
      libsMocks.stubs.fsExtra.existsSync.returns(false);
      await filesLoader.init();
      expect(libsMocks.stubs.fsExtra.ensureDirSync.getCall(0).args[0]).toEqual(
        path.resolve(process.cwd(), "foo-path")
      );
    });

    it("should not throw and add an alert if there is an error loading route files", async () => {
      libsMocks.stubs.globule.find.returns(["foo"]);
      await filesLoader.init();
      expect(alerts.flat.length).toEqual(2);
    });

    it("should add an alert when a routes file content does not pass validation", async () => {
      libsMocks.stubs.globule.find.returns(["foo"]);
      filesLoader = new FilesLoaders(pluginMethods, {
        requireCache,
        require: () => ({}),
      });
      filesLoader._pathOption = pathOption;
      filesLoader._watchOption = watchOption;
      filesLoader._babelRegisterOption = babelRegisterOption;
      filesLoader._babelRegisterOptionsOption = babelRegisterOptionsOption;
      await filesLoader.init();
      expect(alerts.flat[1].collection).toEqual("files:routes:file");
      expect(alerts.flat[1].id).toEqual("foo");
      expect(alerts.flat[1].value.message).toEqual(
        expect.stringContaining("Error loading routes from file foo")
      );
    });

    it("should not add an alert when a routes file content pass validation", async () => {
      libsMocks.stubs.globule.find.returns(["foo"]);
      filesLoader = new FilesLoaders(pluginMethods, {
        requireCache,
        require: () => [],
      });
      filesLoader._pathOption = pathOption;
      filesLoader._watchOption = watchOption;
      filesLoader._babelRegisterOption = babelRegisterOption;
      filesLoader._babelRegisterOptionsOption = babelRegisterOptionsOption;
      await filesLoader.init();
      expect(alerts.flat.length).toEqual(0);
    });

    it("should not throw and add an alert if there is an error loading mocks file", async () => {
      await filesLoader.init();
      expect(alerts.flat.length).toEqual(1);
    });

    it("should remove alerts when mocks file loads successfully", async () => {
      filesLoader = new FilesLoaders(pluginMethods, {
        requireCache,
        require: () => [],
      });
      filesLoader._pathOption = pathOption;
      filesLoader._watchOption = watchOption;
      filesLoader._babelRegisterOption = babelRegisterOption;
      filesLoader._babelRegisterOptionsOption = babelRegisterOptionsOption;
      await filesLoader.init();
      expect(alerts.flat.length).toEqual(0);
    });

    it("should call to loadMocks method when mocks file is loaded", async () => {
      filesLoader = new FilesLoaders(pluginMethods, {
        requireCache,
        require: () => [],
      });
      filesLoader._pathOption = pathOption;
      filesLoader._watchOption = watchOption;
      filesLoader._babelRegisterOption = babelRegisterOption;
      filesLoader._babelRegisterOptionsOption = babelRegisterOptionsOption;
      await filesLoader.init();
      expect(pluginMethods.loadMocks.callCount).toEqual(1);
    });

    it("should try to load mocks.json when mock.js file does not exists", async () => {
      filesLoader = new FilesLoaders(pluginMethods, {
        requireCache,
        require: sandbox.spy,
      });
      filesLoader._pathOption = pathOption;
      filesLoader._watchOption = watchOption;
      filesLoader._babelRegisterOption = babelRegisterOption;
      filesLoader._babelRegisterOptionsOption = babelRegisterOptionsOption;
      libsMocks.stubs.fsExtra.existsSync.onCall(0).returns(true);
      libsMocks.stubs.fsExtra.existsSync.onCall(1).returns(false);
      libsMocks.stubs.fsExtra.existsSync.onCall(2).returns(true);
      await filesLoader.init();
      expect(libsMocks.stubs.fsExtra.existsSync.callCount).toEqual(3);
    });

    it("should not throw and add an alert if there is an error in loadRoutesfiles method", async () => {
      sandbox.stub(filesLoader, "_readFile").throws(new Error());
      await filesLoader.init();
      expect(alerts.flat.length).toEqual(1);
    });

    it("should return a rejected promise if there is an error initializing", async () => {
      Logger.prototype.info.throws(new Error("foo error"));
      await expect(() => filesLoader.init()).rejects.toThrow("foo error");
    });

    it("should do nothing if folder exists", async () => {
      libsMocks.stubs.fsExtra.existsSync.returns(true);
      await filesLoader.init();
      expect(libsMocks.stubs.fsExtra.ensureDirSync.callCount).toEqual(0);
    });

    it("should require babel/register if babelRegister config is enabled", async () => {
      const requireSpy = sandbox.stub().returns(() => {
        //do nothing
      });
      coreInstance.lowLevelConfig = { babelRegister: true, babelRegisterOptions: {} };
      filesLoader = new FilesLoaders(pluginMethods, {
        requireCache,
        require: requireSpy,
      });
      filesLoader._pathOption = pathOption;
      filesLoader._watchOption = watchOption;
      filesLoader._babelRegisterOption = { value: true };
      filesLoader._babelRegisterOptionsOption = babelRegisterOptionsOption;
      await filesLoader.init();
      expect(requireSpy.getCall(0).args[0]).toEqual("@babel/register");
    });

    it("should clean require cache for mocks folder", async () => {
      const fooCachePath = "foo-path";

      expect(requireCache[fooCachePath]).toBeDefined();
      await filesLoader.init();
      expect(requireCache[fooCachePath]).not.toBeDefined();
    });

    it("should require cache in order to found the mocks folder", async () => {
      filesLoader = new FilesLoaders(pluginMethods);
      filesLoader._pathOption = pathOption;
      filesLoader._watchOption = watchOption;
      filesLoader._babelRegisterOption = babelRegisterOption;
      filesLoader._babelRegisterOptionsOption = babelRegisterOptionsOption;
      sandbox.spy(filesLoader, "_cleanRequireCache");
      await filesLoader.init();
      // it seems like require cache is empty in jest environment
      expect(filesLoader._cleanRequireCache.callCount).toEqual(0);
    });

    it("should clean require cache for mocks folder childs", async () => {
      const fooCachePath = "foo-path/foo-children";

      expect(requireCache[fooCachePath]).toBeDefined();
      await filesLoader.init();
      expect(requireCache[fooCachePath]).not.toBeDefined();
    });

    it("should clean require cache for mocks folder childs recursively", async () => {
      const fooCachePath = "foo-path/foo-children-2";

      expect(requireCache[fooCachePath]).toBeDefined();
      await filesLoader.init();
      expect(requireCache[fooCachePath]).not.toBeDefined();
    });
  });

  describe("start method", () => {
    describe("when starting files watch", () => {
      it("should do nothing if watch was not enabled", async () => {
        filesLoader._watchOption.value = false;
        await filesLoader.init();
        await filesLoader.start();
        expect(libsMocks.stubs.watch.callCount).toEqual(0);
      });

      it("should call to close watcher if watch was enabled previously", async () => {
        filesLoader._watchOption.value = true;
        await filesLoader.init();
        await filesLoader.start();
        await filesLoader.start();
        expect(libsMocks.stubs.watchClose.callCount).toEqual(1);
      });
    });
  });

  describe("when a file is changed", () => {
    it("should load files again", async () => {
      sandbox.stub(filesLoader, "_loadFiles");
      filesLoader._watchOption.value = true;
      await filesLoader.init();
      await filesLoader.start();
      libsMocks.stubs.watch.getCall(0).args[2]();
      await wait();
      expect(filesLoader._loadFiles.callCount).toEqual(2);
    });
  });

  describe("when core settings change", () => {
    it("should enable watch again if path setting is changed", async () => {
      filesLoader._watchOption.value = true;
      await filesLoader.init();
      await filesLoader.start();
      configMock.stubs.option.onChange.getCall(0).args[0]("foo-path-2");
      await wait();
      expect(libsMocks.stubs.watch.callCount).toEqual(2);
    });

    it("should disable watch if watch is changed", async () => {
      filesLoader._watchOption.value = true;
      await filesLoader.init();
      await filesLoader.start();
      filesLoader._watchOption.value = false;
      configMock.stubs.option.onChange.getCall(1).args[0](false);
      await wait();
      expect(libsMocks.stubs.watchClose.callCount).toEqual(1);
    });
  });
});