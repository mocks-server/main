/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");
const fsExtra = require("fs-extra");
const http = require("http");
const { Logger } = require("@mocks-server/logger");

const LibsMocks = require("../common/Libs.mocks");
const ConfigMock = require("../common/Config.mocks");
const { Alerts } = require("../../../src/alerts/Alerts");
const bodyParser = require("body-parser");

const { Server } = require("../../../src/server/Server");

jest.mock("body-parser");

const wait = (time = 1000) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

describe("Server", () => {
  let configMock;
  let sandbox;
  let callbacks;
  let libsMocks;
  let processOnStub;
  let server;
  let mockOptions;
  let alerts,
    logger,
    optionHost,
    optionPort,
    optionCorsEnabled,
    optionCorsOptions,
    optionJsonBodyParserEnabled,
    optionJsonBodyParserOptions,
    optionUrlEncodedBodyParserEnabled,
    optionUrlEncodedBodyParserOptions,
    optionHttpsEnabled,
    optionHttpsCert,
    optionHttpsKey;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    configMock = new ConfigMock();

    processOnStub = sandbox.stub(process, "on");
    sandbox.stub(process, "exit");
    sandbox.stub(Logger.prototype, "error");
    sandbox.stub(Logger.prototype, "info");
    sandbox.stub(Logger.prototype, "debug");
    sandbox.stub(fsExtra, "readFileSync");
    bodyParser.json = sandbox.stub();
    bodyParser.urlencoded = sandbox.stub();

    logger = new Logger();
    alerts = new Alerts("server", { logger });
    callbacks = {
      config: configMock.stubs.namespace,
      alerts,
      logger,
    };

    libsMocks = new LibsMocks();
    server = new Server(callbacks);
    mockOptions = () => {
      optionHost = { ...server._optionCli, value: true };
      optionPort = { ...server._optionEmojis, value: true };
      optionCorsEnabled = { ...server._optionLog, value: true };
      optionCorsOptions = { ...server._optionDelay, value: { preflightContinue: false } };
      optionJsonBodyParserEnabled = { ...server._optionHost, value: true };
      optionJsonBodyParserOptions = { ...server._optionWatch, value: { extended: true } };
      optionUrlEncodedBodyParserEnabled = { ...server._optionMock, value: true };
      optionUrlEncodedBodyParserOptions = { ...server._optionMock, value: {} };
      optionHttpsEnabled = { ...server._httpsEnabledOption, value: false };
      optionHttpsCert = { ...server._httpsCertOption, value: "" };
      optionHttpsKey = { ...server._httpsKeyOption, value: "" };

      server._httpsEnabledOption = optionHttpsEnabled;
      server._httpsCertOption = optionHttpsCert;
      server._httpsKeyOption = optionHttpsKey;

      server._hostOption = optionHost;
      server._portOption = optionPort;
      server._corsEnabledOption = optionCorsEnabled;
      server._corsOptionsOption = optionCorsOptions;
      server._jsonBodyParserEnabledOption = optionJsonBodyParserEnabled;
      server._jsonBodyParserOptionsOption = optionJsonBodyParserOptions;
      server._urlEncodedBodyParserEnabledOption = optionUrlEncodedBodyParserEnabled;
      server._urlEncodedBodyParserOptionsOption = optionUrlEncodedBodyParserOptions;
    };
    mockOptions();
    expect.assertions(1);
    libsMocks.stubs.http.createServer.onListen.delay(200);
  });

  afterEach(() => {
    libsMocks.restore();
    sandbox.restore();
  });

  describe("id", () => {
    it("should return server", async () => {
      expect(Server.id).toEqual("server");
    });
  });

  describe("when initialized", () => {
    it("should be listening to process exit signals and stop the server if occurs", async () => {
      processOnStub.callsFake((_event, cb) => {
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
      server.addRouter("fooPath", fooRouter);
      libsMocks.stubs.http.createServer.onListen.returns(null);
      await server.start();
      expect(libsMocks.stubs.express.use.calledWith("fooPath", fooRouter)).toEqual(true);
    });

    it("should reinit and restart the server if it was already started", async () => {
      expect.assertions(3);
      const fooRouter = sandbox.spy();
      libsMocks.stubs.http.createServer.onListen.returns(null);
      await server.start();
      await server.addRouter("fooPath", fooRouter);
      expect(libsMocks.stubs.express.use.calledWith("fooPath", fooRouter)).toEqual(true);
      expect(http.createServer.mock.calls.length).toEqual(2);
      expect(libsMocks.stubs.http.createServer.listen.callCount).toEqual(2);
    });

    it("should wait for the server to start, then reinit and restart the server if it was already starting", async () => {
      expect.assertions(3);
      const fooRouter = sandbox.spy();
      libsMocks.stubs.http.createServer.onListen.delay(1000);
      libsMocks.stubs.http.createServer.onListen.returns(null);
      await server.start();
      await server.stop();
      const waitForServerStarting = async () => {
        return new Promise((resolve) => {
          const interval = setInterval(() => {
            if (server._serverStartingPromise) {
              clearInterval(interval);
              resolve();
            }
          }, 100);
        });
      };
      server.start();
      await waitForServerStarting();
      await server.addRouter("fooPath", fooRouter);
      expect(libsMocks.stubs.express.use.calledWith("fooPath", fooRouter)).toEqual(true);
      expect(http.createServer.mock.calls.length).toEqual(2);
      expect(libsMocks.stubs.http.createServer.listen.callCount).toEqual(3);
    });

    it("should add the router next time server is started if it is stopped", async () => {
      expect.assertions(4);
      const fooRouter = sandbox.spy();
      libsMocks.stubs.http.createServer.onListen.delay(500);
      libsMocks.stubs.http.createServer.onListen.returns(null);
      await server.start();
      await server.stop();
      await server.addRouter("fooPath", fooRouter);
      expect(libsMocks.stubs.express.use.calledWith("fooPath", fooRouter)).toEqual(false);
      await server.start();
      expect(libsMocks.stubs.express.use.calledWith("fooPath", fooRouter)).toEqual(true);
      expect(http.createServer.mock.calls.length).toEqual(2);
      expect(libsMocks.stubs.http.createServer.listen.callCount).toEqual(2);
    });
  });

  describe("remove custom routers method", () => {
    it("should not be registered when initializating http server if called before it is started", async () => {
      const fooRouter = sandbox.spy();
      server.addRouter("fooPath", fooRouter);
      server.removeRouter("fooPath", fooRouter);
      libsMocks.stubs.http.createServer.onListen.returns(null);
      await server.start();
      expect(libsMocks.stubs.express.use.calledWith("fooPath", fooRouter)).toEqual(false);
    });

    it("should remove router, reinit and restart the server if it was already started", async () => {
      expect.assertions(4);
      const fooRouter = sandbox.spy();
      libsMocks.stubs.http.createServer.onListen.returns(null);
      server.addRouter("fooPath", fooRouter);
      await server.start();
      expect(libsMocks.stubs.express.use.calledWith("fooPath", fooRouter)).toEqual(true);
      libsMocks.stubs.express.use.reset();
      await server.removeRouter("fooPath", fooRouter);
      expect(libsMocks.stubs.express.use.calledWith("fooPath", fooRouter)).toEqual(false);
      expect(http.createServer.mock.calls.length).toEqual(2);
      expect(libsMocks.stubs.http.createServer.listen.callCount).toEqual(2);
    });

    it("should do nothing if router to remove was not registered in same path", async () => {
      expect.assertions(3);
      const fooRouter = sandbox.spy();
      libsMocks.stubs.http.createServer.onListen.returns(null);
      server.addRouter("fooPath", fooRouter);
      await server.start();
      expect(libsMocks.stubs.express.use.calledWith("fooPath", fooRouter)).toEqual(true);
      libsMocks.stubs.express.use.reset();
      await server.removeRouter("foooooPath", fooRouter);
      expect(http.createServer.mock.calls.length).toEqual(1);
      expect(libsMocks.stubs.http.createServer.listen.callCount).toEqual(1);
    });

    it("should do nothing if router to remove was not the same registered in the path", async () => {
      expect.assertions(3);
      const fooRouter = sandbox.spy();
      libsMocks.stubs.http.createServer.onListen.returns(null);
      server.addRouter("fooPath", fooRouter);
      await server.start();
      expect(libsMocks.stubs.express.use.calledWith("fooPath", fooRouter)).toEqual(true);
      libsMocks.stubs.express.use.reset();
      await server.removeRouter("fooPath", () => {
        // do nothing
      });
      expect(http.createServer.mock.calls.length).toEqual(1);
      expect(libsMocks.stubs.http.createServer.listen.callCount).toEqual(1);
    });

    it("should remove router, wait for the server to start, then reinit and restart the server if it was already starting", async () => {
      expect.assertions(4);
      const fooRouter = sandbox.spy();
      libsMocks.stubs.http.createServer.onListen.delay(500);
      libsMocks.stubs.http.createServer.onListen.returns(null);
      server.addRouter("fooPath", fooRouter);
      server.start();
      await server.start();
      expect(libsMocks.stubs.express.use.calledWith("fooPath", fooRouter)).toEqual(true);
      libsMocks.stubs.express.use.reset();
      await server.stop();
      server.start();
      await server.removeRouter("fooPath", fooRouter);
      expect(libsMocks.stubs.express.use.calledWith("fooPath", fooRouter)).toEqual(false);
      expect(http.createServer.mock.calls.length).toEqual(2);
      expect(libsMocks.stubs.http.createServer.listen.callCount).toEqual(2);
    });

    it("should add the router next time server is started if it is stopped", async () => {
      expect.assertions(4);
      const fooRouter = sandbox.spy();
      libsMocks.stubs.http.createServer.onListen.delay(500);
      libsMocks.stubs.http.createServer.onListen.returns(null);
      server.addRouter("fooPath", fooRouter);
      await server.start();
      expect(libsMocks.stubs.express.use.calledWith("fooPath", fooRouter)).toEqual(true);
      libsMocks.stubs.express.use.reset();
      await server.stop();
      await server.removeRouter("fooPath", fooRouter);
      await server.start();
      expect(libsMocks.stubs.express.use.calledWith("fooPath", fooRouter)).toEqual(false);
      expect(http.createServer.mock.calls.length).toEqual(2);
      expect(libsMocks.stubs.http.createServer.listen.callCount).toEqual(2);
    });
  });

  describe("when using https", () => {
    describe("when an error is produced trying to create https server", () => {
      it("should add an alert about https error and another one about error starting", async () => {
        expect.assertions(2);
        const error = new Error("foo");
        optionHttpsEnabled.value = true;
        fsExtra.readFileSync.throws(error);

        await server.init();

        try {
          await server.start();
        } catch (err) {
          expect(alerts.get("https")).toEqual({
            message: "Error creating HTTPS server",
            error: error,
          });
          expect(alerts.get("start")).toEqual({
            message: "Error starting server",
            error: err,
          });
        }
      });
    });

    describe("protocol", () => {
      it("should return https", async () => {
        optionHttpsEnabled.value = true;
        expect(server.protocol).toEqual("https");
      });
    });
  });

  describe("when started", () => {
    it("should init server only once", async () => {
      libsMocks.stubs.http.createServer.onListen.returns(null);
      await server.init();
      await server.start();
      await server.start();
      await server.start();
      expect(http.createServer.mock.calls.length).toEqual(1);
    });

    it("should add cors middleware if cors option is enabled", async () => {
      libsMocks.stubs.http.createServer.onListen.returns(null);
      optionCorsEnabled.value = true;
      await server.init();
      await server.start();
      expect(libsMocks.stubs.express.use.callCount).toEqual(8);
    });

    it("should not add cors middleware if cors option is disabled", async () => {
      libsMocks.stubs.http.createServer.onListen.returns(null);
      optionCorsEnabled.value = false;
      await server.init();
      await server.start();
      expect(libsMocks.stubs.express.use.callCount).toEqual(7);
    });

    it("should add jsonBodyParser middleware if jsonBodyParser option is enabled", async () => {
      libsMocks.stubs.http.createServer.onListen.returns(null);
      optionJsonBodyParserEnabled.value = true;
      await server.init();
      await server.start();
      expect(bodyParser.json.callCount).toEqual(1);
    });

    it("should not add jsonBodyParser middleware if jsonBodyParser option is disabled", async () => {
      libsMocks.stubs.http.createServer.onListen.returns(null);
      optionJsonBodyParserEnabled.value = false;
      await server.init();
      await server.start();
      expect(bodyParser.json.callCount).toEqual(0);
    });

    it("should add urlEncodedBodyParser middleware if urlEncodedBodyParser option is enabled", async () => {
      libsMocks.stubs.http.createServer.onListen.returns(null);
      optionUrlEncodedBodyParserEnabled.value = true;
      await server.init();
      await server.start();
      expect(bodyParser.urlencoded.callCount).toEqual(1);
    });

    it("should not add urlEncodedBodyParser middleware if urlEncodedBodyParser option is disabled", async () => {
      libsMocks.stubs.http.createServer.onListen.returns(null);
      optionUrlEncodedBodyParserEnabled.value = false;
      await server.init();
      await server.start();
      expect(bodyParser.urlencoded.callCount).toEqual(0);
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
        expect(alerts.get("start")).toEqual({
          message: "Error starting server",
          error: err,
        });
      }
    });

    it("should remove start alerts when starts successfully", async () => {
      libsMocks.stubs.http.createServer.onListen.returns(null);
      await server.start();
      expect(alerts.items.length).toEqual(0);
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
        expect(alerts.get("server")).toEqual({
          message: "Server error",
          error: err,
        });
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
      optionPort.value = "500";
      optionHost.value = "0.0.0.0";
      await server.start();
      expect(
        logger.info.calledWith("Server started and listening at http://localhost:500")
      ).toEqual(true);
    });

    it("should log the server host and port when host is custom", async () => {
      libsMocks.stubs.http.createServer.onListen.returns(null);
      optionPort.value = "600";
      optionHost.value = "foo-host";
      await server.start();
      expect(
        logger.info.calledWith("Server started and listening at http://foo-host:600")
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

      expect(await server.start()).toEqual(undefined);
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
});
