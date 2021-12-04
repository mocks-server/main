/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");
const http = require("http");

const LibsMocks = require("../Libs.mocks.js");
const MocksMocks = require("../mocks-legacy/Mocks.mocks.js");
const CoreMocks = require("../Core.mocks.js");

const Server = require("../../../src/server/Server");
const tracer = require("../../../src/tracer");

const wait = (time = 1000) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

describe("Server", () => {
  let sandbox;
  let callbacks;
  let libsMocks;
  let mocksMocks;
  let coreMocks;
  let coreInstance;
  let processOnStub;
  let server;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    callbacks = {
      addAlert: sandbox.stub(),
      removeAlerts: sandbox.stub(),
    };
    processOnStub = sandbox.stub(process, "on");
    sandbox.stub(process, "exit");
    sandbox.stub(tracer, "error");
    sandbox.stub(tracer, "info");
    sandbox.stub(tracer, "debug");
    libsMocks = new LibsMocks();
    mocksMocks = new MocksMocks();
    coreMocks = new CoreMocks();
    coreInstance = coreMocks.stubs.instance;
    server = new Server(
      coreInstance._eventEmitter,
      coreInstance.settings,
      mocksMocks.stubs.instance,
      coreInstance,
      callbacks
    );
    expect.assertions(1);
    libsMocks.stubs.http.createServer.onListen.delay(200);
  });

  afterEach(() => {
    libsMocks.restore();
    sandbox.restore();
    coreMocks.restore();
    mocksMocks.restore();
  });

  describe("when initialized", () => {
    it("should be listening to process exit signals and stop the server if occurs", async () => {
      processOnStub.callsFake((event, cb) => {
        wait().then(() => {
          cb();
        });
      });
      libsMocks.stubs.http.createServer.onListen.returns(null);
      await server.init();
      await server.start();
      await wait();
      expect(libsMocks.stubs.http.createServer.close.callCount).toEqual(1);
    });
  });

  describe("add custom routers method", () => {
    it("should be registered when initializating http server", async () => {
      const fooRouter = sandbox.spy();
      server.addCustomRouter("fooPath", fooRouter);
      libsMocks.stubs.http.createServer.onListen.returns(null);
      await server.start();
      expect(libsMocks.stubs.express.use.calledWith("fooPath", fooRouter)).toEqual(true);
    });

    it("should reinit and restart the server if it was already started", async () => {
      expect.assertions(3);
      const fooRouter = sandbox.spy();
      libsMocks.stubs.http.createServer.onListen.returns(null);
      await server.start();
      await server.addCustomRouter("fooPath", fooRouter);
      expect(libsMocks.stubs.express.use.calledWith("fooPath", fooRouter)).toEqual(true);
      expect(http.createServer.callCount).toEqual(2);
      expect(libsMocks.stubs.http.createServer.listen.callCount).toEqual(2);
    });

    it("should wait for the server to start, then reinit and restart the server if it was already starting", async () => {
      expect.assertions(3);
      const fooRouter = sandbox.spy();
      libsMocks.stubs.http.createServer.onListen.delay(500);
      libsMocks.stubs.http.createServer.onListen.returns(null);
      server.start();
      server.start();
      server.start();
      await server.addCustomRouter("fooPath", fooRouter);
      expect(libsMocks.stubs.express.use.calledWith("fooPath", fooRouter)).toEqual(true);
      expect(http.createServer.callCount).toEqual(2);
      expect(libsMocks.stubs.http.createServer.listen.callCount).toEqual(2);
    });

    it("should add the router next time server is started if it is stopped", async () => {
      expect.assertions(4);
      const fooRouter = sandbox.spy();
      libsMocks.stubs.http.createServer.onListen.delay(500);
      libsMocks.stubs.http.createServer.onListen.returns(null);
      await server.start();
      await server.stop();
      await server.addCustomRouter("fooPath", fooRouter);
      expect(libsMocks.stubs.express.use.calledWith("fooPath", fooRouter)).toEqual(false);
      await server.start();
      expect(libsMocks.stubs.express.use.calledWith("fooPath", fooRouter)).toEqual(true);
      expect(http.createServer.callCount).toEqual(2);
      expect(libsMocks.stubs.http.createServer.listen.callCount).toEqual(2);
    });
  });

  describe("remove custom routers method", () => {
    it("should not be registered when initializating http server if called before it is started", async () => {
      const fooRouter = sandbox.spy();
      server.addCustomRouter("fooPath", fooRouter);
      server.removeCustomRouter("fooPath", fooRouter);
      libsMocks.stubs.http.createServer.onListen.returns(null);
      await server.start();
      expect(libsMocks.stubs.express.use.calledWith("fooPath", fooRouter)).toEqual(false);
    });

    it("should remove router, reinit and restart the server if it was already started", async () => {
      expect.assertions(4);
      const fooRouter = sandbox.spy();
      libsMocks.stubs.http.createServer.onListen.returns(null);
      server.addCustomRouter("fooPath", fooRouter);
      await server.start();
      expect(libsMocks.stubs.express.use.calledWith("fooPath", fooRouter)).toEqual(true);
      libsMocks.stubs.express.use.reset();
      await server.removeCustomRouter("fooPath", fooRouter);
      expect(libsMocks.stubs.express.use.calledWith("fooPath", fooRouter)).toEqual(false);
      expect(http.createServer.callCount).toEqual(2);
      expect(libsMocks.stubs.http.createServer.listen.callCount).toEqual(2);
    });

    it("should do nothing if router to remove was not registered in same path", async () => {
      expect.assertions(3);
      const fooRouter = sandbox.spy();
      libsMocks.stubs.http.createServer.onListen.returns(null);
      server.addCustomRouter("fooPath", fooRouter);
      await server.start();
      expect(libsMocks.stubs.express.use.calledWith("fooPath", fooRouter)).toEqual(true);
      libsMocks.stubs.express.use.reset();
      await server.removeCustomRouter("foooooPath", fooRouter);
      expect(http.createServer.callCount).toEqual(1);
      expect(libsMocks.stubs.http.createServer.listen.callCount).toEqual(1);
    });

    it("should do nothing if router to remove was not the same registered in the path", async () => {
      expect.assertions(3);
      const fooRouter = sandbox.spy();
      libsMocks.stubs.http.createServer.onListen.returns(null);
      server.addCustomRouter("fooPath", fooRouter);
      await server.start();
      expect(libsMocks.stubs.express.use.calledWith("fooPath", fooRouter)).toEqual(true);
      libsMocks.stubs.express.use.reset();
      await server.removeCustomRouter("fooPath", () => {
        // do nothing
      });
      expect(http.createServer.callCount).toEqual(1);
      expect(libsMocks.stubs.http.createServer.listen.callCount).toEqual(1);
    });

    it("should remove router, wait for the server to start, then reinit and restart the server if it was already starting", async () => {
      expect.assertions(4);
      const fooRouter = sandbox.spy();
      libsMocks.stubs.http.createServer.onListen.delay(500);
      libsMocks.stubs.http.createServer.onListen.returns(null);
      server.addCustomRouter("fooPath", fooRouter);
      server.start();
      await server.start();
      expect(libsMocks.stubs.express.use.calledWith("fooPath", fooRouter)).toEqual(true);
      libsMocks.stubs.express.use.reset();
      await server.stop();
      server.start();
      await server.removeCustomRouter("fooPath", fooRouter);
      expect(libsMocks.stubs.express.use.calledWith("fooPath", fooRouter)).toEqual(false);
      expect(http.createServer.callCount).toEqual(2);
      expect(libsMocks.stubs.http.createServer.listen.callCount).toEqual(3);
    });

    it("should add the router next time server is started if it is stopped", async () => {
      expect.assertions(4);
      const fooRouter = sandbox.spy();
      libsMocks.stubs.http.createServer.onListen.delay(500);
      libsMocks.stubs.http.createServer.onListen.returns(null);
      server.addCustomRouter("fooPath", fooRouter);
      await server.start();
      expect(libsMocks.stubs.express.use.calledWith("fooPath", fooRouter)).toEqual(true);
      libsMocks.stubs.express.use.reset();
      await server.stop();
      await server.removeCustomRouter("fooPath", fooRouter);
      await server.start();
      expect(libsMocks.stubs.express.use.calledWith("fooPath", fooRouter)).toEqual(false);
      expect(http.createServer.callCount).toEqual(2);
      expect(libsMocks.stubs.http.createServer.listen.callCount).toEqual(2);
    });
  });

  describe("when started", () => {
    it("should init server only once", async () => {
      libsMocks.stubs.http.createServer.onListen.returns(null);
      await server.init();
      await server.start();
      await server.start();
      await server.start();
      expect(http.createServer.callCount).toEqual(1);
    });

    it("should add cors middleware if cors option is enabled", async () => {
      libsMocks.stubs.http.createServer.onListen.returns(null);
      coreInstance.settings.get.withArgs("cors").returns(true);
      await server.init();
      await server.start();
      expect(libsMocks.stubs.express.use.callCount).toEqual(9);
    });

    it("should not add cors middleware if cors option is disabled", async () => {
      libsMocks.stubs.http.createServer.onListen.returns(null);
      coreInstance.settings.get.withArgs("cors").returns(false);
      await server.init();
      await server.start();
      expect(libsMocks.stubs.express.use.callCount).toEqual(8);
    });

    it("should reject the promise if an error occurs when calling to server listen method", async () => {
      const error = new Error("Foo error");
      libsMocks.stubs.http.createServer.listen.throws(error);

      await server.init();

      try {
        await server.start();
      } catch (err) {
        expect(err).toEqual(error);
      }
    });

    it("should add an alert if an error occurs when calling to server listen method", async () => {
      const error = new Error("Foo error");
      libsMocks.stubs.http.createServer.listen.throws(error);

      await server.init();

      try {
        await server.start();
      } catch (err) {
        expect(callbacks.addAlert.calledWith("start", "Error starting server", err)).toEqual(true);
      }
    });

    it("should remove start alerts when starts successfully", async () => {
      libsMocks.stubs.http.createServer.onListen.returns(null);
      await server.start();
      expect(callbacks.removeAlerts.calledWith("start")).toEqual(true);
    });

    it("should call to start only once even when called multiple times in parallel", async () => {
      libsMocks.stubs.http.createServer.onListen.returns(null);
      libsMocks.stubs.http.createServer.onListen.delay(200);
      await server.init();
      server.start();
      server.start();
      server.start();
      await server.start();
      expect(libsMocks.stubs.http.createServer.listen.callCount).toEqual(1);
    });

    it("should be listening to server errors and throw an error if occurs", async () => {
      const error = new Error();
      libsMocks.stubs.http.createServer.onError.returns(error);

      try {
        await server.init();
        await server.start();
      } catch (err) {
        expect(callbacks.addAlert.calledWith("server", "Server error", err)).toEqual(true);
      }
    });

    it("should add an alert if server errors", async () => {
      const error = new Error();
      libsMocks.stubs.http.createServer.onError.returns(error);

      try {
        await server.init();
        await server.start();
      } catch (err) {
        expect(err).toEqual(error);
      }
    });

    it("should log the server host and port", async () => {
      libsMocks.stubs.http.createServer.onListen.returns(null);
      coreInstance.settings.get.withArgs("host").returns("0.0.0.0");
      coreInstance.settings.get.withArgs("port").returns(3000);
      await server.start();
      expect(
        tracer.info.calledWith("Server started and listening at http://localhost:3000")
      ).toEqual(true);
    });

    it("should log the server host and port when host is custom", async () => {
      libsMocks.stubs.http.createServer.onListen.returns(null);
      coreInstance.settings.get.withArgs("host").returns("foo-host");
      coreInstance.settings.get.withArgs("port").returns(5000);
      await server.start();
      expect(
        tracer.info.calledWith("Server started and listening at http://foo-host:5000")
      ).toEqual(true);
    });

    it("should not init httpServer more than once", async () => {
      libsMocks.stubs.http.createServer.onListen.returns(null);
      await server.start();
      await server.start();
      await server.start();
      expect(libsMocks.stubs.http.createServer.on.callCount).toEqual(1);
    });

    it("should call to server listen, and resolve the promise when started", async () => {
      libsMocks.stubs.http.createServer.onListen.returns(null);

      await server.init();

      expect(await server.start()).toEqual(server);
    });

    it("should call to server listen, and rejects the promise when starts throw an error", async () => {
      const error = new Error();
      libsMocks.stubs.http.createServer.onListen.returns(new Error());
      await server.init();

      try {
        await server.start();
      } catch (err) {
        expect(err).toEqual(error);
      }
    });
  });

  describe("stop method", () => {
    beforeEach(() => {
      libsMocks.stubs.http.createServer.onListen.returns(null);
    });

    it("should call to stop the server", async () => {
      await server.init();
      await server.start();
      await server.stop();
      expect(libsMocks.stubs.http.createServer.close.callCount).toEqual(1);
    });

    it("should call to stop the server only once while it is stopping", async () => {
      await server.init();
      await server.start();
      server.stop();
      server.stop();
      server.stop();
      await server.stop();
      expect(libsMocks.stubs.http.createServer.close.callCount).toEqual(1);
    });

    it("should not call to stop server if it has not been initialized", async () => {
      await server.init();
      await server.stop();
      expect(libsMocks.stubs.http.createServer.close.callCount).toEqual(0);
    });
  });

  describe("restart method", () => {
    beforeEach(() => {
      libsMocks.stubs.http.createServer.onListen.returns(null);
    });

    it("should call to stop the server", async () => {
      await server.init();
      await server.start();
      await server.restart();
      expect(libsMocks.stubs.http.createServer.close.callCount).toEqual(1);
    });

    it("should call to start server again", async () => {
      await server.init();
      await server.start();
      await server.restart();
      expect(libsMocks.stubs.http.createServer.listen.callCount).toEqual(2);
    });
  });

  describe("error getter", () => {
    it("should return null if there is no error", async () => {
      await server.init();
      expect(server.error).toEqual(null);
    });

    it("should return current error if there was an error", async () => {
      const error = new Error();
      libsMocks.stubs.http.createServer.onListen.returns(new Error());
      await server.init();

      try {
        await server.start();
      } catch (err) {
        expect(server.error).toEqual(error);
      }
    });
  });

  describe("behaviors middleware", () => {
    const fooRequest = {
      method: "get",
      url: "foo-route",
    };
    let resMock;
    let nextSpy;

    beforeEach(async () => {
      resMock = {};
      nextSpy = sandbox.spy();
      libsMocks.stubs.http.createServer.onListen.returns(null);
      coreInstance.settings.get.withArgs("delay").returns(0);
    });

    it("should call to current fixture matching handleRequest method", async () => {
      expect.assertions(3);
      const handleRequestSpy = sandbox.spy();
      mocksMocks.stubs.instance.behaviors.current.getRequestMatchingFixture.returns({
        handleRequest: handleRequestSpy,
      });
      await server.start();

      server._fixturesMiddleware(fooRequest, resMock, nextSpy);
      await wait(10);
      expect(handleRequestSpy.getCall(0).args[0]).toEqual(fooRequest);
      expect(handleRequestSpy.getCall(0).args[1]).toEqual(resMock);
      expect(handleRequestSpy.getCall(0).args[2]).toEqual(nextSpy);
    });

    it("should call next if no matching fixture is found", async () => {
      mocksMocks.stubs.instance.behaviors.current.getRequestMatchingFixture.returns(null);
      await server.start();

      server._fixturesMiddleware(fooRequest, resMock, nextSpy);
      await wait(10);
      expect(nextSpy.callCount).toEqual(1);
    });
  });
});
