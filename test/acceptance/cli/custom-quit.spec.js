const path = require("path");

const { CliRunner } = require("../../utils");

const END_SCREEN = "Quit";

jest.setTimeout(20000);

describe("when a customQuit fixture (which has a custom quitMethod) is executed", () => {
  const cliFile = path.resolve(__dirname, "fixtures", "custom-quit-method.js");
  let cliRunner;

  beforeEach(() => {
    expect.assertions(1);
    cliRunner = new CliRunner(cliFile);
  });

  afterEach(async () => {
    await cliRunner.kill();
  });

  it('should print a menu with "Option 1"', async () => {
    await cliRunner.hasPrinted(END_SCREEN);
    expect(cliRunner.logs).toEqual(expect.stringContaining("Option 1"));
  });

  it('should print a menu with "Quit" option', async () => {
    await cliRunner.hasPrinted(END_SCREEN);
    expect(cliRunner.logs).toEqual(expect.stringContaining("Quit"));
  });

  it('should print selected option as "none" in header when inited', async () => {
    await cliRunner.hasPrinted(END_SCREEN);
    expect(cliRunner.logs).toEqual(expect.stringContaining("Selected option: None"));
  });

  it('should print selected option as "option1" when user selects "Option 1"', async () => {
    await cliRunner.hasPrinted(END_SCREEN);
    const newScreen = await cliRunner.newScreenAfter(cliRunner.pressEnter);
    expect(newScreen).toEqual(expect.stringContaining("Selected option: option1"));
  });

  it('should print selected option as "Quit" when user selects "Quit"', async () => {
    await cliRunner.hasPrinted(END_SCREEN);
    cliRunner.cursorDown();
    const newScreen = await cliRunner.newScreenAfter(cliRunner.pressEnter);

    expect(newScreen).toEqual(expect.stringContaining("Selected option: Quit"));
  });

  it("should exit process if user press CTRL+C", async () => {
    await cliRunner.hasPrinted(END_SCREEN);
    cliRunner.pressCtrlC();

    expect(await cliRunner.hasExit()).toEqual(true);
  });
});
