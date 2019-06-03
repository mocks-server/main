const path = require("path");

const { CliRunner } = require("../utils");

describe("when mocks-server binary is executed", () => {
  const binFile = path.resolve(__dirname, "..", "..", "bin", "mocks-server");
  let cliRunner;

  it("should throw a controlled error if no features folder is provided", async () => {
    cliRunner = new CliRunner([binFile]);
    await cliRunner.hasExit();
    expect(await cliRunner.logs).toEqual(
      expect.stringContaining("Please provide a path to a folder containing features")
    );
  });
});
