/*
Copyright 2019-2022 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const sinon = require("sinon");
const chalk = require("chalk");

const CoreMocks = require("../Core.mocks.js");
const InquirerMocks = require("./Inquirer.mocks.js");
const ConfigMocks = require("../Config.mocks.js");

const Cli = require("../../src/Cli");

describe("Cli", () => {
  let sandbox;
  let inquirerMocks;
  let coreMocks;
  let configMock;
  let coreInstance;
  let cli;
  let optionCli;
  let optionEmojis;
  let optionLog;
  let optionDelay;
  let optionDelayLegacy;
  let optionHost;
  let optionWatch;
  let optionMock;
  let mockOptions;
  let onChangeEmojis;
  let cliArgs;
  let onChangeLog;
  let onChangeCli;
  let onChangeDelay;
  let onChangeHost;
  let onChangeWatch;
  let onChangeMock;

  beforeEach(async () => {
    sandbox = sinon.createSandbox();
    inquirerMocks = new InquirerMocks();
    coreMocks = new CoreMocks();
    configMock = new ConfigMocks();
    coreInstance = coreMocks.stubs.instance;
    cliArgs = {
      alerts: coreMocks.stubs.instance.alerts,
      mock: coreMocks.stubs.instance.mock,
      onChangeAlerts: coreMocks.stubs.instance.onChangeAlerts,
      server: coreMocks.stubs.instance.server,
      config: configMock.stubs.namespace,
    };
    cli = new Cli(cliArgs);
    onChangeEmojis = sandbox.stub();
    onChangeLog = sandbox.stub();
    onChangeCli = sandbox.stub();
    onChangeDelay = sandbox.stub();
    onChangeHost = sandbox.stub();
    onChangeWatch = sandbox.stub();
    onChangeMock = sandbox.stub();
    expect.assertions(1);
    mockOptions = () => {
      optionCli = { ...cli._optionCli, onChange: onChangeCli, value: true };
      optionEmojis = { ...cli._optionEmojis, onChange: onChangeEmojis, value: true };
      optionLog = { ...cli._optionLog, onChange: onChangeLog, value: "info" };
      optionDelay = { ...cli._optionDelay, onChange: onChangeDelay, value: 0 };
      optionDelayLegacy = { ...cli._optionDelayLegacy, value: 0 };
      optionHost = { ...cli._optionHost, onChange: onChangeHost, value: "0.0.0.0" };
      optionWatch = { ...cli._optionWatch, onChange: onChangeWatch, value: true };
      optionMock = { ...cli._optionMock, onChange: onChangeMock, value: "base" };
      cli._optionEmojis = optionEmojis;
      cli._optionDelay = optionDelay;
      cli._optionCli = optionCli;
      cli._optionLog = optionLog;
      cli._optionHost = optionHost;
      cli._optionWatch = optionWatch;
      cli._optionMock = optionMock;
      cli._optionDelayLegacy = optionDelayLegacy;
    };
    mockOptions();
    await cli.init();
  });

  afterEach(() => {
    sandbox.restore();
    inquirerMocks.restore();
    coreMocks.restore();
  });

  describe("Class", () => {
    it("should have id", () => {
      expect(Cli.id).toEqual("inquirerCli");
    });
  });

  describe("when initializated", () => {
    it("should call to create an inquirer", () => {
      expect(inquirerMocks.stubs.Inquirer.callCount).toEqual(1);
    });

    it("not be initializated if cli setting is disabled", async () => {
      inquirerMocks.reset();
      cli = new Cli(cliArgs);
      mockOptions();
      optionCli.value = false;
      await cli.init();
      expect(inquirerMocks.stubs.Inquirer.callCount).toEqual(0);
    });
  });

  describe("when settings are changed", () => {
    beforeEach(async () => {
      await cli.start();
    });

    it("should start cli when core cli setting is true and cli was not started", async () => {
      expect.assertions(2);
      onChangeCli.getCall(0).args[0](true);
      expect(inquirerMocks.stubs.inquirer.inquire.callCount).toEqual(1);
      expect(inquirerMocks.stubs.inquirer.inquire.getCall(0).args[0]).toEqual("main");
    });

    it("should refresh main menu when delay option is changed and current screen is main menu", async () => {
      expect.assertions(2);
      optionDelay.onChange.getCall(0).args[0]("foo");
      expect(inquirerMocks.stubs.inquirer.inquire.callCount).toEqual(2);
      expect(inquirerMocks.stubs.inquirer.inquire.getCall(1).args[0]).toEqual("main");
    });

    it("should refresh main menu when host option is changed and current screen is main menu", async () => {
      expect.assertions(2);
      optionHost.onChange.getCall(0).args[0]("foo");
      expect(inquirerMocks.stubs.inquirer.inquire.callCount).toEqual(2);
      expect(inquirerMocks.stubs.inquirer.inquire.getCall(1).args[0]).toEqual("main");
    });

    it("should refresh main menu when log option is changed and current screen is main menu", async () => {
      expect.assertions(2);
      onChangeLog.getCall(0).args[0]("foo");
      expect(inquirerMocks.stubs.inquirer.inquire.callCount).toEqual(2);
      expect(inquirerMocks.stubs.inquirer.inquire.getCall(1).args[0]).toEqual("main");
    });

    it("should refresh main menu when watch option is changed and current screen is main menu", async () => {
      expect.assertions(2);
      onChangeWatch.getCall(0).args[0](false);
      expect(inquirerMocks.stubs.inquirer.inquire.callCount).toEqual(2);
      expect(inquirerMocks.stubs.inquirer.inquire.getCall(1).args[0]).toEqual("main");
    });

    it("should not display main menu when mock is changed and current screen is not main menu", async () => {
      cli._currentScreen = "FOO";
      onChangeMock.getCall(0).args[0]("foo");
      expect(inquirerMocks.stubs.inquirer.inquire.callCount).toEqual(1);
    });

    it("should not display main menu when mock is changed and plugin was stopped", async () => {
      await cli.stop();
      inquirerMocks.reset();
      cli._currentScreen = "FOO";
      onChangeMock.getCall(0).args[0]("foo");
      expect(inquirerMocks.stubs.inquirer.inquire.callCount).toEqual(0);
    });

    it("should start cli if it was not started and cli option is true", async () => {
      await cli.stop();
      inquirerMocks.reset();
      expect.assertions(2);
      optionCli.value = true;
      onChangeCli.getCall(0).args[0](true);
      expect(inquirerMocks.stubs.inquirer.inquire.callCount).toEqual(1);
      expect(inquirerMocks.stubs.inquirer.inquire.getCall(0).args[0]).toEqual("main");
    });

    it("should not start cli if it was not started and cli option is false", async () => {
      await cli.stop();
      inquirerMocks.reset();
      optionCli.value = false;
      onChangeCli.getCall(0).args[0](false);
      expect(inquirerMocks.stubs.inquirer.inquire.callCount).toEqual(0);
    });

    it("should stop cli if it was started and cli option is false", async () => {
      inquirerMocks.reset();
      optionCli.value = false;
      onChangeCli.getCall(0).args[0](false);
      expect(inquirerMocks.stubs.inquirer.clearScreen.getCall(0).args[0]).toEqual({
        header: false,
      });
    });

    it("should silent traces again if log setting changes and cli is not in logs mode", async () => {
      expect.assertions(2);
      cli._isOverwritingLogLevel = false;
      optionLog.value = "debug";
      onChangeLog.getCall(0).args[0]("debug");
      expect(cli._logLevel).toEqual("debug");
      expect(optionLog.value).toEqual("silent");
    });

    it("should not refres menu if log changes and plugin is stopped", async () => {
      await cli.stop();
      inquirerMocks.reset();
      optionLog.value = "debug";
      onChangeLog.getCall(0).args[0]("debug");
      expect(inquirerMocks.stubs.inquirer.inquire.callCount).toEqual(0);
    });

    it("should not silent traces if log setting changes and cli is in logs mode", async () => {
      cli._isOverwritingLogLevel = false;
      cli._currentScreen = "logs";
      optionLog.value = "debug";
      onChangeLog.getCall(0).args[0]("debug");
      expect(optionLog.value).toEqual("debug");
    });

    it("should ignore changes in log level dispatched by his own silentTraces method", async () => {
      expect.assertions(2);
      cli._silentTraces();
      expect(cli._isOverwritingLogLevel).toEqual(true);
      optionLog.value = "silent";
      onChangeLog.getCall(0).args[0]("silent");
      expect(cli._isOverwritingLogLevel).toEqual(false);
    });

    it("should change inquirer emojis setting when emojis option changes", async () => {
      expect.assertions(2);
      onChangeEmojis.getCall(0).args[0](false);
      expect(inquirerMocks.stubs.inquirer.emojis).toEqual(false);
      onChangeEmojis.getCall(0).args[0](true);
      expect(inquirerMocks.stubs.inquirer.emojis).toEqual(true);
    });

    it("should refresh main menu when emojis option is changed and current screen is main menu", async () => {
      expect.assertions(2);
      onChangeEmojis.getCall(0).args[0](false);
      expect(inquirerMocks.stubs.inquirer.inquire.callCount).toEqual(2);
      expect(inquirerMocks.stubs.inquirer.inquire.getCall(1).args[0]).toEqual("main");
    });

    it("should not display main menu when emojis is changed and current screen is not main menu", async () => {
      cli._currentScreen = "FOO";
      onChangeEmojis.getCall(0).args[0](false);
      expect(inquirerMocks.stubs.inquirer.inquire.callCount).toEqual(1);
    });
  });

  describe("when alerts are changed", () => {
    beforeEach(async () => {
      await cli.start();
    });

    it("should refresh main menu", async () => {
      expect.assertions(2);
      coreInstance.onChangeAlerts.getCall(0).args[0]();
      expect(inquirerMocks.stubs.inquirer.inquire.callCount).toEqual(2);
      expect(inquirerMocks.stubs.inquirer.inquire.getCall(1).args[0]).toEqual("main");
    });
  });

  describe("when started", () => {
    beforeEach(async () => {
      await cli.start();
    });

    it("should save current log level", () => {
      expect(cli._logLevel).toEqual("info");
    });

    it("should init if it has not been inited before", async () => {
      inquirerMocks.reset();
      cli = new Cli(cliArgs);
      mockOptions();
      optionCli.value = true;
      await cli.start();
      expect(inquirerMocks.stubs.inquirer.inquire.callCount).toEqual(1);
    });

    it("should do nothing if cli is disabled", async () => {
      inquirerMocks.reset();
      cli = new Cli(cliArgs);
      mockOptions();
      optionCli.value = false;
      await cli.init();
      await cli.start();
      expect(inquirerMocks.stubs.inquirer.inquire.callCount).toEqual(0);
    });

    it("should silent core logs", () => {
      expect(optionLog.value).toEqual("silent");
    });

    it("should display inquirer", () => {
      expect(inquirerMocks.stubs.inquirer.inquire.callCount).toEqual(1);
    });
  });

  describe("when stopped", () => {
    let removeChangeMocksSpy;
    let removeChangeAlertsSpy;

    beforeEach(async () => {
      removeChangeMocksSpy = sinon.spy();
      removeChangeAlertsSpy = sinon.spy();
      coreInstance.onChangeAlerts.returns(removeChangeAlertsSpy);
      coreInstance.mock.onChange.returns(removeChangeMocksSpy);
      await cli.start();
    });

    it("should clear screen", async () => {
      inquirerMocks.reset();
      await cli.stop();
      expect(inquirerMocks.stubs.inquirer.clearScreen.getCall(0).args[0]).toEqual({
        header: false,
      });
    });

    it("should remove onChange listeners", async () => {
      expect.assertions(2);
      inquirerMocks.reset();
      await cli.stop();
      expect(removeChangeMocksSpy.callCount).toEqual(1);
      expect(removeChangeAlertsSpy.callCount).toEqual(1);
    });

    it("should not stop if it was already stopped", async () => {
      await cli.stop();
      await cli.stop();
      await cli.stop();
      await cli.stop();
      expect(inquirerMocks.stubs.inquirer.clearScreen.callCount).toEqual(2);
    });
  });

  describe('when user selects "Change current mock"', () => {
    const fooSelectedMock = "foo mock";
    let originalIds;

    beforeEach(() => {
      originalIds = coreInstance.mock.ids;
      coreInstance.mock.ids = ["foo-mock"];
      inquirerMocks.stubs.inquirer.inquire.onCall(0).resolves("mock");
      inquirerMocks.stubs.inquirer.inquire.onCall(1).resolves(fooSelectedMock);
    });

    afterEach(() => {
      coreInstance.mock.ids = originalIds;
    });

    it("should call to clear screen", async () => {
      await cli.start();
      expect(inquirerMocks.stubs.inquirer.clearScreen.callCount).toEqual(3);
    });

    it("should display main menu if there are no mocks", async () => {
      coreInstance.mock.ids = [];
      await cli.start();
      expect(inquirerMocks.stubs.inquirer.inquire.getCall(1).args[0]).toEqual("main");
    });

    it("should call to display mock menu", async () => {
      await cli.start();
      expect(inquirerMocks.stubs.inquirer.inquire.getCall(1).args[0]).toEqual("mock");
    });

    it("should set current selected mock", async () => {
      await cli.start();
      expect(optionMock.value).toEqual(fooSelectedMock);
    });

    it("should not filter current mocks if there is no input", async () => {
      const fooMocks = ["foo1", "foo2"];
      inquirerMocks.stubs.inquirer.inquireFake.executeCb(true);
      inquirerMocks.stubs.inquirer.inquireFake.returns(null);
      inquirerMocks.stubs.inquirer.inquire
        .onCall(0)
        .callsFake(inquirerMocks.stubs.inquirer.inquireFake.runner);
      coreInstance.mock.ids = fooMocks;
      await cli._changeCurrentMock();
      expect(optionMock.value).toEqual(["foo1", "foo2"]);
    });

    it("should not filter current mocks if current input is empty", async () => {
      const fooMocks = ["foo1", "foo2"];
      inquirerMocks.stubs.inquirer.inquireFake.executeCb(true);
      inquirerMocks.stubs.inquirer.inquireFake.returns([]);
      inquirerMocks.stubs.inquirer.inquire
        .onCall(0)
        .callsFake(inquirerMocks.stubs.inquirer.inquireFake.runner);
      coreInstance.mock.ids = fooMocks;
      await cli._changeCurrentMock();
      expect(optionMock.value).toEqual(["foo1", "foo2"]);
    });

    it("should filter current mocks and returns all that includes current input", async () => {
      const fooMocks = ["foo1", "foo2", "not-included"];
      inquirerMocks.stubs.inquirer.inquireFake.executeCb(true);
      inquirerMocks.stubs.inquirer.inquireFake.returns("foo");
      inquirerMocks.stubs.inquirer.inquire
        .onCall(0)
        .callsFake(inquirerMocks.stubs.inquirer.inquireFake.runner);
      coreInstance.mock.ids = fooMocks;
      await cli._changeCurrentMock();
      expect(optionMock.value).toEqual(["foo1", "foo2"]);
    });
  });

  describe('when user selects "Change route variant"', () => {
    const fooSelectedVariant = "foo variant";
    let originalVariants;

    beforeEach(() => {
      originalVariants = coreInstance.mock.routes.plainVariants;
      coreInstance.mock.routes.plainVariants = [{ id: "foo-variant" }];
      inquirerMocks.stubs.inquirer.inquire.onCall(0).resolves("variant");
      inquirerMocks.stubs.inquirer.inquire.onCall(1).resolves(fooSelectedVariant);
    });

    afterEach(() => {
      coreInstance.mock.routes.plainVariants = originalVariants;
    });

    it("should call to clear screen", async () => {
      await cli.start();
      expect(inquirerMocks.stubs.inquirer.clearScreen.callCount).toEqual(3);
    });

    it("should display main menu if there are no routes variants", async () => {
      coreInstance.mock.routes.plainVariants = [];
      await cli.start();
      expect(inquirerMocks.stubs.inquirer.inquire.getCall(1).args[0]).toEqual("main");
    });

    it("should call to display routes variants menu", async () => {
      await cli.start();
      expect(inquirerMocks.stubs.inquirer.inquire.getCall(1).args[0]).toEqual("variant");
    });

    it("should set current selected route variant", async () => {
      await cli.start();
      expect(coreInstance.mock.useRouteVariant.getCall(0).args).toEqual([fooSelectedVariant]);
    });

    it("should not filter current routes variants if there is no input", async () => {
      const fooVariants = [{ id: "foo1" }, { id: "foo2" }];
      inquirerMocks.stubs.inquirer.inquireFake.executeCb(true);
      inquirerMocks.stubs.inquirer.inquireFake.returns(null);
      inquirerMocks.stubs.inquirer.inquire
        .onCall(0)
        .callsFake(inquirerMocks.stubs.inquirer.inquireFake.runner);
      coreInstance.mock.routes.plainVariants = fooVariants;
      await cli._changeRouteVariant();
      expect(coreInstance.mock.useRouteVariant.getCall(0).args).toEqual([["foo1", "foo2"]]);
    });

    it("should not filter current routes variants if current input is empty", async () => {
      const fooVariants = [{ id: "foo1" }, { id: "foo2" }];
      inquirerMocks.stubs.inquirer.inquireFake.executeCb(true);
      inquirerMocks.stubs.inquirer.inquireFake.returns([]);
      inquirerMocks.stubs.inquirer.inquire
        .onCall(0)
        .callsFake(inquirerMocks.stubs.inquirer.inquireFake.runner);
      coreInstance.mock.routes.plainVariants = fooVariants;
      await cli._changeRouteVariant();
      expect(coreInstance.mock.useRouteVariant.getCall(0).args).toEqual([["foo1", "foo2"]]);
    });

    it("should filter current variants and returns all that includes current input", async () => {
      const fooVariants = [{ id: "foo1" }, { id: "foo2" }, { id: "not-included" }];
      inquirerMocks.stubs.inquirer.inquireFake.executeCb(true);
      inquirerMocks.stubs.inquirer.inquireFake.returns("foo");
      inquirerMocks.stubs.inquirer.inquire
        .onCall(0)
        .callsFake(inquirerMocks.stubs.inquirer.inquireFake.runner);
      coreInstance.mock.routes.plainVariants = fooVariants;
      await cli._changeRouteVariant();
      expect(coreInstance.mock.useRouteVariant.getCall(0).args).toEqual([["foo1", "foo2"]]);
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
      expect(optionDelay.value).toEqual(fooDelay);
    });

    it("should not pass delay validation if user introduce non numeric characters", async () => {
      await cli.start();
      expect(cli._cli.questions.delay.validate(cli._cli.questions.delay.filter("asdads"))).toEqual(
        false
      );
    });

    it("should pass delay validation if user introduce numeric characters", async () => {
      await cli.start();
      expect(cli._cli.questions.delay.validate(cli._cli.questions.delay.filter("123230"))).toEqual(
        true
      );
    });
  });

  describe('when user selects "Restart server"', () => {
    beforeEach(() => {
      inquirerMocks.stubs.inquirer.inquire.onCall(0).resolves("restart");
    });

    it("should call to restart server", async () => {
      await cli.start();
      expect(coreInstance.server.restart.callCount).toEqual(1);
    });
  });

  describe('when user selects "restore route variants"', () => {
    beforeEach(() => {
      inquirerMocks.stubs.inquirer.inquire.onCall(0).resolves("restoreVariants");
    });

    it("should call to restore variants", async () => {
      await cli.start();
      expect(coreInstance.mock.restoreRouteVariants.callCount).toEqual(1);
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
      optionWatch.value = false;
      await cli.start();
      expect(optionWatch.value).toEqual(true);
    });

    it("should call to switchWatch server method, passing false if it was enabled", async () => {
      optionWatch.value = true;
      await cli.start();
      expect(optionWatch.value).toEqual(false);
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
      expect.assertions(2);
      const fooLogLevel = "foo-log-level";
      coreMocks.reset();
      cli = new Cli(cliArgs);
      mockOptions();
      optionCli.value = true;
      optionLog.value = fooLogLevel;
      await cli.init();
      inquirerMocks.stubs.inquirer.logsMode.executeCb(true);
      expect(optionLog.value).toEqual(fooLogLevel);
      await cli.start();
      expect(optionLog.value).toEqual("silent");
    });
  });

  describe("when printing header", () => {
    it("should print server url as first element", async () => {
      await cli.start();
      expect(cli._header()[0]).toEqual(expect.stringContaining("Mocks server listening"));
    });

    it("should print localhost as host when it is 0.0.0.0", async () => {
      optionHost.value = "0.0.0.0";
      await cli.start();
      expect(cli._header()[0]).toEqual(expect.stringContaining("http://localhost"));
    });

    it("should print custom host as host", async () => {
      optionHost.value = "foo-host";
      await cli.start();
      expect(cli._header()[0]).toEqual(expect.stringContaining("http://foo-host"));
    });

    it("should print delay in yellow if is greater than 0", async () => {
      optionDelay.hasBeenSet = true;
      optionDelay.value = 1000;
      await cli.start();
      expect(cli._header()[1]).toEqual(expect.stringContaining(chalk.yellow("1000")));
    });

    it("should print legacy delay in yellow if is greater than 0", async () => {
      optionDelay.hasBeenSet = false;
      optionDelayLegacy.value = 1000;
      await cli.start();
      expect(cli._header()[1]).toEqual(expect.stringContaining(chalk.yellow("1000")));
    });

    it("should print delay in green if is equal to 0", async () => {
      optionDelay.hasBeenSet = true;
      optionDelay.value = 0;
      await cli.start();
      expect(cli._header()[1]).toEqual(expect.stringContaining(chalk.green("0")));
    });

    it("should print mocks in red if are equal to 0", async () => {
      coreInstance.mock.plainMocks = [];
      await cli.start();
      expect(cli._header()[3]).toEqual(expect.stringContaining(chalk.red("0")));
    });

    it("should print mocks in green if are greater than 0", async () => {
      coreInstance.mock.plainMocks = [{}, {}, {}, {}];
      await cli.start();
      expect(cli._header()[3]).toEqual(expect.stringContaining(chalk.green("4")));
    });

    it("should print current mock in red if it is null", async () => {
      coreInstance.mock.current = null;
      await cli.start();
      expect(cli._header()[2]).toEqual(expect.stringContaining(chalk.red("-")));
    });

    it("should print current mock in green if it is defined", async () => {
      coreInstance.mock.current = "foo";
      await cli.start();
      expect(cli._header()[2]).toEqual(expect.stringContaining(chalk.green("foo")));
    });

    it("should print current mock in yellow if there are custom routes variants", async () => {
      coreInstance.mock.current = "foo";
      coreInstance.mock.customRoutesVariants = ["foo-variant", "foo-variant-2"];
      await cli.start();
      expect(cli._header()[2]).toEqual(
        expect.stringContaining(chalk.yellow("foo (custom variants: foo-variant,foo-variant-2)"))
      );
    });

    it("should print current routes in red if there are less than 1", async () => {
      coreInstance.mock.routes.plain = [];
      await cli.start();
      expect(cli._header()[4]).toEqual(expect.stringContaining(chalk.red("0")));
    });

    it("should print current routes in green if there are less than 1", async () => {
      coreInstance.mock.routes.plain = [{}, {}];
      await cli.start();
      expect(cli._header()[4]).toEqual(expect.stringContaining(chalk.green("2")));
    });

    it("should print current routes variants in red if there are less than 1", async () => {
      coreInstance.mock.routes.plainVariants = [];
      await cli.start();
      expect(cli._header()[5]).toEqual(expect.stringContaining(chalk.red("0")));
    });

    it("should not print current routes in green if there are more than 1", async () => {
      coreInstance.mock.routes.plainVariants = [{}, {}];
      await cli.start();
      expect(cli._header()[5]).toEqual(expect.stringContaining(chalk.green("2")));
    });

    it("should print watch in yellow if it is disabled", async () => {
      optionWatch.value = false;
      await cli.start();
      expect(cli._header()[7]).toEqual(expect.stringContaining(chalk.yellow("false")));
    });

    it("should print watch in yellow if it is enabled", async () => {
      optionWatch.value = true;
      await cli.start();
      expect(cli._header()[7]).toEqual(expect.stringContaining(chalk.green("true")));
    });
  });

  describe("when displaying alerts", () => {
    it("should not display alerts if core alerts are empty", async () => {
      coreInstance.alerts = [];
      await cli.start();
      expect(cli._alertsHeader().length).toEqual(0);
    });

    it("should display provided alert context", async () => {
      coreInstance.alerts.root.customFlat = [
        {
          message: "foo message",
          context: "foo-context",
        },
      ];
      await cli.start();
      expect(cli._alertsHeader()[0]).toEqual(expect.stringContaining("[foo-context]"));
    });

    it("should display provided alert in yellow when it has no error", async () => {
      expect.assertions(2);
      coreInstance.alerts.root.customFlat = [
        {
          message: "foo message",
        },
      ];
      await cli.start();
      expect(cli._alertsHeader()[0]).toEqual(expect.stringContaining("Warning"));
      expect(cli._alertsHeader()[0]).toEqual(expect.stringContaining(chalk.yellow("foo message")));
    });

    it("should display provided alert in red when it has error", async () => {
      expect.assertions(2);
      coreInstance.alerts.root.customFlat = [
        {
          message: "foo message",
          error: {
            message: "Foo error message",
            stack: "Testing stack\nTesting stack 2\nTesting stack 3\nTesting stack 4",
          },
        },
      ];
      await cli.start();
      expect(cli._alertsHeader()[0]).toEqual(expect.stringContaining("Error"));
      expect(cli._alertsHeader()[0]).toEqual(
        expect.stringContaining(
          chalk.red(
            `foo message: Foo error message\n         Testing stack\n         Testing stack 2\n         Testing stack 3...`
          )
        )
      );
    });
  });

  describe("when server emits change:mock event", () => {
    beforeEach(async () => {
      await cli.start();
      coreInstance.mock.onChange.getCall(0).args[0]();
    });

    it("should exit logs mode", async () => {
      expect(inquirerMocks.stubs.inquirer.exitLogsMode.callCount).toEqual(2);
    });
  });
});
