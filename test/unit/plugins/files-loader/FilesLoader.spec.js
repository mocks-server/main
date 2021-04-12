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

const LibsMocks = require("../../Libs.mocks.js");
const CoreMocks = require("../../Core.mocks.js");

const FilesLoader = require("../../../../src/plugins/files-loader/FilesLoader");

const wait = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 1000);
  });
};

describe("FilesLoader", () => {
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

  let sandbox;
  let coreMocks;
  let coreInstance;
  let requireCache;
  let filesLoader;
  let libsMocks;
  let pluginMethods;

  beforeEach(async () => {
    requireCache = cloneDeep(fooRequireCache);
    sandbox = sinon.createSandbox();
    coreMocks = new CoreMocks();
    libsMocks = new LibsMocks();
    pluginMethods = {
      loadRoutes: sandbox.stub(),
      loadMocks: sandbox.stub(),
      loadLegacyMocks: sandbox.stub(),
      addAlert: sandbox.stub(),
      removeAlerts: sandbox.stub(),
    };
    coreInstance = coreMocks.stubs.instance;
    filesLoader = new FilesLoader(coreInstance, pluginMethods, {
      requireCache,
    });
    sandbox.stub(path, "isAbsolute").returns(true);
    coreInstance.settings.get.withArgs("path").returns("foo-path");
    libsMocks.stubs.fsExtra.existsSync.returns(true);
    libsMocks.stubs.globule.find.returns([]);
  });

  afterEach(async () => {
    await filesLoader.stop();
    libsMocks.restore();
    sandbox.restore();
    coreMocks.restore();
  });

  describe("when initialized", () => {
    it("should have displayName defined", async () => {
      expect(filesLoader.displayName).toEqual("@mocks-server/core/plugin-files-loader");
    });

    it("should require all files from mocks folders calculating it from cwd if path is not absolute", async () => {
      path.isAbsolute.returns(false);
      libsMocks.stubs.fsExtra.existsSync.returns(false);
      await filesLoader.init();
      expect(libsMocks.stubs.fsExtra.copySync.getCall(0).args[1]).toEqual(
        path.resolve(process.cwd(), "foo-path")
      );
    });

    it("should not throw and add an alert if there is an error loading route files", async () => {
      libsMocks.stubs.globule.find.returns(["foo"]);
      await filesLoader.init();
      expect(pluginMethods.addAlert.calledWith("load:routes")).toEqual(true);
    });

    it("should not throw and add an alert if there is an error loading mocks file", async () => {
      await filesLoader.init();
      expect(pluginMethods.addAlert.calledWith("load:mocks")).toEqual(true);
    });

    it("should remove alerts when mocks file loads successfully", async () => {
      filesLoader = new FilesLoader(coreInstance, pluginMethods, {
        requireCache,
        require: () => [],
      });
      await filesLoader.init();
      expect(pluginMethods.removeAlerts.calledWith("load:mocks")).toEqual(true);
    });

    it("should call to loadMocks method when mocks file is loaded", async () => {
      filesLoader = new FilesLoader(coreInstance, pluginMethods, {
        requireCache,
        require: () => [],
      });
      await filesLoader.init();
      expect(pluginMethods.loadMocks.callCount).toEqual(1);
    });

    it("should try to load mocks.json when mock.js file does not exists", async () => {
      filesLoader = new FilesLoader(coreInstance, pluginMethods, {
        requireCache,
        require: sandbox.spy,
      });
      libsMocks.stubs.fsExtra.existsSync.onCall(0).returns(true);
      libsMocks.stubs.fsExtra.existsSync.onCall(1).returns(false);
      libsMocks.stubs.fsExtra.existsSync.onCall(2).returns(true);
      await filesLoader.init();
      expect(libsMocks.stubs.fsExtra.existsSync.callCount).toEqual(3);
    });

    it("should not throw and add an alert if there is an error in loadRoutesfiles method", async () => {
      coreInstance.tracer.silly.throws(new Error());
      await filesLoader.init();
      expect(pluginMethods.addAlert.calledWith("load:routes")).toEqual(true);
    });

    it("should create scaffold folder when folder does not exist", async () => {
      libsMocks.stubs.fsExtra.existsSync.returns(false);
      await filesLoader.init();
      expect(libsMocks.stubs.fsExtra.copySync.getCall(0).args[1]).toEqual("foo-path");
    });

    it("should do nothing if folder exists", async () => {
      libsMocks.stubs.fsExtra.existsSync.returns(true);
      await filesLoader.init();
      expect(libsMocks.stubs.fsExtra.ensureDirSync.callCount).toEqual(0);
    });

    it("should throw an error if mocks folder is not defined", async () => {
      expect.assertions(1);
      try {
        coreInstance.settings.get.withArgs("path").returns(undefined);
        await filesLoader.init();
      } catch (error) {
        expect(error.message).toEqual(`Invalid option "path"`);
      }
    });

    it("should require babel/register if babelRegister config is enabled", async () => {
      const requireSpy = sandbox.stub().returns(() => {});
      coreInstance.lowLevelConfig = { babelRegister: true };
      filesLoader = new FilesLoader(coreInstance, pluginMethods, {
        requireCache,
        require: requireSpy,
      });
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
      filesLoader = new FilesLoader(coreInstance, pluginMethods);
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
        coreInstance.settings.get.withArgs("watch").returns(false);
        await filesLoader.init();
        await filesLoader.start();
        expect(libsMocks.stubs.watch.callCount).toEqual(0);
      });

      it("should call to close watcher if watch was enabled previously", async () => {
        coreInstance.settings.get.withArgs("watch").returns(true);
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
      coreInstance.settings.get.withArgs("watch").returns(true);
      await filesLoader.init();
      await filesLoader.start();
      libsMocks.stubs.watch.getCall(0).args[2]();
      await wait();
      expect(filesLoader._loadFiles.callCount).toEqual(2);
    });
  });

  describe("when core settings change", () => {
    it("should enable watch again if path setting is changed", async () => {
      coreInstance.settings.get.withArgs("watch").returns(true);
      await filesLoader.init();
      await filesLoader.start();
      coreInstance.onChangeSettings.getCall(0).args[0]({
        path: "foo-path",
      });
      await wait();
      expect(libsMocks.stubs.watch.callCount).toEqual(2);
    });

    it("should disable watch if watch is changed", async () => {
      coreInstance.settings.get.withArgs("watch").returns(true);
      await filesLoader.init();
      await filesLoader.start();
      coreInstance.settings.get.withArgs("watch").returns(false);
      coreInstance.onChangeSettings.getCall(0).args[0]({
        watch: false,
      });
      await wait();
      expect(libsMocks.stubs.watchClose.callCount).toEqual(1);
    });

    it("should do nothing when no path nor watch are modified", async () => {
      sandbox.stub(filesLoader, "_loadFiles");
      await filesLoader.init();
      await filesLoader.start();
      coreInstance.onChangeSettings.getCall(0).args[0]({
        foo: "foo",
      });
      await wait();
      expect(filesLoader._loadFiles.callCount).toEqual(1);
      expect(libsMocks.stubs.watch.callCount).toEqual(0);
    });
  });
});
