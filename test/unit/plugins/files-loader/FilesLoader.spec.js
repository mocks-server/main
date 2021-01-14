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

jest.mock("require-all");

const requireAll = require("require-all");

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

  const fooFiles = {
    file1: {
      _mocksServer_isFile: true,
      behavior1: {
        fixtures: [
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
        ],
        totalFixtures: 1,
        methods: {
          POST: {
            "/api/foo/foo-uri": {
              route: "foo-route-parser",
              response: {
                status: 200,
                body: {
                  fooProperty: "foo",
                },
              },
            },
          },
        },
      },
    },
    file2: {
      _mocksServer_isFile: true,
      behavior2: {
        fixtures: [
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
        ],
        totalFixtures: 1,
        methods: {
          POST: {
            "/api/foo/foo-uri-2": {
              route: "foo-route-parser",
              response: {
                status: 422,
                body: {
                  fooProperty2: "foo2",
                },
              },
            },
          },
        },
      },
    },
    folder: {
      folder2: {
        file: {
          _mocksServer_isFile: true,
          fooProperty: "",
        },
        file2: {
          _mocksServer_isFile: true,
          fooProperty: {
            foo: "foo",
          },
        },
      },
      folder3: {
        file2: 3,
      },
      file5: "foo",
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
      loadLegacyMocks: sandbox.stub(),
      addAlert: sandbox.stub(),
      removeAlerts: sandbox.stub(),
    };
    coreInstance = coreMocks.stubs.instance;
    requireAll.mockImplementation(() => fooFiles);
    filesLoader = new FilesLoader(coreInstance, pluginMethods, {
      requireCache,
    });
    sandbox.stub(path, "isAbsolute").returns(true);
    coreInstance.settings.get.withArgs("path").returns("foo-path");
    libsMocks.stubs.fsExtra.existsSync.returns(true);
  });

  afterEach(async () => {
    await filesLoader.stop();
    libsMocks.restore();
    sandbox.restore();
    coreMocks.restore();
  });

  describe("when initialized", () => {
    it("should call to loadLegacyMocks method with current files contents in a flatten array", async () => {
      await filesLoader.init();
      expect(pluginMethods.loadLegacyMocks.getCall(0).args[0]).toEqual([
        {
          _mocksServer_lastPath: "behavior1",
          fixtures: [
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
          ],
          totalFixtures: 1,
          methods: {
            POST: {
              "/api/foo/foo-uri": {
                route: "foo-route-parser",
                response: {
                  status: 200,
                  body: {
                    fooProperty: "foo",
                  },
                },
              },
            },
          },
        },
        {
          _mocksServer_lastPath: "file1",
          behavior1: {
            _mocksServer_lastPath: "behavior1",
            fixtures: [
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
            ],
            totalFixtures: 1,
            methods: {
              POST: {
                "/api/foo/foo-uri": {
                  route: "foo-route-parser",
                  response: {
                    status: 200,
                    body: {
                      fooProperty: "foo",
                    },
                  },
                },
              },
            },
          },
        },
        {
          _mocksServer_lastPath: "behavior2",
          fixtures: [
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
          ],
          totalFixtures: 1,
          methods: {
            POST: {
              "/api/foo/foo-uri-2": {
                route: "foo-route-parser",
                response: {
                  status: 422,
                  body: {
                    fooProperty2: "foo2",
                  },
                },
              },
            },
          },
        },
        {
          _mocksServer_lastPath: "file2",
          behavior2: {
            _mocksServer_lastPath: "behavior2",
            fixtures: [
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
            ],
            totalFixtures: 1,
            methods: {
              POST: {
                "/api/foo/foo-uri-2": {
                  route: "foo-route-parser",
                  response: {
                    status: 422,
                    body: {
                      fooProperty2: "foo2",
                    },
                  },
                },
              },
            },
          },
        },
        {
          _mocksServer_lastPath: "file",
          fooProperty: "",
        },
        {
          _mocksServer_lastPath: "fooProperty",
          foo: "foo",
        },
        {
          _mocksServer_lastPath: "file2",
          fooProperty: {
            _mocksServer_lastPath: "fooProperty",
            foo: "foo",
          },
        },
      ]);
    });

    it("should have displayName defined", async () => {
      expect(filesLoader.displayName).toEqual("@mocks-server/core/plugin-files-loader");
    });

    it("should require all files from mocks folders calculating it from cwd", async () => {
      path.isAbsolute.returns(false);
      await filesLoader.init();
      expect(requireAll.mock.calls[0][0].dirname).toEqual(path.resolve(process.cwd(), "foo-path"));
    });

    it("should not throw and add an alert if there is an error loading files", async () => {
      coreInstance.tracer.silly.throws(new Error());
      await filesLoader.init();
      expect(pluginMethods.addAlert.calledWith("load")).toEqual(true);
    });

    it("should remove alerts if there is are no errors loading files", async () => {
      await filesLoader.init();
      expect(pluginMethods.removeAlerts.calledWith("load")).toEqual(true);
    });

    it("should require all files from exactly mocks folder if it is absolute", async () => {
      await filesLoader.init();
      expect(requireAll.mock.calls[0][0].dirname).toEqual("foo-path");
    });

    it("should add extension to json files to avoid conflicts", async () => {
      await filesLoader.init();
      expect(requireAll.mock.calls[0][0].map("foo", "foo-path/foo.json")).toEqual("foo.json");
    });

    it("should not add extension to js files", async () => {
      await filesLoader.init();
      expect(requireAll.mock.calls[0][0].map("foo", "foo-path/foo.js")).toEqual("foo");
    });

    it("should require all files adding a _mocksServer_isFile property to their content", async () => {
      await filesLoader.init();
      expect(requireAll.mock.calls[0][0].resolve({ foo: "foo" })).toEqual({
        foo: "foo",
        _mocksServer_isFile: true,
      });
    });

    it("should ensure that defined mocks folder exists", async () => {
      await filesLoader.init();
      expect(libsMocks.stubs.fsExtra.ensureDirSync.calledWith("foo-path")).toEqual(true);
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
      coreInstance.settings.get.withArgs("watch").returns(true);
      await filesLoader.init();
      await filesLoader.start();
      libsMocks.stubs.watch.getCall(0).args[2]();
      await wait();
      expect(requireAll.mock.calls.length).toEqual(2);
    });
  });

  describe("when core settings change", () => {
    it("should load files again if path setting is changed", async () => {
      await filesLoader.init();
      coreInstance.onChangeSettings.getCall(0).args[0]({
        path: "foo-path",
      });
      await wait();
      expect(requireAll.mock.calls.length).toEqual(2);
    });

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

    it("should do nothing if no path or watch settings are changed", async () => {
      expect.assertions(3);
      coreInstance.settings.get.withArgs("watch").returns(true);
      await filesLoader.init();
      await filesLoader.start();
      coreInstance.onChangeSettings.getCall(0).args[0]({});
      await wait();
      expect(requireAll.mock.calls.length).toEqual(1);
      expect(libsMocks.stubs.watch.callCount).toEqual(1);
      expect(libsMocks.stubs.watchClose.callCount).toEqual(0);
    });
  });
});
