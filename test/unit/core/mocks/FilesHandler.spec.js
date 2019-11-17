/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const path = require("path");
const sinon = require("sinon");
const Boom = require("boom");
const { cloneDeep } = require("lodash");

jest.mock("require-all");

const requireAll = require("require-all");

const LibsMocks = require("../../Libs.mocks.js");
const CoreMocks = require("../Core.mocks.js");

const FilesHandler = require("../../../../lib/core/mocks/FilesHandler");
const tracer = require("../../../../lib/core/tracer");

const wait = () => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, 1000);
  });
};

describe("Behaviors", () => {
  const fooRequireCache = {
    "foo-path": {
      id: "foo-path",
      children: {
        "foo-path/foo-children": {
          id: "foo-path/foo-children"
        }
      }
    },
    "foo-path/foo-children": {
      id: "foo-path/foo-children",
      children: {
        "foo-path/foo-children-2": {
          id: "foo-path/foo-children-2"
        }
      }
    },
    "foo-path/foo-children-2": {
      id: "foo-path/foo-children-2",
      children: {
        "foo-children-3": {
          id: "foo-children-3"
        }
      }
    },
    "foo-not-children": {
      id: "foo-not-children"
    }
  };

  const fooFiles = {
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

  const fooBoomError = new Error("foo boom error");
  let sandbox;
  let coreMocks;
  let coreInstance;
  let requireCache;
  let filesHandler;
  let libsMocks;

  beforeEach(async () => {
    requireCache = cloneDeep(fooRequireCache);
    sandbox = sinon.createSandbox();
    sandbox.stub(Boom, "badData").returns(fooBoomError);
    coreMocks = new CoreMocks();
    libsMocks = new LibsMocks();
    coreInstance = coreMocks.stubs.instance;
    sandbox.stub(tracer, "error");
    sandbox.stub(tracer, "info");
    sandbox.stub(tracer, "debug");
    requireAll.mockImplementation(() => fooFiles);
    filesHandler = new FilesHandler(coreInstance.settings, coreInstance._eventEmitter, {
      requireCache
    });
    sandbox.stub(path, "isAbsolute").returns(true);
    coreInstance.settings.get.withArgs("behaviors").returns("foo-path");
  });

  afterEach(() => {
    libsMocks.restore();
    sandbox.restore();
    coreMocks.restore();
  });

  describe("when initialized", () => {
    it("should require all files from mocks folders calculating it from cwd", async () => {
      path.isAbsolute.returns(false);
      await filesHandler.init();
      expect(requireAll).toHaveBeenCalledWith({
        dirname: path.resolve(process.cwd(), "foo-path"),
        recursive: true
      });
    });

    it("should require all files from exactly mocks folder if it is absolute", async () => {
      await filesHandler.init();
      expect(requireAll).toHaveBeenCalledWith({
        dirname: "foo-path",
        recursive: true
      });
    });

    it("should throw an error if mocks folder is not defined", async () => {
      expect.assertions(1);
      try {
        coreInstance.settings.get.withArgs("behaviors").returns(undefined);
        await filesHandler.init();
      } catch (error) {
        expect(error).toEqual(fooBoomError);
      }
    });

    it("should clean require cache for behaviors folder", async () => {
      const fooCachePath = "foo-path";

      expect(requireCache[fooCachePath]).toBeDefined();
      await filesHandler.init();
      expect(requireCache[fooCachePath]).not.toBeDefined();
    });

    it("should require cache in order to found the behaviors folder", async () => {
      filesHandler = new FilesHandler(coreInstance.settings, coreInstance._eventEmitter);
      sandbox.spy(filesHandler, "_cleanRequireCache");
      await filesHandler.init();
      // it seems like require cache is empty in jest environment
      expect(filesHandler._cleanRequireCache.callCount).toEqual(0);
    });

    it("should clean require cache for behaviors folder childs", async () => {
      const fooCachePath = "foo-path/foo-children";

      expect(requireCache[fooCachePath]).toBeDefined();
      await filesHandler.init();
      expect(requireCache[fooCachePath]).not.toBeDefined();
    });

    it("should clean require cache for behaviors folder childs recursively", async () => {
      const fooCachePath = "foo-path/foo-children-2";

      expect(requireCache[fooCachePath]).toBeDefined();
      await filesHandler.init();
      expect(requireCache[fooCachePath]).not.toBeDefined();
    });
  });

  describe("files getter", () => {
    it("should return current files", async () => {
      await filesHandler.init();
      expect(filesHandler.files).toEqual(fooFiles);
    });
  });

  describe("start method", () => {
    describe("when starting files watch", () => {
      it("should do nothing if watch was not enabled", async () => {
        coreInstance.settings.get.withArgs("watch").returns(false);
        await filesHandler.init();
        await filesHandler.start();
        expect(libsMocks.stubs.watch.callCount).toEqual(0);
      });

      it("should call to close watcher if watch was enabled previously", async () => {
        coreInstance.settings.get.withArgs("watch").returns(true);
        await filesHandler.init();
        await filesHandler.start();
        await filesHandler.start();
        expect(libsMocks.stubs.watchClose.callCount).toEqual(1);
      });
    });
  });

  describe("when a file is changed", () => {
    it("should load files again", async () => {
      coreInstance.settings.get.withArgs("watch").returns(true);
      await filesHandler.init();
      await filesHandler.start();
      libsMocks.stubs.watch.getCall(0).args[2]();
      await wait();
      expect(requireAll.mock.calls.length).toEqual(2);
    });
  });

  describe("when core settings change", () => {
    it("should load files again if behaviors setting is changed", async () => {
      await filesHandler.init();
      coreInstance._eventEmitter.on.getCall(0).args[1]({
        behaviors: "foo-path"
      });
      await wait();
      expect(requireAll.mock.calls.length).toEqual(2);
    });

    it("should enable watch again if behaviors setting is changed", async () => {
      coreInstance.settings.get.withArgs("watch").returns(true);
      await filesHandler.init();
      await filesHandler.start();
      coreInstance._eventEmitter.on.getCall(0).args[1]({
        behaviors: "foo-path"
      });
      await wait();
      expect(libsMocks.stubs.watch.callCount).toEqual(2);
    });

    it("should disable watch if watch is changed", async () => {
      coreInstance.settings.get.withArgs("watch").returns(true);
      await filesHandler.init();
      await filesHandler.start();
      coreInstance.settings.get.withArgs("watch").returns(false);
      coreInstance._eventEmitter.on.getCall(0).args[1]({
        watch: false
      });
      await wait();
      expect(libsMocks.stubs.watchClose.callCount).toEqual(1);
    });

    it("should do nothing if no behaviors or watch settings are changed", async () => {
      expect.assertions(3);
      coreInstance.settings.get.withArgs("watch").returns(true);
      await filesHandler.init();
      await filesHandler.start();
      coreInstance._eventEmitter.on.getCall(0).args[1]({});
      await wait();
      expect(requireAll.mock.calls.length).toEqual(1);
      expect(libsMocks.stubs.watch.callCount).toEqual(1);
      expect(libsMocks.stubs.watchClose.callCount).toEqual(0);
    });
  });
});
