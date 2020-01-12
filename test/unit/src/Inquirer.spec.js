/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const inquirer = require("inquirer");
const sinon = require("sinon");
const chalk = require("chalk");

const Inquirer = require("../../../src/Inquirer").Inquirer;

const fooQuestions = {
  main: {
    type: "list",
    message: "Select action:",
    name: "value",
    choices: [
      {
        name: "Option 1",
        value: "option1"
      }
    ]
  }
};

describe("Inquirer", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("display name", () => {
    it("should return package name", async () => {
      const cli = new Inquirer(fooQuestions);
      expect(cli.displayName).toEqual("@mocks-server/plugin-inquirer-cli");
    });
  });

  describe("when initing questions", () => {
    it("should add an extra exit option to main menu", () => {
      const cli = new Inquirer(fooQuestions);
      expect(cli._questions.main.choices[2].name).toEqual("Exit");
    });

    it("should not add an extra option if main question does not exists", () => {
      const questionsWithoutMain = { notMain: fooQuestions.main };

      const cli = new Inquirer(questionsWithoutMain);
      expect(cli._questions.notMain.choices.length).toEqual(1);
    });

    describe("when quitMethod option is provided", () => {
      it("should add it as an extra option to main menu choices", () => {
        const fooQuitMethodName = "foo name";
        const cli = new Inquirer(fooQuestions, null, {
          name: fooQuitMethodName,
          action: () => {}
        });
        expect(cli._questions.main.choices[2].name).toEqual(fooQuitMethodName);
      });
    });
  });

  describe("quit method", () => {
    it("should call to exit process", () => {
      sandbox.stub(process, "exit");
      const cli = new Inquirer(fooQuestions);
      cli.quit();
      expect(process.exit.callCount).toEqual(1);
    });

    describe("when quitMethod option is provided", () => {
      it("should call to provided quitMethod action", () => {
        const fooQuitMethodAction = sandbox.spy();
        const cli = new Inquirer(fooQuestions, null, {
          name: "foo name",
          action: fooQuitMethodAction
        });
        cli.quit();
        expect(fooQuitMethodAction.callCount).toEqual(1);
      });
    });
  });

  describe("clearScreen method", () => {
    it("should write Clear screen characters in process stdout", () => {
      sandbox.stub(process.stdout, "write");
      const cli = new Inquirer(fooQuestions);
      cli.clearScreen();
      expect(process.stdout.write.calledWith("\x1Bc")).toEqual(true);
    });

    it("should print all strings returned by header method provided to constructor", () => {
      const fooHeader = "foo header";
      sandbox.stub(process.stdout, "write");
      sandbox.stub(console, "log");
      const cli = new Inquirer(fooQuestions, () => [fooHeader]);
      cli.clearScreen();
      expect(console.log.getCall(0).args[0]).toEqual(expect.stringContaining(fooHeader));
    });

    it("should not print header if header option is set to false", () => {
      const fooHeader = "foo header";
      sandbox.stub(process.stdout, "write");
      sandbox.stub(console, "log");
      const cli = new Inquirer(fooQuestions, () => [fooHeader]);
      cli.clearScreen({
        header: false
      });
      expect(console.log.getCalls().length).toEqual(0);
    });
  });

  describe("inquire method", () => {
    it("should return the inquirer returned value", async () => {
      expect.assertions(1);
      const fooValue = "foo-value";
      sandbox
        .stub(inquirer, "prompt")
        .usingPromise()
        .resolves({ value: fooValue });
      const cli = new Inquirer(fooQuestions);
      expect(await cli.inquire("main")).toEqual(fooValue);
    });

    it("should call to inquire prompt method, passing the correspondant question", async () => {
      expect.assertions(1);
      sandbox
        .stub(inquirer, "prompt")
        .usingPromise()
        .resolves({});
      const cli = new Inquirer(fooQuestions);
      await cli.inquire("main");
      expect(inquirer.prompt.getCall(0).args[0].message).toEqual("Select action:");
    });

    it("should call to remove keypress listener after inquire has finished", async () => {
      expect.assertions(1);
      sandbox
        .stub(inquirer, "prompt")
        .usingPromise()
        .resolves({});
      const cli = new Inquirer(fooQuestions);
      process.stdin.on("keypress", () => {});
      sandbox.stub(process.stdin, "removeListener");
      await cli.inquire("main");
      expect(process.stdin.removeListener.getCall(0).args[0]).toEqual("keypress");
    });

    it('should call to quit method if inquired question is "main" and answer value is "quit"', async () => {
      expect.assertions(1);
      sandbox.stub(process, "exit");
      sandbox
        .stub(inquirer, "prompt")
        .usingPromise()
        .resolves({ value: "quit" });
      const cli = new Inquirer(fooQuestions);
      await cli.inquire("main");
      expect(process.exit.callCount).toEqual(1);
    });
  });

  describe("logs mode method", () => {
    let fooKeyPresser;
    let fakeRawMode = false;

    const FooKeyPresser = class FooKeyPresser {
      constructor(key = "a") {
        this._key = key;
        this.handler = this.handler.bind(this);
      }

      handler(eventName, callBack) {
        this._callBack = callBack;
        setTimeout(() => {
          callBack(this._key);
        }, 200);
      }

      set key(keyToPress) {
        this._key = keyToPress;
      }
    };

    beforeEach(() => {
      fooKeyPresser = new FooKeyPresser();
      sandbox.stub(process, "exit");
      sandbox.stub(process.stdin, "resume");
      sandbox.stub(process.stdin, "removeListener");
      sandbox.stub(process.stdin, "setEncoding");
      sandbox.stub(process.stdout, "write");
      sandbox.stub(process.stdin, "on").callsFake(fooKeyPresser.handler);
      sandbox.spy(console, "log");
    });

    afterEach(() => {
      if (fakeRawMode) {
        delete process.stdin.setRawMode;
      }
    });

    it("should call to clear Screen", async () => {
      const cli = new Inquirer(fooQuestions);
      await cli.logsMode();
      expect(process.stdout.write.calledWith("\x1Bc")).toEqual(true);
    });

    it("should print that logs mode started", async () => {
      const cli = new Inquirer(fooQuestions);
      await cli.logsMode();
      expect(
        console.log.calledWith(
          chalk.blue("Displaying logs. Press any key to display main menu again")
        )
      ).toEqual(true);
    });

    it("should call to provided callback", async () => {
      const cli = new Inquirer(fooQuestions);
      const fooCallBack = sinon.spy();
      await cli.logsMode(fooCallBack);
      expect(fooCallBack.callCount).toEqual(1);
    });

    it("should call to exit process if pressed key is equal to CTRL+C", async () => {
      fooKeyPresser.key = "\u0003";
      const cli = new Inquirer(fooQuestions);
      await cli.logsMode();
      expect(process.exit.callCount).toEqual(1);
    });

    it("should not call to setRawMode if process has it available", async () => {
      if (process.stdin.setRawMode) {
        sandbox.stub(process.stdin, "setRawMode");
      } else {
        fakeRawMode = true;
        process.stdin.setRawMode = sandbox.stub();
      }
      const cli = new Inquirer(fooQuestions);
      await cli.logsMode();
      expect(process.stdin.setRawMode.callCount).toEqual(2);
    });

    it("should not call to setRawMode if process has not it available", async () => {
      if (process.stdin.setRawMode) {
        sandbox.stub(process.stdin, "setRawMode");
      } else {
        fakeRawMode = true;
        process.stdin.setRawMode = sandbox.stub();
      }
      const originalStdin = process.stdin;
      process.stdin.setRawMode = false;
      const cli = new Inquirer(fooQuestions);
      await cli.logsMode();
      process.stdin = originalStdin;
      expect(process.stdin.setRawMode.callCount).toEqual(undefined);
    });
  });

  describe("exitLogsMode method", () => {
    beforeEach(() => {
      sandbox.stub(process.stdin, "removeListener");
    });

    it("should do nothing if logs mode is not currently enabled", async () => {
      const cli = new Inquirer(fooQuestions);
      await cli.exitLogsMode();
      expect(process.stdin.removeListener.callCount).toEqual(0);
    });
  });
});
