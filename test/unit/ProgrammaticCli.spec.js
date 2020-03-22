/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");
const AdminApi = require("@mocks-server/plugin-admin-api");

const CoreMocks = require("./Core.mocks.js");
const CliMocks = require("./Cli.mocks.js");

const ProgrammaticCli = require("../../lib/ProgrammaticCli");

describe("start method", () => {
  let sandbox;
  let coreMocks;
  let cliMocks;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    coreMocks = new CoreMocks();
    cliMocks = new CliMocks();
  });

  afterEach(() => {
    sandbox.restore();
    coreMocks.restore();
  });

  describe("when created", () => {
    it("should pass admin Api plugin to Core", async () => {
      new ProgrammaticCli();
      expect(coreMocks.stubs.Constructor.mock.calls[0][0].plugins[0]).toEqual(AdminApi);
    });

    it("should pass a callback to Core returning a CLI plugin, which reference is saved", async () => {
      const cli = new ProgrammaticCli();
      coreMocks.stubs.Constructor.mock.calls[0][0].plugins[1]();
      expect(cli._inquirerCli).toEqual(cliMocks.stubs.instance);
    });
  });

  describe("start method", () => {
    let cli;
    const fooOptions = {
      foo: "foo",
      foo2: "foo2",
    };

    beforeEach(() => {
      cli = new ProgrammaticCli(fooOptions);
      coreMocks.stubs.Constructor.mock.calls[0][0].plugins[1]();
    });

    it("should init Core wit provided options", async () => {
      await cli.start();
      expect(coreMocks.stubs.instance.init.getCall(0).args[0]).toEqual(fooOptions);
    });

    it("should start core", async () => {
      await cli.start();
      expect(coreMocks.stubs.instance.start.callCount).toEqual(1);
    });

    it("should start CLI", async () => {
      await cli.start();
      expect(cliMocks.stubs.instance.start.callCount).toEqual(1);
    });

    it("should start CLI only when CLI was disabled", async () => {
      coreMocks.stubs.instance.settings.get.returns(true);
      await cli.start();
      expect(cliMocks.stubs.instance.start.callCount).toEqual(0);
    });

    it("should start core and CLI only once when called multiple times", async () => {
      expect.assertions(2);
      await cli.start();
      await cli.start();
      expect(cliMocks.stubs.instance.start.callCount).toEqual(1);
      expect(coreMocks.stubs.instance.start.callCount).toEqual(1);
    });
  });

  describe("init method", () => {
    let cli;
    const fooOptions = {
      foo: "foo",
      foo2: "foo2",
    };

    beforeEach(() => {
      cli = new ProgrammaticCli(fooOptions);
      coreMocks.stubs.Constructor.mock.calls[0][0].plugins[1]();
    });

    it("should init Core wit provided options", async () => {
      await cli.initServer();
      expect(coreMocks.stubs.instance.init.getCall(0).args[0]).toEqual(fooOptions);
    });

    it("should disable cli", async () => {
      await cli.initServer();
      expect(coreMocks.stubs.instance.settings.set.getCall(0).args).toEqual(["cli", false]);
    });

    it("should start core", async () => {
      await cli.initServer();
      expect(coreMocks.stubs.instance.start.callCount).toEqual(1);
    });

    it("should start core only once after calling start", async () => {
      await cli.initServer();
      await cli.start();
      expect(coreMocks.stubs.instance.start.callCount).toEqual(1);
    });
  });

  describe("stopListeningServerWatch method", () => {
    let cli;
    beforeEach(() => {
      cli = new ProgrammaticCli();
      coreMocks.stubs.Constructor.mock.calls[0][0].plugins[1]();
    });

    it("should call to stopListeningServerWatch method of cli plugin", async () => {
      await cli.stopListeningServerWatch();
      expect(cliMocks.stubs.instance.stopListeningServerWatch.callCount).toEqual(1);
    });
  });
});
