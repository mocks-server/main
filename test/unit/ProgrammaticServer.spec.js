/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const CoreMocks = require("./Core.mocks.js");

const AdminApi = require("../../lib/api/Api");

const ProgrammaticServer = require("../../lib/ProgrammaticServer");

describe("start method", () => {
  const fooMocksPath = "foo-mocks-path";
  const fooOptions = {
    foo: "foo",
    foo2: "foo2"
  };
  let sandbox;
  let coreMocks;
  let cli;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    coreMocks = new CoreMocks();
    cli = new ProgrammaticServer(fooMocksPath, fooOptions);
  });

  afterEach(() => {
    sandbox.restore();
    coreMocks.restore();
  });

  describe("when created", () => {
    it("should pass admin Api plugin to Core", async () => {
      new ProgrammaticServer();
      expect(coreMocks.stubs.Constructor.mock.calls[0][0].plugins[0]).toEqual(AdminApi);
    });
  });

  describe("start method", () => {
    it("should init Core with provided options", async () => {
      await cli.start();
      expect(coreMocks.stubs.instance.init.getCall(0).args[0]).toEqual({
        ...fooOptions,
        behaviors: fooMocksPath
      });
    });

    it("should not init core if it was done before", async () => {
      await cli.start();
      await cli.start();
      await cli.start();
      expect(coreMocks.stubs.instance.init.callCount).toEqual(1);
    });

    it("should start core", async () => {
      await cli.start();
      expect(coreMocks.stubs.instance.start.callCount).toEqual(1);
    });

    it("should resolve with ProgrammaticServer instance", async () => {
      const instance = await cli.start();
      expect(instance).toEqual(cli);
    });

    it("should emit a watch-reload event when core emits a load:mocks event", async () => {
      await cli.start();
      coreMocks.stubs.instance.onChangeSettings.getCall(0).args[0]();
      expect(coreMocks.stubs.instance._eventEmitter.emit.getCall(0).args[0]).toEqual(
        "watch-reload"
      );
    });
  });

  describe("stop method", () => {
    it("should stop core", async () => {
      await cli.stop();
      expect(coreMocks.stubs.instance.stop.callCount).toEqual(1);
    });
  });

  describe("switchWatch method", () => {
    it("should set watch state as false if called with false", async () => {
      await cli.switchWatch(false);
      expect(coreMocks.stubs.instance.settings.set.getCall(0).args).toEqual(["watch", false]);
    });

    it("should set watch state as true if called with true", async () => {
      await cli.switchWatch(true);
      expect(coreMocks.stubs.instance.settings.set.getCall(0).args).toEqual(["watch", true]);
    });
  });

  describe("behaviors getter", () => {
    it("should return core behaviors", async () => {
      expect(cli.behaviors).toEqual(coreMocks.stubs.instance.behaviors);
    });
  });

  describe("watchEnabled getter", () => {
    it("should return watch setting state", async () => {
      coreMocks.stubs.instance.settings.get.returns(false);
      expect(cli.watchEnabled).toEqual(false);
    });
  });

  describe("error getter", () => {
    it("should return core serverError", async () => {
      expect(cli.error).toEqual(coreMocks.stubs.instance.serverError);
    });
  });

  describe("events getter", () => {
    it("should return core _eventEmitter", async () => {
      expect(cli.events).toEqual(coreMocks.stubs.instance._eventEmitter);
    });
  });
});
