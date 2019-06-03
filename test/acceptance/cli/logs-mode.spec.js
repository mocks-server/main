const path = require("path");

const { CliRunner } = require("../../utils");

const END_SCREEN = "Exit";

describe("when logs-mode fixture is executed", () => {
  const cliFile = path.resolve(__dirname, "fixtures", "logs-mode.js");
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

  it('should print a menu with "Exit" option', async () => {
    await cliRunner.hasPrinted(END_SCREEN);
    expect(cliRunner.logs).toEqual(expect.stringContaining("Exit"));
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

  it('should enter in logs mode when user select "Display logs"', async () => {
    await cliRunner.hasPrinted(END_SCREEN);
    cliRunner.cursorDown();
    const newScreen = await cliRunner.newScreenAfter(cliRunner.pressEnter);

    expect(newScreen).toEqual(expect.stringContaining("Displaying logs"));
  });

  it("should exit logs mode when user press a key", async () => {
    await cliRunner.hasPrinted(END_SCREEN);
    cliRunner.cursorDown();
    await cliRunner.newScreenAfter(cliRunner.pressEnter);
    const newScreen = await cliRunner.newScreenAfter(cliRunner.pressEnter);

    expect(newScreen).toEqual(expect.stringContaining("Selected option: logs"));
  });

  it("should exit process when displaying logs if user press CTRL+C", async () => {
    await cliRunner.hasPrinted(END_SCREEN);
    cliRunner.cursorDown();
    await cliRunner.newScreenAfter(cliRunner.pressEnter);
    cliRunner.pressCtrlC();

    expect(await cliRunner.hasExit()).toEqual(true);
  });
});
