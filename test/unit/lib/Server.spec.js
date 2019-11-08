/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const path = require("path");

const sinon = require("sinon");
const _ = require("lodash");

const LibsMocks = require("../common/Libs.mocks.js");
const ApiMocks = require("../api/Api.mocks.js");
const FeaturesMocks = require("../features/Features.mocks.js");
const SettingsMocks = require("./Settings.mocks.js");

const Server = require("../../../lib/Server");

const FOO_FEATURES_PATH = "foo-path";

describe("Server", () => {
  let server;
  let sandbox;
  let featuresMocks;
  let settingsMocks;
  let apiMocks;
  let libsMocks;
  let processOnStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

    processOnStub = sandbox.stub(process, "on");
    sandbox.stub(_, "delay").callsFake(cb => cb());
    sandbox.stub(_, "debounce").callsFake(cb => cb);
    sandbox.spy(console, "warn");
    libsMocks = new LibsMocks();
    apiMocks = new ApiMocks();
    settingsMocks = new SettingsMocks();
    featuresMocks = new FeaturesMocks();
    expect.assertions(1);
  });

  afterEach(() => {
    libsMocks.restore();
    apiMocks.restore();
    featuresMocks.restore();
    settingsMocks.restore();
    sandbox.restore();
  });

  describe("when instantiated", () => {
    it("should call to create Behaviors passing the provided features folder relative to current cwd", () => {
      server = new Server(FOO_FEATURES_PATH);
      expect(featuresMocks.stubs.Constructor.mock.calls[0]).toEqual([
        path.resolve(process.cwd(), "foo-path"),
        null,
        {
          recursive: true
        }
      ]);
    });

    it("should throw an error if no features folder is provided", () => {
      try {
        new Server();
      } catch (err) {
        expect(err.message).toEqual(expect.stringContaining("Please provide a path"));
      }
    });

    it("should call to create Behaviors passing the provided features folder as absolute if it is absolute", () => {
      server = new Server("/foo-path");
      expect(featuresMocks.stubs.Constructor.mock.calls[0]).toEqual([
        "/foo-path",
        null,
        {
          recursive: true
        }
      ]);
    });

    it("should call to create Behaviors passing the current feature if it is defined in options", () => {
      server = new Server("/foo-path", {
        feature: "foo-feature"
      });
      expect(featuresMocks.stubs.Constructor.mock.calls[0]).toEqual([
        "/foo-path",
        "foo-feature",
        {
          recursive: true
        }
      ]);
    });

    it("should print a warning if feature option is received and behavior option not", () => {
      server = new Server("/foo-path", {
        feature: "foo-feature"
      });
      expect(console.warn.getCall(0).args[0]).toEqual(
        expect.stringContaining("Deprecation warning:")
      );
    });

    it("should call to create Behaviors passing the current behavior if it is defined in options", () => {
      server = new Server("/foo-path", {
        behavior: "foo-behavior"
      });
      expect(featuresMocks.stubs.Constructor.mock.calls[0]).toEqual([
        "/foo-path",
        "foo-behavior",
        {
          recursive: true
        }
      ]);
    });

    it('should call to create Api and use its router under the "/mocks" path of the server', () => {
      server = new Server(FOO_FEATURES_PATH);
      expect(
        libsMocks.stubs.express.use.calledWith("/mocks", apiMocks.stubs.instance.router)
      ).toEqual(true);
    });

    it("should be listening to server errors and throw an error if occurs", () => {
      const error = new Error("foo error message");
      libsMocks.stubs.http.createServer.onError.returns(error);

      try {
        server = new Server(FOO_FEATURES_PATH);
      } catch (err) {
        expect(err).toEqual(error);
      }
    });

    it("should be listening to process exit signals and stop the server if occurs", () => {
      processOnStub.callsFake((event, cb) => {
        cb();
      });

      server = new Server(FOO_FEATURES_PATH);

      expect(libsMocks.stubs.http.createServer.close.callCount).toEqual(1);
    });
  });

  describe("start method", () => {
    it("should call to server listen, and resolve the promise when started", async () => {
      libsMocks.stubs.http.createServer.onListen.returns(null);

      server = new Server(FOO_FEATURES_PATH);

      expect(await server.start()).toEqual(server);
    });

    it("should call to server listen, and rejects the promise when starts throw an error", async () => {
      const error = new Error();
      libsMocks.stubs.http.createServer.onListen.returns(new Error());
      server = new Server(FOO_FEATURES_PATH);

      try {
        await server.start();
      } catch (err) {
        expect(err).toEqual(error);
      }
    });
  });

  describe("restart method", () => {
    beforeEach(() => {
      libsMocks.stubs.http.createServer.onListen.returns(null);
    });

    it("should call to stop the server", async () => {
      server = new Server(FOO_FEATURES_PATH);
      await server.start();
      await server.restart();
      expect(libsMocks.stubs.http.createServer.close.callCount).toEqual(1);
    });

    it("should call to create Features again", async () => {
      server = new Server(FOO_FEATURES_PATH);
      await server.start();
      await server.restart();
      expect(featuresMocks.stubs.Constructor.mock.calls.length).toEqual(2);
    });

    it("should call to start server again", async () => {
      server = new Server(FOO_FEATURES_PATH);
      await server.start();
      await server.restart();
      expect(libsMocks.stubs.http.createServer.listen.callCount).toEqual(2);
    });
  });

  describe("settings getter", () => {
    it("should return current settings", async () => {
      server = new Server(FOO_FEATURES_PATH);
      expect(server.settings).toEqual(settingsMocks.stubs.instance);
    });
  });

  describe("features getter", () => {
    it("should return current features", async () => {
      server = new Server(FOO_FEATURES_PATH);
      expect(server.features).toEqual(featuresMocks.stubs.instance);
    });
  });

  describe("watchEnabled getter", () => {
    it("should return current watch status", async () => {
      server = new Server(FOO_FEATURES_PATH);
      expect(server.watchEnabled).toEqual(true);
    });
  });

  describe("error getter", () => {
    it("should return null if there is no error", async () => {
      server = new Server(FOO_FEATURES_PATH);
      expect(server.error).toEqual(null);
    });

    it("should return current error if there was an error", async () => {
      const error = new Error();
      libsMocks.stubs.http.createServer.onListen.returns(new Error());
      server = new Server(FOO_FEATURES_PATH);

      try {
        await server.start();
      } catch (err) {
        expect(server.error).toEqual(error);
      }
    });
  });

  describe("events getter", () => {
    it("should return server eventEmitter", async () => {
      server = new Server(FOO_FEATURES_PATH);
      expect(server.events).toEqual(server._eventEmitter);
    });
  });

  describe("switchWatch method", () => {
    describe("when switching off", () => {
      it("should do nothing if watch was not enabled", async () => {
        server = new Server(FOO_FEATURES_PATH, {
          watch: false
        });
        server.switchWatch(false);
        expect(libsMocks.stubs.watch.callCount).toEqual(0);
      });

      it("should call to close watcher if watch was enabled", async () => {
        server = new Server(FOO_FEATURES_PATH, {
          watch: true
        });
        server.switchWatch(false);
        expect(libsMocks.stubs.watchClose.callCount).toEqual(1);
      });
    });
  });

  describe("when watch detect changes", () => {
    beforeEach(() => {
      libsMocks.stubs.http.createServer.onListen.returns(null);
    });

    it("should call to stop the server", async () => {
      libsMocks.stubs.watch.triggerChange(true);
      server = new Server(FOO_FEATURES_PATH, { watch: false });
      await server.start();
      server.switchWatch(true);
      expect(libsMocks.stubs.http.createServer.close.callCount).toEqual(1);
    });

    it("should call to create Features again", async () => {
      libsMocks.stubs.watch.triggerChange(true);
      server = new Server(FOO_FEATURES_PATH, { watch: false });
      await server.start();
      server.switchWatch(true);
      expect(featuresMocks.stubs.Constructor.mock.calls.length).toEqual(2);
    });

    it("should call to start server again", async () => {
      libsMocks.stubs.watch.triggerChange(true);
      server = new Server(FOO_FEATURES_PATH, { watch: false });
      await server.start();
      server.switchWatch(true);
      expect(libsMocks.stubs.http.createServer.listen.callCount).toEqual(2);
    });

    it("should set server error if an error occurs loading features", async () => {
      const fooError = new Error();
      libsMocks.stubs.watch.triggerChange(true);
      server = new Server(FOO_FEATURES_PATH, { watch: false });
      await server.start();
      libsMocks.stubs.express.use.throws(fooError);
      await server.switchWatch(true);
      expect(server.error).toEqual(fooError);
    });

    it("should emit a watch-reload event after restarting", async done => {
      libsMocks.stubs.watch.triggerChange(true);
      server = new Server(FOO_FEATURES_PATH, { watch: false });
      server.start();
      server.events.on("watch-reload", () => {
        expect(libsMocks.stubs.http.createServer.listen.callCount).toEqual(2);
        done();
      });
      server.switchWatch(true);
    });
  });

  describe("features middleware", () => {
    const fooRequest = {
      method: "get",
      url: "foo-route"
    };
    let statusSpy;
    let sendSpy;
    let resMock;
    let nextSpy;

    beforeEach(() => {
      statusSpy = sandbox.spy();
      sendSpy = sandbox.spy();
      resMock = {
        status: statusSpy,
        send: sendSpy
      };
      nextSpy = sandbox.spy();
    });

    it("should call next if does not found a fixture in current feature matching the request url", async () => {
      server = new Server(FOO_FEATURES_PATH);

      server.featuresMiddleWare(fooRequest, resMock, nextSpy);
      expect(nextSpy.callCount).toEqual(1);
    });

    it("should call to response status method to set the matching fixture status code", async () => {
      server = new Server(FOO_FEATURES_PATH);
      featuresMocks.stubs.instance.current = {
        get: {
          "foo-route": {
            route: {
              match: () => true
            },
            response: {
              status: 200
            }
          }
        }
      };
      server.featuresMiddleWare(fooRequest, resMock, nextSpy);
      expect(resMock.status.getCall(0).args[0]).toEqual(200);
    });

    it("should call to response send method passing the matching fixture body", async () => {
      const fooBody = {
        foo: "foo-data"
      };
      server = new Server(FOO_FEATURES_PATH);
      featuresMocks.stubs.instance.current = {
        get: {
          "foo-route": {
            route: {
              match: () => true
            },
            response: {
              status: 200,
              body: fooBody
            }
          }
        }
      };
      server.featuresMiddleWare(fooRequest, resMock, nextSpy);
      expect(resMock.send.getCall(0).args[0]).toEqual(fooBody);
    });

    it("should call to fixture response method passing all request data if it is a function", async () => {
      const responseSpy = sandbox.spy();
      server = new Server(FOO_FEATURES_PATH);
      featuresMocks.stubs.instance.current = {
        get: {
          "foo-route": {
            route: {
              match: () => true
            },
            response: responseSpy
          }
        }
      };
      server.featuresMiddleWare(fooRequest, resMock, nextSpy);
      expect(responseSpy.calledWith(fooRequest, resMock, nextSpy)).toEqual(true);
    });
  });
});
