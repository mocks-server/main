const path = require("path");

const { CliRunner } = require("../../utils");

const END_SCREEN = "Exit";

describe("when readme example is executed", () => {
  const cliFile = path.resolve(__dirname, "fixtures", "readme-example.js");
  let cliRunner;

  beforeEach(() => {
    expect.assertions(1);
    cliRunner = new CliRunner(cliFile);
  });

  afterEach(async () => {
    await cliRunner.kill();
  });

  it('should print a menu with "Main option 1" and "Main option 2"', async () => {
    expect.assertions(2);
    await cliRunner.hasPrinted(END_SCREEN);
    expect(cliRunner.logs).toEqual(expect.stringContaining("Main option 1"));
    expect(cliRunner.logs).toEqual(expect.stringContaining("Main option 2"));
  });

  it('should print a menu with "Exit" option', async () => {
    await cliRunner.hasPrinted(END_SCREEN);
    expect(cliRunner.logs).toEqual(expect.stringContaining("Exit"));
  });

  it('should print selected option as "none" in header when inited', async () => {
    await cliRunner.hasPrinted(END_SCREEN);
    expect(cliRunner.logs).toEqual(expect.stringContaining("Selected option: None"));
  });

  it('should print selected option as "option1" when user selects "Main option 1"', async () => {
    await cliRunner.hasPrinted(END_SCREEN);
    const newScreen = await cliRunner.newScreenAfter(cliRunner.pressEnter);
    expect(newScreen).toEqual(expect.stringContaining("Selected option: option1"));
  });

  it('should print selected option as "option2" when user selects "Main option 2"', async () => {
    await cliRunner.hasPrinted(END_SCREEN);
    cliRunner.cursorDown();
    const newScreen = await cliRunner.newScreenAfter(cliRunner.pressEnter);
    expect(newScreen).toEqual(expect.stringContaining("Selected option: option2"));
  });

  it('should exit process when user selects "Exit"', async () => {
    await cliRunner.hasPrinted(END_SCREEN);
    cliRunner.cursorDown();
    cliRunner.cursorDown();
    cliRunner.pressEnter();

    expect(await cliRunner.hasExit()).toEqual(true);
  });

  it("should exit process if user press CTRL+C", async () => {
    await cliRunner.hasPrinted(END_SCREEN);
    cliRunner.pressCtrlC();

    expect(await cliRunner.hasExit()).toEqual(true);
  });
});
