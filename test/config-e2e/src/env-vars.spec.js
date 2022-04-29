const { fixtureRunner, optionsFromLogs } = require("./support/utils");

describe("Config from env vars", () => {
  let runner, options;

  const run = async function (folder, file, runnerOptions) {
    runner = fixtureRunner(folder, file, runnerOptions);
    await runner.hasExited();
    options = optionsFromLogs(runner.logs.join);
  };

  describe("when env var is provided", () => {
    it("option should get the value from env var", async () => {
      await run("no-config", "only-init", {
        env: {
          MOCKS_CONFIG_READ_FILE: false,
        },
      });
      expect(runner.exitCode).toEqual(0);
      expect(options).toEqual(expect.arrayContaining(["config.readFile:false"]));
    });
  });

  describe("when programmatic config is provided", () => {
    it("env var should overwrite the value from it", async () => {
      await run("js-async-function-config", "two-namespaces", {
        env: {
          MOCKS_FOO_NAMESPACE_FOO_OPTION: "option-from-env-var",
          MOCKS_COMPONENT_ALIAS: "alias-from-env-var",
        },
      });

      expect(options).toEqual(expect.arrayContaining(["component.alias:alias-from-env-var"]));
      expect(options).toEqual(
        expect.arrayContaining(["fooNamespace.fooOption:option-from-env-var"])
      );
    });
  });

  describe("when file is provided", () => {
    it("env var should overwrite the value from it", async () => {
      await run("js-async-function-config", "two-namespaces", {
        env: {
          MOCKS_COMPONENT_ALIAS: "alias-from-env-var",
        },
      });

      expect(options).toEqual(expect.arrayContaining(["component.alias:alias-from-env-var"]));
    });
  });
});
