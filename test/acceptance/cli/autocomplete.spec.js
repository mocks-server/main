const path = require("path");

const { CliRunner } = require("../../utils");

const END_SCREEN = "Exit";

const RENDER_TIME_OUT = 10000;
const INSERT_TAGS = "Insert tags";

describe("when autocomplete fixture is executed", () => {
  jest.setTimeout(15000);
  const cliFile = path.resolve(__dirname, "fixtures", "autocomplete.js");
  let cliRunner;

  beforeEach(() => {
    expect.assertions(1);
    cliRunner = new CliRunner(cliFile);
  });

  afterEach(async () => {
    await cliRunner.kill();
  });

  it('should print a menu with "Select tags"', async () => {
    await cliRunner.hasPrinted(END_SCREEN, RENDER_TIME_OUT);
    expect(cliRunner.logs).toEqual(expect.stringContaining("Select tags"));
  });

  it('should print a menu with "Exit" option', async () => {
    await cliRunner.hasPrinted(END_SCREEN, RENDER_TIME_OUT);
    expect(cliRunner.logs).toEqual(expect.stringContaining("Exit"));
  });

  it('should print selected option as "none" in header when inited', async () => {
    await cliRunner.hasPrinted(END_SCREEN, RENDER_TIME_OUT);
    expect(cliRunner.logs).toEqual(expect.stringContaining("Selected option: None"));
  });

  it('should allow to choose all available tags when "Select tags" is selected', async () => {
    expect.assertions(3);
    await cliRunner.hasPrinted(END_SCREEN, RENDER_TIME_OUT);
    const newScreen = await cliRunner.newScreenAfter(cliRunner.pressEnter, RENDER_TIME_OUT);
    expect(newScreen).toEqual(expect.stringContaining("a-tag"));
    expect(newScreen).toEqual(expect.stringContaining("b-tag"));
    expect(newScreen).toEqual(expect.stringContaining("c-tag"));
  });

  it('should allow to choose only "a-tag" tag when "Select tags" is selected, and "a" is pressed', async () => {
    expect.assertions(3);
    await cliRunner.hasPrinted(END_SCREEN, RENDER_TIME_OUT);
    await cliRunner.newScreenAfter(cliRunner.pressEnter, RENDER_TIME_OUT);
    await cliRunner.hasPrinted(
      INSERT_TAGS,
      () => {
        cliRunner.write("a");
      },
      RENDER_TIME_OUT
    );
    await cliRunner.hasPrinted(INSERT_TAGS, RENDER_TIME_OUT);
    cliRunner.flush();
    await cliRunner.hasPrinted(INSERT_TAGS, RENDER_TIME_OUT);

    expect(cliRunner.logs).toEqual(expect.stringContaining("a-tag"));
    expect(cliRunner.logs).not.toEqual(expect.stringContaining("b-tag"));
    expect(cliRunner.logs).not.toEqual(expect.stringContaining("c-tag"));
  });

  it('should print selected option as "a-tag" when a-tag is selected in autocomplete', async () => {
    await cliRunner.hasPrinted(END_SCREEN, RENDER_TIME_OUT);
    await cliRunner.newScreenAfter(cliRunner.pressEnter, RENDER_TIME_OUT);
    await cliRunner.hasPrinted(
      INSERT_TAGS,
      () => {
        cliRunner.write("a");
      },
      RENDER_TIME_OUT
    );
    await cliRunner.hasPrinted(INSERT_TAGS, RENDER_TIME_OUT);
    await cliRunner.hasPrinted(INSERT_TAGS, RENDER_TIME_OUT);
    const newScreen = await cliRunner.newScreenAfter(cliRunner.pressEnter, RENDER_TIME_OUT);

    expect(newScreen).toEqual(expect.stringContaining("Selected option: a-tag"));
  });

  it('should allow to choose only "b-tag" tag when "Select tags" is selected, and "b" is pressed', async () => {
    expect.assertions(4);
    await cliRunner.hasPrinted(END_SCREEN, RENDER_TIME_OUT);
    await cliRunner.newScreenAfter(cliRunner.pressEnter, RENDER_TIME_OUT);
    await cliRunner.hasPrinted(
      INSERT_TAGS,
      () => {
        cliRunner.write("b");
      },
      RENDER_TIME_OUT
    );
    cliRunner.flush();
    await cliRunner.hasPrinted(INSERT_TAGS, RENDER_TIME_OUT);
    expect(cliRunner.logs).toEqual(expect.stringContaining("Searching..."));
    cliRunner.flush();
    await cliRunner.hasPrinted(INSERT_TAGS, RENDER_TIME_OUT);

    expect(cliRunner.logs).toEqual(expect.stringContaining("b-tag"));
    expect(cliRunner.logs).not.toEqual(expect.stringContaining("a-tag"));
    expect(cliRunner.logs).not.toEqual(expect.stringContaining("c-tag"));
  });

  it('should print selected option as "b-tag" when b-tag is selected in autocomplete', async () => {
    await cliRunner.hasPrinted(END_SCREEN, RENDER_TIME_OUT);
    await cliRunner.newScreenAfter(cliRunner.pressEnter, RENDER_TIME_OUT);
    await cliRunner.hasPrinted(
      INSERT_TAGS,
      () => {
        cliRunner.write("b");
      },
      RENDER_TIME_OUT
    );
    await cliRunner.hasPrinted(INSERT_TAGS, RENDER_TIME_OUT);
    await cliRunner.hasPrinted(INSERT_TAGS, RENDER_TIME_OUT);
    const newScreen = await cliRunner.newScreenAfter(cliRunner.pressEnter, RENDER_TIME_OUT);

    expect(newScreen).toEqual(expect.stringContaining("Selected option: b-tag"));
  });

  it('should allow to choose only "c-tag" tag when "Select tags" is selected, and "c" is pressed', async () => {
    expect.assertions(4);
    await cliRunner.hasPrinted(END_SCREEN, RENDER_TIME_OUT);
    await cliRunner.newScreenAfter(cliRunner.pressEnter, RENDER_TIME_OUT);
    await cliRunner.hasPrinted(
      INSERT_TAGS,
      () => {
        cliRunner.write("c");
      },
      RENDER_TIME_OUT
    );
    cliRunner.flush();
    await cliRunner.hasPrinted(INSERT_TAGS, RENDER_TIME_OUT);
    expect(cliRunner.logs).toEqual(expect.stringContaining("Searching..."));
    cliRunner.flush();
    await cliRunner.hasPrinted(INSERT_TAGS, RENDER_TIME_OUT);

    expect(cliRunner.logs).toEqual(expect.stringContaining("c-tag"));
    expect(cliRunner.logs).not.toEqual(expect.stringContaining("a-tag"));
    expect(cliRunner.logs).not.toEqual(expect.stringContaining("b-tag"));
  });

  it('should print selected option as "c-tag" when c-tag is selected in autocomplete', async () => {
    await cliRunner.hasPrinted(END_SCREEN, RENDER_TIME_OUT);
    await cliRunner.newScreenAfter(cliRunner.pressEnter, RENDER_TIME_OUT);
    await cliRunner.hasPrinted(
      INSERT_TAGS,
      () => {
        cliRunner.write("c");
      },
      RENDER_TIME_OUT
    );
    await cliRunner.hasPrinted(INSERT_TAGS, RENDER_TIME_OUT);
    await cliRunner.hasPrinted(INSERT_TAGS, RENDER_TIME_OUT);
    const newScreen = await cliRunner.newScreenAfter(cliRunner.pressEnter, RENDER_TIME_OUT);

    expect(newScreen).toEqual(expect.stringContaining("Selected option: c-tag"));
  });
});
