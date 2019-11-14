/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const ServerMocks = require("../core/Server.mocks.js");
const InquirerMocks = require("./Inquirer.mocks.js");

const Cli = require("../../../lib/cli/Cli");
const tracer = require("../../../lib/core/tracer");

describe("Cli", () => {
  let sandbox;
  let cli;
  let serverMocks;
  let inquirerMocks;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.spy(tracer, "set");
    serverMocks = new ServerMocks();
    inquirerMocks = new InquirerMocks();
    expect.assertions(1);
  });

  afterEach(() => {
    sandbox.restore();
    serverMocks.restore();
    inquirerMocks.restore();
  });

  describe("when instantiated", () => {
    it("should call to create an inquirer", () => {
      cli = new Cli();
      expect(inquirerMocks.stubs.Inquirer.callCount).toEqual(1);
    });

    it("should pass to inquirer the custom quitMethod, if received", () => {
      const fooQuitMethod = "foo";
      cli = new Cli({}, fooQuitMethod);
      expect(inquirerMocks.stubs.Inquirer.getCall(0).args[2]).toEqual(fooQuitMethod);
    });

    it("should create a new Server, passing to it the behaviors and the rest of options", () => {
      const fooOptions = {
        behaviors: "foo-behaviors",
        otherOption: "fooOption"
      };
      cli = new Cli(fooOptions);
      expect(serverMocks.stubs.Constructor.mock.calls[0]).toEqual([
        fooOptions.behaviors,
        fooOptions
      ]);
    });

    it("should create a new Server, passing to it the features and the rest of options", () => {
      const fooOptions = {
        features: "foo-features",
        otherOption: "fooOption"
      };
      cli = new Cli(fooOptions);
      expect(serverMocks.stubs.Constructor.mock.calls[0]).toEqual([
        fooOptions.features,
        fooOptions
      ]);
    });

    it("should create a new Server, passing to it the behaviors option if features is also received", () => {
      const fooOptions = {
        features: "foo-features",
        behaviors: "foo-behaviors",
        otherOption: "fooOption"
      };
      cli = new Cli(fooOptions);
      expect(serverMocks.stubs.Constructor.mock.calls[0]).toEqual([
        fooOptions.behaviors,
        fooOptions
      ]);
    });
  });

  describe("initServer method", () => {
    it("should call to start server", async () => {
      cli = new Cli();
      await cli.start();
      expect(serverMocks.stubs.instance.start.callCount).toEqual(1);
    });

    it("should call to start server only once", async () => {
      cli = new Cli();
      await cli.start();
      await cli.start();
      expect(serverMocks.stubs.instance.start.callCount).toEqual(1);
    });

    it("should call to remove server events listeners", async () => {
      cli = new Cli();
      await cli.start();
      expect(serverMocks.stubs.instance.events.removeListener.callCount).toEqual(1);
    });

    it("should call to add server events listeners", async () => {
      cli = new Cli();
      await cli.start();
      expect(serverMocks.stubs.instance.events.on.callCount).toEqual(1);
    });

    it("should set server traces in silent mode", async () => {
      cli = new Cli();
      await cli.start();
      expect(tracer.set.getCall(0).args).toEqual(["console", "silent"]);
    });

    it("should call to clear screen", async () => {
      cli = new Cli();
      await cli.start();
      expect(inquirerMocks.stubs.inquirer.clearScreen.callCount).toEqual(1);
    });

    it("should call to display main menu", async () => {
      cli = new Cli();
      await cli.start();
      expect(inquirerMocks.stubs.inquirer.inquire.getCall(0).args[0]).toEqual("main");
    });
  });

  describe('when user selects "Change current behavior"', () => {
    const fooSelectedBehavior = "foo behavior";
    beforeEach(() => {
      inquirerMocks.stubs.inquirer.inquire.onCall(0).resolves("behavior");
      inquirerMocks.stubs.inquirer.inquire.onCall(1).resolves(fooSelectedBehavior);
    });

    it("should call to clear screen", async () => {
      cli = new Cli();
      await cli.start();
      expect(inquirerMocks.stubs.inquirer.clearScreen.callCount).toEqual(3);
    });

    it("should call to display behavior menu", async () => {
      cli = new Cli();
      await cli.start();
      expect(inquirerMocks.stubs.inquirer.inquire.getCall(1).args[0]).toEqual("behavior");
    });

    it("should set current selected behavior", async () => {
      cli = new Cli();
      await cli.start();
      expect(cli._behaviors.current).toEqual(fooSelectedBehavior);
    });

    it("should not filter current behaviors if there is no input", async () => {
      const fooBehaviorsNames = ["foo1", "foo2"];
      inquirerMocks.stubs.inquirer.inquireFake.executeCb(true);
      inquirerMocks.stubs.inquirer.inquireFake.returns(null);
      inquirerMocks.stubs.inquirer.inquire
        .onCall(0)
        .callsFake(inquirerMocks.stubs.inquirer.inquireFake.runner);
      cli = new Cli();
      cli._behaviors.names = fooBehaviorsNames;
      await cli.changeCurrentBehavior();
      expect(cli._behaviors.current).toEqual(fooBehaviorsNames);
    });

    it("should not filter current features if current input is empty", async () => {
      const fooBehaviorsNames = ["foo1", "foo2"];
      inquirerMocks.stubs.inquirer.inquireFake.executeCb(true);
      inquirerMocks.stubs.inquirer.inquireFake.returns([]);
      inquirerMocks.stubs.inquirer.inquire
        .onCall(0)
        .callsFake(inquirerMocks.stubs.inquirer.inquireFake.runner);
      cli = new Cli();
      cli._behaviors.names = fooBehaviorsNames;
      await cli.changeCurrentBehavior();
      expect(cli._behaviors.current).toEqual(fooBehaviorsNames);
    });

    it("should filter current behaviors and returns all that includes current input", async () => {
      const fooBehaviorsNames = ["foo1", "foo2", "not-included"];
      inquirerMocks.stubs.inquirer.inquireFake.executeCb(true);
      inquirerMocks.stubs.inquirer.inquireFake.returns("foo");
      inquirerMocks.stubs.inquirer.inquire
        .onCall(0)
        .callsFake(inquirerMocks.stubs.inquirer.inquireFake.runner);
      cli = new Cli();
      cli._behaviors.names = fooBehaviorsNames;
      await cli.changeCurrentBehavior();
      expect(cli._behaviors.current).toEqual(["foo1", "foo2"]);
    });
  });

  describe('when user selects "Change Delay"', () => {
    const fooDelay = 2000;
    beforeEach(() => {
      inquirerMocks.stubs.inquirer.inquire.onCall(0).resolves("delay");
      inquirerMocks.stubs.inquirer.inquire.onCall(1).resolves(fooDelay);
    });

    it("should call to clear screen", async () => {
      cli = new Cli();
      await cli.start();
      expect(inquirerMocks.stubs.inquirer.clearScreen.callCount).toEqual(3);
    });

    it("should call to display delay menu", async () => {
      cli = new Cli();
      await cli.start();
      expect(inquirerMocks.stubs.inquirer.inquire.getCall(1).args[0]).toEqual("delay");
    });

    it("should set current selected feature", async () => {
      cli = new Cli();
      await cli.start();
      expect(cli._settings.delay).toEqual(fooDelay);
    });

    it("should not pass delay validation if user introduce non numeric characters", async () => {
      cli = new Cli();
      expect(cli._questions.delay.validate(cli._questions.delay.filter("asdads"))).toEqual(false);
    });

    it("should pass delay validation if user introduce numeric characters", async () => {
      cli = new Cli();
      expect(cli._questions.delay.validate(cli._questions.delay.filter("123230"))).toEqual(true);
    });
  });

  describe('when user selects "Restart server"', () => {
    beforeEach(() => {
      inquirerMocks.stubs.inquirer.inquire.onCall(0).resolves("restart");
    });

    it("should call to restart server", async () => {
      cli = new Cli();
      await cli.start();
      expect(serverMocks.stubs.instance.restart.callCount).toEqual(1);
    });
  });

  describe('when user selects "Change log level"', () => {
    const fooLogLevel = "foo-level";

    beforeEach(() => {
      inquirerMocks.stubs.inquirer.inquire.onCall(0).resolves("logLevel");
      inquirerMocks.stubs.inquirer.inquire.onCall(1).resolves(fooLogLevel);
    });

    it("should call to display log level menu", async () => {
      cli = new Cli();
      await cli.start();
      expect(inquirerMocks.stubs.inquirer.inquire.getCall(1).args[0]).toEqual("logLevel");
    });

    it("should set current log level with the result of log level question", async () => {
      cli = new Cli();
      await cli.start();
      expect(cli._logLevel).toEqual(fooLogLevel);
    });
  });

  describe('when user selects "Switch watch"', () => {
    beforeEach(() => {
      inquirerMocks.stubs.inquirer.inquire.onCall(0).resolves("watch");
    });

    it("should call to switchWatch server method, passing true if it was disabled", async () => {
      serverMocks.stubs.instance.watchEnabled = false;
      cli = new Cli();
      await cli.start();
      expect(serverMocks.stubs.instance.switchWatch.getCall(0).args[0]).toEqual(true);
    });

    it("should call to switchWatch server method, passing false if it was enabled", async () => {
      serverMocks.stubs.instance.watchEnabled = true;
      cli = new Cli();
      await cli.start();
      expect(serverMocks.stubs.instance.switchWatch.getCall(0).args[0]).toEqual(false);
    });
  });

  describe('when user selects "Display server logs"', () => {
    beforeEach(() => {
      inquirerMocks.stubs.inquirer.inquire.onCall(0).resolves("logs");
    });

    it("should call to logsMode server method", async () => {
      cli = new Cli();
      await cli.start();
      expect(inquirerMocks.stubs.inquirer.logsMode.callCount).toEqual(1);
    });

    it("should call to set current log level after logs mode is enabled", async () => {
      const fooLogLevel = "foo log level";
      inquirerMocks.stubs.inquirer.logsMode.executeCb(true);
      cli = new Cli({
        log: fooLogLevel
      });
      await cli.start();
      expect(tracer.set.getCall(1).args).toEqual(["console", fooLogLevel]);
    });
  });

  describe("when printing header", () => {
    it("should print it as first element if server has an error", async () => {
      const fooServerErrorMessage = "foo server error";
      const fooServerError = new Error(fooServerErrorMessage);
      cli = new Cli();
      serverMocks.stubs.instance.error = fooServerError;
      await cli.start();
      expect(cli.header()[0]).toEqual(expect.stringContaining(fooServerErrorMessage));
    });

    it("should print server url as first element if server has not an error", async () => {
      cli = new Cli();
      await cli.start();
      expect(cli.header()[0]).toEqual(expect.stringContaining("Mocks server listening"));
    });
  });

  describe("when server emits an event informing about watch has reloaded the features", () => {
    beforeEach(() => {
      serverMocks.stubs.instance.events.on.executeCb(true);
    });

    it("should remove all base-cli listeners", async () => {
      cli = new Cli();
      await cli.start();
      expect(inquirerMocks.stubs.inquirer.removeListeners.callCount).toEqual(1);
    });

    it("should exit logs mode", async () => {
      cli = new Cli();
      await cli.start();
      expect(inquirerMocks.stubs.inquirer.exitLogsMode.callCount).toEqual(1);
    });
  });
});
