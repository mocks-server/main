const path = require("path");

const { CliRunner } = require("../../utils");

const END_SCREEN = "Exit";

describe("when removeListeners is executed", () => {
  const cliFile = path.resolve(__dirname, "fixtures", "remove-listeners.js");
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

  it("should do nothing after removing Listeners even when user tries to select an option", async done => {
    await cliRunner.hasPrinted(END_SCREEN);
    setTimeout(async () => {
      try {
        await cliRunner.newScreenAfter(cliRunner.pressEnter);
      } catch (error) {
        expect(error.message).toEqual(expect.stringContaining("No new screen was rendered"));
        done();
      }
    }, 600);
  });
});
