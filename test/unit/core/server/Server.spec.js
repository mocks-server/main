/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const LibsMocks = require("../../Libs.mocks.js");
const MocksMocks = require("../mocks/Mocks.mocks.js");
const CoreMocks = require("../Core.mocks.js");

const Server = require("../../../../src/server/Server");
const tracer = require("../../../../src/tracer");

const wait = (time = 1000) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

describe("Server", () => {
  let sandbox;
  let libsMocks;
  let mocksMocks;
  let coreMocks;
  let coreInstance;
  let processOnStub;
  let server;

  beforeEach(() => {
    sandbox = sinon.createSandbox();

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
      mocksMocks.stubs.instance,
      coreInstance.settings,
      coreInstance._eventEmitter
    );
    expect.assertions(1);
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

  describe("when settings change", () => {
    it("should restart the server when port changes", async () => {
      expect.assertions(2);
      libsMocks.stubs.http.createServer.onListen.returns(null);
      await server.init();
      await server.start();
      coreInstance._eventEmitter.on.getCall(0).args[1]({
        port: 4540
      });
      await wait();
      expect(libsMocks.stubs.http.createServer.close.callCount).toEqual(1);
      expect(libsMocks.stubs.http.createServer.listen.callCount).toEqual(2);
    });

    it("should restart the server when host changes", async () => {
      expect.assertions(2);
      libsMocks.stubs.http.createServer.onListen.returns(null);
      await server.init();
      await server.start();
      coreInstance._eventEmitter.on.getCall(0).args[1]({
        host: "foo-new-host"
      });
      await wait();
      expect(libsMocks.stubs.http.createServer.close.callCount).toEqual(1);
      expect(libsMocks.stubs.http.createServer.listen.callCount).toEqual(2);
    });

    it("should do nothing when no port nor host are changed", async () => {
      expect.assertions(2);
      libsMocks.stubs.http.createServer.onListen.returns(null);
      await server.init();
      await server.start();
      coreInstance._eventEmitter.on.getCall(0).args[1]({
        foo: true
      });
      await wait();
      expect(libsMocks.stubs.http.createServer.close.callCount).toEqual(0);
      expect(libsMocks.stubs.http.createServer.listen.callCount).toEqual(1);
    });
  });

  describe("custom routers", () => {
    it("should be registered when initializating http server", async () => {
      const fooRouter = sandbox.spy();
      server.addCustomRouter("fooPath", fooRouter);
      libsMocks.stubs.http.createServer.onListen.returns(null);
      await server.start();
      expect(libsMocks.stubs.express.use.calledWith("fooPath", fooRouter)).toEqual(true);
    });
  });

  describe("when started", () => {
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

    it("should be listening to server errors and throw an error if occurs", async () => {
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
      url: "foo-route"
    };
    let statusSpy;
    let sendSpy;
    let resMock;
    let nextSpy;

    beforeEach(async () => {
      statusSpy = sandbox.spy();
      sendSpy = sandbox.spy();
      resMock = {
        status: statusSpy,
        send: sendSpy
      };
      nextSpy = sandbox.spy();
      libsMocks.stubs.http.createServer.onListen.returns(null);
      coreInstance.settings.get.withArgs("delay").returns(0);
    });

    it("should call next if does not found a fixture in current feature matching the request url", async () => {
      await server.start();

      server._fixturesMiddleware(fooRequest, resMock, nextSpy);
      expect(nextSpy.callCount).toEqual(1);
    });

    it("should call to response status method to set the matching fixture status code", async () => {
      await server.start();
      mocksMocks.stubs.instance.behaviors.current = {
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
      server._fixturesMiddleware(fooRequest, resMock, nextSpy);
      await wait(200);
      expect(resMock.status.getCall(0).args[0]).toEqual(200);
    });

    it("should call to response send method passing the matching fixture body", async () => {
      const fooBody = {
        foo: "foo-data"
      };
      await server.start();
      mocksMocks.stubs.instance.behaviors.current = {
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
      server._fixturesMiddleware(fooRequest, resMock, nextSpy);
      await wait(200);
      expect(resMock.send.getCall(0).args[0]).toEqual(fooBody);
    });

    it("should call to fixture response method passing all request data if it is a function", async () => {
      const responseSpy = sandbox.spy();
      await server.start();
      mocksMocks.stubs.instance.behaviors.current = {
        get: {
          "foo-route": {
            route: {
              match: () => true
            },
            response: responseSpy
          }
        }
      };
      server._fixturesMiddleware(fooRequest, resMock, nextSpy);
      await wait(200);
      expect(responseSpy.calledWith(fooRequest, resMock, nextSpy)).toEqual(true);
    });
  });
});
