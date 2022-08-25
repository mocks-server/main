/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const path = require("path");
const sinon = require("sinon");
const yaml = require("yaml");
const fsExtra = require("fs-extra");
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
  let enabledOption;
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
    sandbox.stub(fsExtra, "readFile").resolves();
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
      loadCollections: sandbox.stub(),
      alerts,
      config: configMock.stubs.namespace,
      logger,
    };

    filesLoader = new FilesLoaders(pluginMethods, {
      requireCache,
    });
    sandbox.stub(path, "isAbsolute").returns(true);
    sandbox.stub(console, "log");
    sandbox.stub(yaml, "parse");
    libsMocks.stubs.fsExtra.existsSync.returns(true);
    libsMocks.stubs.globule.find.returns([]);
    pathOption = { value: "foo-path" };
    watchOption = { value: true };
    babelRegisterOption = { value: false };
    babelRegisterOptionsOption = { value: {} };
    enabledOption = { value: true };

    filesLoader._enabledOption = enabledOption;
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

  describe("loaders getter", () => {
    it("should return loaders", async () => {
      await filesLoader.init();
      expect(filesLoader.loaders.collections).toBeDefined();
      expect(filesLoader.loaders.routes).toBeDefined();
    });
  });

  describe("when initialized", () => {
    it("should not require files from mocks folders if it is disabled", async () => {
      enabledOption.value = false;
      await filesLoader.init();
      expect(libsMocks.stubs.fsExtra.ensureDirSync.callCount).toEqual(0);
    });

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
      expect(alerts.flat.length).toEqual(1);
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
      expect(alerts.flat[0].collection).toEqual("files:loader:routes:file");
      expect(alerts.flat[0].id).toEqual("foo");
      expect(alerts.flat[0].value.message).toEqual(
        expect.stringContaining("Error loading routes from file foo")
      );
    });

    it("should add an alert when collections file content does not pass validation", async () => {
      libsMocks.stubs.globule.find.returns(["collections.json"]);
      filesLoader = new FilesLoaders(pluginMethods, {
        requireCache,
        require: () => ({}),
      });
      filesLoader._pathOption = pathOption;
      filesLoader._watchOption = watchOption;
      filesLoader._babelRegisterOption = babelRegisterOption;
      filesLoader._babelRegisterOptionsOption = babelRegisterOptionsOption;
      await filesLoader.init();
      expect(alerts.flat[0].collection).toEqual("files:loader:collections");
      expect(alerts.flat[0].id).toEqual("error");
      expect(alerts.flat[0].value.message).toEqual(
        expect.stringContaining("Error loading collections from file")
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

    it("should not add an alert when a routes file content is yaml and pass validation", async () => {
      yaml.parse.returns([]);
      libsMocks.stubs.globule.find.returns(["foo.yml"]);
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

    it("should remove alerts when collections file loads successfully", async () => {
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

    it("should add an alert when no collections file is found", async () => {
      libsMocks.stubs.globule.find.returns([]);
      filesLoader = new FilesLoaders(pluginMethods, {
        requireCache,
        require: () => [],
      });
      filesLoader._pathOption = pathOption;
      filesLoader._watchOption = watchOption;
      filesLoader._babelRegisterOption = babelRegisterOption;
      filesLoader._babelRegisterOptionsOption = babelRegisterOptionsOption;
      await filesLoader.init();
      expect(alerts.flat.length).toEqual(1);
      expect(alerts.flat[0].value.message).toEqual(
        expect.stringContaining("No collections file was found")
      );
    });

    it("should call to loadCollections method when mocks file is loaded", async () => {
      filesLoader = new FilesLoaders(pluginMethods, {
        requireCache,
        require: () => [],
      });
      filesLoader._pathOption = pathOption;
      filesLoader._watchOption = watchOption;
      filesLoader._babelRegisterOption = babelRegisterOption;
      filesLoader._babelRegisterOptionsOption = babelRegisterOptionsOption;
      await filesLoader.init();
      expect(pluginMethods.loadCollections.callCount).toEqual(1);
    });

    it("should add an alert when file name is mocks", async () => {
      libsMocks.stubs.globule.find.returns(["mocks.json"]);
      filesLoader = new FilesLoaders(pluginMethods, {
        requireCache,
        require: () => [],
      });
      filesLoader._pathOption = pathOption;
      filesLoader._watchOption = watchOption;
      filesLoader._babelRegisterOption = babelRegisterOption;
      filesLoader._babelRegisterOptionsOption = babelRegisterOptionsOption;
      await filesLoader.init();
      expect(alerts.flat[0].value.message).toEqual(
        "Defining collections in 'mocks.json' file is deprecated. Please rename it to 'collections.json'"
      );
    });

    it("should remove alert when file name is collections", async () => {
      libsMocks.stubs.globule.find.returns(["mocks.json"]);
      filesLoader = new FilesLoaders(pluginMethods, {
        requireCache,
        require: () => [],
      });
      filesLoader._pathOption = pathOption;
      filesLoader._watchOption = watchOption;
      filesLoader._babelRegisterOption = babelRegisterOption;
      filesLoader._babelRegisterOptionsOption = babelRegisterOptionsOption;
      await filesLoader.init();
      expect(alerts.flat[0].value.message).toEqual(
        "Defining collections in 'mocks.json' file is deprecated. Please rename it to 'collections.json'"
      );
      libsMocks.stubs.globule.find.returns(["collections.json"]);
      await filesLoader.reload();
      expect(alerts.flat.length).toEqual(0);
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
      it("should do nothing if files was not enabled", async () => {
        filesLoader._enabledOption.value = false;
        await filesLoader.init();
        await filesLoader.start();
        expect(libsMocks.stubs.watch.callCount).toEqual(0);
      });

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

  describe("when creating loaders", () => {
    it("should call to its load function when files are loaded", async () => {
      libsMocks.stubs.globule.find.returns(["foo/foo-path/**"]);
      const spy = sandbox.spy();
      filesLoader = new FilesLoaders(pluginMethods, {
        requireCache,
        require: () => ["foo-content"],
      });
      filesLoader._pathOption = pathOption;
      filesLoader._watchOption = watchOption;
      filesLoader._babelRegisterOption = babelRegisterOption;
      filesLoader._babelRegisterOptionsOption = babelRegisterOptionsOption;
      filesLoader.createLoader({
        id: "foo",
        src: "foo/foo-path/**/*",
        onLoad: spy,
      });
      await filesLoader.init();
      expect(libsMocks.stubs.globule.find.getCall(0).args[0]).toEqual({
        prefixBase: true,
        src: [
          "foo/foo-path/**/*.json",
          "foo/foo-path/**/*.js",
          "foo/foo-path/**/*.yaml",
          "foo/foo-path/**/*.yml",
        ],
        srcBase: "foo-path",
      });
      expect(spy.getCall(0).args[0]).toEqual([
        { path: "foo/foo-path/**", content: ["foo-content"] },
      ]);
    });

    it("should call to its load function passing the result when file exports a function", async () => {
      libsMocks.stubs.globule.find.returns(["foo/foo-file.js"]);
      const spy = sandbox.spy();
      filesLoader = new FilesLoaders(pluginMethods, {
        requireCache,
        require: () => () => ["foo-content"],
      });
      filesLoader._pathOption = pathOption;
      filesLoader._watchOption = watchOption;
      filesLoader._babelRegisterOption = babelRegisterOption;
      filesLoader._babelRegisterOptionsOption = babelRegisterOptionsOption;
      filesLoader.createLoader({
        id: "foo",
        src: "foo/foo-path/**/*",
        onLoad: spy,
      });
      await filesLoader.init();
      expect(spy.getCall(0).args[0]).toEqual([
        { path: "foo/foo-file.js", content: ["foo-content"] },
      ]);
    });

    it("should call to its load function passing the promise resolved result when file exports a function returning a promise", async () => {
      libsMocks.stubs.globule.find.returns(["foo/foo-file.js"]);
      const exportedFunction = () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            resolve(["foo-promise-content"]);
          }, 200);
        });
      };
      const spy = sandbox.spy();
      filesLoader = new FilesLoaders(pluginMethods, {
        requireCache,
        require: () => exportedFunction,
      });
      filesLoader._pathOption = pathOption;
      filesLoader._watchOption = watchOption;
      filesLoader._babelRegisterOption = babelRegisterOption;
      filesLoader._babelRegisterOptionsOption = babelRegisterOptionsOption;
      filesLoader.createLoader({
        id: "foo",
        src: "foo/foo-path/**/*",
        onLoad: spy,
      });
      await filesLoader.init();
      expect(spy.getCall(0).args[0]).toEqual([
        { path: "foo/foo-file.js", content: ["foo-promise-content"] },
      ]);
    });

    it("should catch the error and pass it as an errored file when the file exports a promise that is rejected", async () => {
      const promiseError = new Error("Foo error");
      libsMocks.stubs.globule.find.returns(["foo/foo-file.js"]);
      const exportedFunction = () => {
        return new Promise((_resolve, reject) => {
          setTimeout(() => {
            reject(promiseError);
          }, 200);
        });
      };
      const spy = sandbox.spy();
      filesLoader = new FilesLoaders(pluginMethods, {
        requireCache,
        require: () => exportedFunction,
      });
      filesLoader._pathOption = pathOption;
      filesLoader._watchOption = watchOption;
      filesLoader._babelRegisterOption = babelRegisterOption;
      filesLoader._babelRegisterOptionsOption = babelRegisterOptionsOption;
      filesLoader.createLoader({
        id: "foo",
        src: "foo/foo-path/**/*",
        onLoad: spy,
      });
      await filesLoader.init();
      expect(spy.getCall(0).args[0]).toEqual([]);
      expect(spy.getCall(0).args[1]).toEqual([{ path: "foo/foo-file.js", error: promiseError }]);
    });

    it("should support async onLoad functions", async () => {
      libsMocks.stubs.globule.find.returns(["foo/foo-path/**"]);
      const spy = sandbox.spy();
      filesLoader = new FilesLoaders(pluginMethods, {
        requireCache,
        require: () => ["foo-content"],
      });
      filesLoader._pathOption = pathOption;
      filesLoader._watchOption = watchOption;
      filesLoader._babelRegisterOption = babelRegisterOption;
      filesLoader._babelRegisterOptionsOption = babelRegisterOptionsOption;
      filesLoader.createLoader({
        id: "foo",
        src: "foo/foo-path/**/*",
        onLoad: (files) => {
          return new Promise((resolve) => {
            setTimeout(() => {
              spy(files);
              resolve();
            }, 200);
          });
        },
      });
      await filesLoader.init();
      expect(spy.getCall(0).args[0]).toEqual([
        { path: "foo/foo-path/**", content: ["foo-content"] },
      ]);
    });

    it("should catch error and add an alert if onLoad promise is rejected", async () => {
      libsMocks.stubs.globule.find.returns(["foo/foo-path/**"]);
      filesLoader = new FilesLoaders(pluginMethods, {
        requireCache,
        require: () => ["foo-content"],
      });
      filesLoader._pathOption = pathOption;
      filesLoader._watchOption = watchOption;
      filesLoader._babelRegisterOption = babelRegisterOption;
      filesLoader._babelRegisterOptionsOption = babelRegisterOptionsOption;
      filesLoader.createLoader({
        id: "foo",
        src: "foo/foo-path/**/*",
        onLoad: () => {
          return new Promise((_resolve, reject) => {
            setTimeout(() => {
              reject(new Error("foo-error"));
            }, 200);
          });
        },
      });
      await filesLoader.init();
      expect(alerts.flat[0].value.message).toEqual("Error proccesing loaded files");
      expect(alerts.flat[0].value.error.message).toEqual("foo-error");
    });
  });
});
