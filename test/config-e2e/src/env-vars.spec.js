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
      expect(options).toEqual(expect.arrayContaining(["config.readFile:boolean:false"]));
    });
  });

  describe("when option is String", () => {
    it("option should get the value from it", async () => {
      await run("no-config", "option-types", {
        env: {
          MOCKS_COMPONENT_STRING_WITH_DEFAULT: "foo-from-env",
        },
      });
      expect(runner.exitCode).toEqual(0);
      expect(options).toEqual(
        expect.arrayContaining(["component.stringWithDefault:string:foo-from-env"])
      );
    });
  });

  describe("when option is Number", () => {
    it("option should get the value from it", async () => {
      await run("no-config", "option-types", {
        env: {
          MOCKS_COMPONENT_NUMBER_DEFAULT_ZERO: 5,
        },
      });
      expect(runner.exitCode).toEqual(0);
      expect(options).toEqual(expect.arrayContaining(["component.numberDefaultZero:number:5"]));
    });

    it("option should get the value from it when it contains decimals", async () => {
      await run("no-config", "option-types", {
        env: {
          MOCKS_COMPONENT_NUMBER_DEFAULT_ZERO: 5.4,
        },
      });
      expect(runner.exitCode).toEqual(0);
      expect(options).toEqual(expect.arrayContaining(["component.numberDefaultZero:number:5.4"]));
    });

    it("option should get the value from it when defined as string", async () => {
      await run("no-config", "option-types", {
        env: {
          MOCKS_COMPONENT_NUMBER_DEFAULT_ZERO: "5",
        },
      });
      expect(runner.exitCode).toEqual(0);
      expect(options).toEqual(expect.arrayContaining(["component.numberDefaultZero:number:5"]));
    });

    it("option should get the value from it when defined as string containing decimals", async () => {
      await run("no-config", "option-types", {
        env: {
          MOCKS_COMPONENT_NUMBER_DEFAULT_ZERO: "5.4",
        },
      });
      expect(runner.exitCode).toEqual(0);
      expect(options).toEqual(expect.arrayContaining(["component.numberDefaultZero:number:5.4"]));
    });
  });

  describe("when option is Boolean and default value is true", () => {
    it("option should be true if no env var is provided", async () => {
      await run("no-config", "option-types");
      expect(runner.exitCode).toEqual(0);
      expect(options).toEqual(
        expect.arrayContaining(["component.booleanDefaultTrue:boolean:true"])
      );
    });

    it("option should be false if env var is provided", async () => {
      await run("no-config", "option-types", {
        env: {
          MOCKS_COMPONENT_BOOLEAN_DEFAULT_TRUE: false,
        },
      });
      expect(runner.exitCode).toEqual(0);
      expect(options).toEqual(
        expect.arrayContaining(["component.booleanDefaultTrue:boolean:false"])
      );
    });

    it("option should be false if env var is provided as false string", async () => {
      await run("no-config", "option-types", {
        env: {
          MOCKS_COMPONENT_BOOLEAN_DEFAULT_TRUE: "false",
        },
      });
      expect(runner.exitCode).toEqual(0);
      expect(options).toEqual(
        expect.arrayContaining(["component.booleanDefaultTrue:boolean:false"])
      );
    });

    it("option should be false if env var is provided as zero string", async () => {
      await run("no-config", "option-types", {
        env: {
          MOCKS_COMPONENT_BOOLEAN_DEFAULT_TRUE: "0",
        },
      });
      expect(runner.exitCode).toEqual(0);
      expect(options).toEqual(
        expect.arrayContaining(["component.booleanDefaultTrue:boolean:false"])
      );
    });

    it("option should be false if env var is provided as zero", async () => {
      await run("no-config", "option-types", {
        env: {
          MOCKS_COMPONENT_BOOLEAN_DEFAULT_TRUE: 0,
        },
      });
      expect(runner.exitCode).toEqual(0);
      expect(options).toEqual(
        expect.arrayContaining(["component.booleanDefaultTrue:boolean:false"])
      );
    });
  });

  describe("when option is Boolean and default value is false", () => {
    it("option should be true if env var is provided", async () => {
      await run("no-config", "option-types", {
        env: {
          MOCKS_COMPONENT_BOOLEAN_DEFAULT_FALSE: true,
        },
      });
      expect(runner.exitCode).toEqual(0);
      expect(options).toEqual(
        expect.arrayContaining(["component.booleanDefaultFalse:boolean:true"])
      );
    });

    it("option should be true if env var is provided as true string", async () => {
      await run("no-config", "option-types", {
        env: {
          MOCKS_COMPONENT_BOOLEAN_DEFAULT_FALSE: "true",
        },
      });
      expect(runner.exitCode).toEqual(0);
      expect(options).toEqual(
        expect.arrayContaining(["component.booleanDefaultFalse:boolean:true"])
      );
    });

    it("option should be true if env var is provided as 1 string", async () => {
      await run("no-config", "option-types", {
        env: {
          MOCKS_COMPONENT_BOOLEAN_DEFAULT_FALSE: "1",
        },
      });
      expect(runner.exitCode).toEqual(0);
      expect(options).toEqual(
        expect.arrayContaining(["component.booleanDefaultFalse:boolean:true"])
      );
    });

    it("option should be true if env var is provided as 1", async () => {
      await run("no-config", "option-types", {
        env: {
          MOCKS_COMPONENT_BOOLEAN_DEFAULT_FALSE: 1,
        },
      });
      expect(runner.exitCode).toEqual(0);
      expect(options).toEqual(
        expect.arrayContaining(["component.booleanDefaultFalse:boolean:true"])
      );
    });
  });

  describe("when option is Object", () => {
    it("option should merge the value from env var", async () => {
      await run("no-config", "option-types", {
        env: {
          MOCKS_COMPONENT_OBJECT_WITH_DEFAULT: '{"foo2":"var2","foo3":false,"foo4":5}',
        },
      });
      expect(runner.exitCode).toEqual(0);
      expect(options).toEqual(
        expect.arrayContaining([
          'component.objectWithDefault:object:{"foo":"var","foo2":"var2","foo3":false,"foo4":5}',
        ])
      );
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

      expect(options).toEqual(
        expect.arrayContaining(["component.alias:string:alias-from-env-var"])
      );
      expect(options).toEqual(
        expect.arrayContaining(["fooNamespace.fooOption:string:option-from-env-var"])
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

      expect(options).toEqual(
        expect.arrayContaining(["component.alias:string:alias-from-env-var"])
      );
    });
  });
});
