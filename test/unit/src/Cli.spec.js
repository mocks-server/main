/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");

const CoreMocks = require("../Core.mocks.js");
const InquirerMocks = require("./Inquirer.mocks.js");

const Cli = require("../../../src/Cli");

describe("Cli", () => {
  let sandbox;
  let inquirerMocks;
  let coreMocks;
  let coreInstance;
  let cli;

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    inquirerMocks = new InquirerMocks();
    coreMocks = new CoreMocks();
    coreInstance = coreMocks.stubs.instance;
    cli = new Cli(coreInstance);
    expect.assertions(1);
    coreInstance.settings.get.withArgs("cli").returns(true);
    coreInstance.settings.get.withArgs("log").returns("info");
    await cli.init();
  });

  afterEach(() => {
    sandbox.restore();
    inquirerMocks.restore();
    coreMocks.restore();
  });

  describe("when created", () => {
    it("should have added cli custom setting to core", () => {
      coreMocks.reset();
      cli = new Cli(coreInstance);
      expect(coreInstance.addCustomSetting.getCall(0).args[0].name).toEqual("cli");
    });
  });

  describe("when initializated", () => {
    it("should call to create an inquirer", () => {
      expect(inquirerMocks.stubs.Inquirer.callCount).toEqual(1);
    });

    it("not be initializated if cli setting is disabled", async () => {
      inquirerMocks.reset();
      coreInstance.settings.get.withArgs("cli").returns(false);
      cli = new Cli(coreInstance);
      await cli.init();
      expect(inquirerMocks.stubs.Inquirer.callCount).toEqual(0);
    });

    it("should save current log log level", () => {
      expect(cli._logLevel).toEqual("info");
    });

    it("should display main menu when core settings are changed and current screen is main menu", async () => {
      await cli.start();
      expect.assertions(2);
      coreInstance.onChangeSettings.getCall(0).args[0]();
      expect(inquirerMocks.stubs.inquirer.inquire.callCount).toEqual(2);
      expect(inquirerMocks.stubs.inquirer.inquire.getCall(1).args[0]).toEqual("main");
    });

    it("should not display main menu when core settings are changed and current screen is not main menu", async () => {
      await cli.start();
      expect.assertions(2);
      cli._changeCurrentBehavior();
      coreInstance.onChangeSettings.getCall(0).args[0]();
      expect(inquirerMocks.stubs.inquirer.inquire.callCount).toEqual(2);
      expect(inquirerMocks.stubs.inquirer.inquire.getCall(1).args[0]).toEqual("behavior");
    });
  });

  describe("when started", () => {
    beforeEach(async () => {
      await cli.start();
    });

    it("should do nothing if it cli has not been inited", async () => {
      inquirerMocks.reset();
      cli = new Cli(coreInstance);
      coreInstance.settings.get.withArgs("cli").returns(true);
      await cli.start();
      expect(inquirerMocks.stubs.inquirer.inquire.callCount).toEqual(0);
    });

    it("should do nothing if it cli is disabled", async () => {
      inquirerMocks.reset();
      cli = new Cli(coreInstance);
      coreInstance.settings.get.withArgs("cli").returns(false);
      await cli.init();
      await cli.start();
      expect(inquirerMocks.stubs.inquirer.inquire.callCount).toEqual(0);
    });

    it("should silent core tracer", () => {
      expect(coreInstance.settings.set.getCall(0).args).toEqual(["log", "silent"]);
    });

    it("should display inquirer", () => {
      expect(inquirerMocks.stubs.inquirer.inquire.callCount).toEqual(1);
    });
  });

  describe('when user selects "Change current behavior"', () => {
    const fooSelectedBehavior = "foo behavior";
    beforeEach(() => {
      inquirerMocks.stubs.inquirer.inquire.onCall(0).resolves("behavior");
      inquirerMocks.stubs.inquirer.inquire.onCall(1).resolves(fooSelectedBehavior);
    });

    it("should call to clear screen", async () => {
      await cli.start();
      expect(inquirerMocks.stubs.inquirer.clearScreen.callCount).toEqual(3);
    });

    it("should call to display behavior menu", async () => {
      await cli.start();
      expect(inquirerMocks.stubs.inquirer.inquire.getCall(1).args[0]).toEqual("behavior");
    });

    it("should set current selected behavior", async () => {
      await cli.start();
      expect(coreInstance.settings.set.getCall(1).args).toEqual(["behavior", fooSelectedBehavior]);
    });

    it("should not filter current behaviors if there is no input", async () => {
      const fooBehaviorsNames = ["foo1", "foo2"];
      inquirerMocks.stubs.inquirer.inquireFake.executeCb(true);
      inquirerMocks.stubs.inquirer.inquireFake.returns(null);
      inquirerMocks.stubs.inquirer.inquire
        .onCall(0)
        .callsFake(inquirerMocks.stubs.inquirer.inquireFake.runner);
      coreInstance.behaviors.names = fooBehaviorsNames;
      await cli._changeCurrentBehavior();
      expect(coreInstance.settings.set.getCall(0).args).toEqual(["behavior", fooBehaviorsNames]);
    });

    it("should not filter current features if current input is empty", async () => {
      const fooBehaviorsNames = ["foo1", "foo2"];
      inquirerMocks.stubs.inquirer.inquireFake.executeCb(true);
      inquirerMocks.stubs.inquirer.inquireFake.returns([]);
      inquirerMocks.stubs.inquirer.inquire
        .onCall(0)
        .callsFake(inquirerMocks.stubs.inquirer.inquireFake.runner);
      coreInstance.behaviors.names = fooBehaviorsNames;
      await cli._changeCurrentBehavior();
      expect(coreInstance.settings.set.getCall(0).args).toEqual(["behavior", fooBehaviorsNames]);
    });

    it("should filter current behaviors and returns all that includes current input", async () => {
      const fooBehaviorsNames = ["foo1", "foo2", "not-included"];
      inquirerMocks.stubs.inquirer.inquireFake.executeCb(true);
      inquirerMocks.stubs.inquirer.inquireFake.returns("foo");
      inquirerMocks.stubs.inquirer.inquire
        .onCall(0)
        .callsFake(inquirerMocks.stubs.inquirer.inquireFake.runner);
      coreInstance.behaviors.names = fooBehaviorsNames;
      await cli._changeCurrentBehavior();
      expect(coreInstance.settings.set.getCall(0).args).toEqual(["behavior", ["foo1", "foo2"]]);
    });
  });

  describe('when user selects "Change Delay"', () => {
    const fooDelay = 2000;
    beforeEach(() => {
      inquirerMocks.stubs.inquirer.inquire.onCall(0).resolves("delay");
      inquirerMocks.stubs.inquirer.inquire.onCall(1).resolves(fooDelay);
    });

    it("should call to clear screen", async () => {
      await cli.start();
      expect(inquirerMocks.stubs.inquirer.clearScreen.callCount).toEqual(3);
    });

    it("should call to display delay menu", async () => {
      await cli.start();
      expect(inquirerMocks.stubs.inquirer.inquire.getCall(1).args[0]).toEqual("delay");
    });

    it("should set current selected feature", async () => {
      await cli.start();
      expect(coreInstance.settings.set.getCall(1).args).toEqual(["delay", fooDelay]);
    });

    it("should not pass delay validation if user introduce non numeric characters", async () => {
      expect(cli._questions.delay.validate(cli._questions.delay.filter("asdads"))).toEqual(false);
    });

    it("should pass delay validation if user introduce numeric characters", async () => {
      expect(cli._questions.delay.validate(cli._questions.delay.filter("123230"))).toEqual(true);
    });
  });

  describe('when user selects "Restart server"', () => {
    beforeEach(() => {
      inquirerMocks.stubs.inquirer.inquire.onCall(0).resolves("restart");
    });

    it("should call to restart server", async () => {
      await cli.start();
      expect(coreInstance.restart.callCount).toEqual(1);
    });
  });

  describe('when user selects "Change log level"', () => {
    const fooLogLevel = "foo-level";

    beforeEach(() => {
      inquirerMocks.stubs.inquirer.inquire.onCall(0).resolves("logLevel");
      inquirerMocks.stubs.inquirer.inquire.onCall(1).resolves(fooLogLevel);
    });

    it("should call to display log level menu", async () => {
      await cli.start();
      expect(inquirerMocks.stubs.inquirer.inquire.getCall(1).args[0]).toEqual("logLevel");
    });

    it("should set current log level with the result of log level question", async () => {
      await cli.start();
      expect(cli._logLevel).toEqual(fooLogLevel);
    });
  });

  describe('when user selects "Switch watch"', () => {
    beforeEach(() => {
      inquirerMocks.stubs.inquirer.inquire.onCall(0).resolves("watch");
    });

    it("should call to switchWatch server method, passing true if it was disabled", async () => {
      coreInstance.settings.get.withArgs("watch").returns(false);
      await cli.start();
      expect(coreInstance.settings.set.getCall(1).args).toEqual(["watch", true]);
    });

    it("should call to switchWatch server method, passing false if it was enabled", async () => {
      coreInstance.settings.get.withArgs("watch").returns(true);
      await cli.start();
      expect(coreInstance.settings.set.getCall(1).args).toEqual(["watch", false]);
    });
  });

  describe('when user selects "Display server logs"', () => {
    beforeEach(() => {
      inquirerMocks.stubs.inquirer.inquire.onCall(0).resolves("logs");
    });

    it("should call to logsMode CLI method", async () => {
      await cli.start();
      expect(inquirerMocks.stubs.inquirer.logsMode.callCount).toEqual(1);
    });

    it("should call to set current log level after logs mode is enabled", async () => {
      const fooLogLevel = "foo-log-level";
      coreMocks.reset();
      cli = new Cli(coreInstance);
      coreInstance.settings.get.withArgs("cli").returns(true);
      coreInstance.settings.get.withArgs("log").returns(fooLogLevel);
      await cli.init();
      inquirerMocks.stubs.inquirer.logsMode.executeCb(true);
      await cli.start();
      expect(coreInstance.settings.set.getCall(1).args).toEqual(["log", fooLogLevel]);
    });
  });

  describe("when printing header", () => {
    it("should print it as first element if server has an error", async () => {
      const fooServerErrorMessage = "foo server error";
      const fooServerError = new Error(fooServerErrorMessage);
      coreInstance.serverError = fooServerError;
      await cli.start();
      expect(cli._header()[0]).toEqual(expect.stringContaining(fooServerErrorMessage));
    });

    it("should print server url as first element if server has not an error", async () => {
      coreInstance.serverError = null;
      await cli.start();
      expect(cli._header()[0]).toEqual(expect.stringContaining("Mocks server listening"));
    });

    it("should print localhost as host when it is 0.0.0.0", async () => {
      coreInstance.serverError = null;
      coreInstance.settings.get.withArgs("host").returns("0.0.0.0");
      await cli.start();
      expect(cli._header()[0]).toEqual(expect.stringContaining("http://localhost"));
    });

    it("should print custom host as host", async () => {
      coreInstance.serverError = null;
      coreInstance.settings.get.withArgs("host").returns("foo-host");
      await cli.start();
      expect(cli._header()[0]).toEqual(expect.stringContaining("http://foo-host"));
    });
  });

  describe("when server emits load:mocks event watch has reloaded the features", () => {
    beforeEach(async () => {
      await cli.start();
      coreInstance.onLoadMocks.getCall(0).args[0]();
    });

    it("should remove all base-cli listeners", async () => {
      expect(inquirerMocks.stubs.inquirer.removeListeners.callCount).toEqual(1);
    });

    it("should exit logs mode", async () => {
      expect(inquirerMocks.stubs.inquirer.exitLogsMode.callCount).toEqual(1);
    });
  });

  describe("stopListeningServerWatch method", () => {
    it("should remove load:mocks listener if cli has been started", async () => {
      const spy = sandbox.spy();
      coreInstance.onLoadMocks.returns(spy);
      await cli.start();
      cli.stopListeningServerWatch();
      expect(spy.callCount).toEqual(1);
    });

    it("should not remove load:mocks listener if cli has not been started", () => {
      const spy = sandbox.spy();
      coreInstance.onLoadMocks.returns(spy);
      cli.stopListeningServerWatch();
      expect(spy.callCount).toEqual(0);
    });
  });
});
