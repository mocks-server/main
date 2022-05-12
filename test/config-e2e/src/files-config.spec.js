const { fixtureRunner, optionsFromLogs } = require("./support/utils");

describe("Config from files", () => {
  let runner, options;

  const run = async function (folder, file, runnerOptions) {
    runner = fixtureRunner(folder, file, runnerOptions);
    await runner.hasExited();
    options = optionsFromLogs(runner.logs.current);
  };

  describe("when no config is provided", () => {
    it("config.readFile option should be true", async () => {
      await run("no-config", "only-init");
      expect(runner.exitCode).toEqual(0);
      expect(options).toEqual(expect.arrayContaining(["config.readFile:boolean:true"]));
    });
  });

  describe("when programmatic config is provided", () => {
    it("should assign value from it when defined", async () => {
      await run("no-config", "two-namespaces");

      expect(options).toEqual(expect.arrayContaining(["component.alias:string:foo-alias"]));
      expect(options).toEqual(
        expect.arrayContaining(["firstNamespace.fooOption:string:foo-value"])
      );
    });
  });

  describe("when package.json config is provided", () => {
    it("should assign value from it", async () => {
      await run("package-config", "two-namespaces");

      expect(options).toEqual(
        expect.arrayContaining(["component.alias:string:alias-from-package"])
      );
    });
  });

  describe("when readFiles is disabled using env var", () => {
    it("should not assign value from it", async () => {
      await run("package-config", "two-namespaces", {
        env: {
          MOCKS_CONFIG_READ_FILE: false,
        },
      });

      expect(options).toEqual(expect.arrayContaining(["component.alias:string:foo-alias"]));
    });
  });

  describe("when readFiles is disabled using argument", () => {
    it("should not assign value from it", async () => {
      await run("package-config", "two-namespaces", {
        args: ["--no-config.readFile"],
      });

      expect(options).toEqual(expect.arrayContaining(["component.alias:string:foo-alias"]));
    });
  });

  describe("when .mocksrc.json config is provided", () => {
    it("should assign value from it", async () => {
      await run("json-config", "two-namespaces");

      expect(options).toEqual(expect.arrayContaining(["component.alias:string:alias-from-json"]));
    });

    it("should assign value from it when option is in root", async () => {
      await run("json-config-root", "root-options");

      expect(options).toEqual(expect.arrayContaining(["booleanDefaultTrue:boolean:false"]));
    });

    it("should assign boolean type to boolean vars", async () => {
      await run("json-config-option-types", "option-types");

      expect(options).toEqual(
        expect.arrayContaining(["component.booleanDefaultTrue:boolean:false"])
      );
      expect(options).toEqual(
        expect.arrayContaining(["component.booleanDefaultFalse:boolean:true"])
      );
    });

    it("should assign string type to string vars", async () => {
      await run("json-config-option-types", "option-types");

      expect(options).toEqual(
        expect.arrayContaining(["component.stringWithDefault:string:foo-from-file"])
      );
    });

    it("should merge object when option is of type object", async () => {
      await run("json-config-option-types", "option-types");

      expect(options).toEqual(
        expect.arrayContaining([
          'component.objectWithDefault:object:{"foo":"var","foo2":"var2","foo3":false,"foo4":5}',
        ])
      );
    });

    it("should assign number type to number vars", async () => {
      await run("json-config-option-types", "option-types");

      expect(options).toEqual(expect.arrayContaining(["component.numberDefaultZero:number:6.51"]));
    });
  });

  describe("when fileSearchPlaces option is provided", () => {
    it("should search for custom files and assign value from it", async () => {
      await run("json-config-custom-name", "two-namespaces", {
        args: ["--config.fileSearchPlaces", "custom.json"],
      });

      expect(options).toEqual(expect.arrayContaining(["component.alias:string:alias-from-json"]));
    });
  });

  describe("when .mocksrc.json config is provided with namespaces", () => {
    it("should assign values from it", async () => {
      await run("json-config-two-namespaces", "several-namespaces");

      expect(options).toEqual(
        expect.arrayContaining(["namespace.component.alias:string:alias-from-json"])
      );
      expect(options).toEqual(
        expect.arrayContaining([
          "firstNamespace.secondNamespace.fooOption:string:option-from-file",
        ])
      );
    });

    it("should assign values from it when namespaces are added after init method", async () => {
      await run("json-config-two-namespaces", "several-namespaces-after-init");

      expect(options).toEqual(
        expect.arrayContaining(["namespace.component.alias:string:alias-from-json"])
      );
      expect(options).toEqual(
        expect.arrayContaining([
          "firstNamespace.secondNamespace.fooOption:string:option-from-file",
        ])
      );
    });
  });

  describe("when .mocksrc.json config is provided with nested namespaces", () => {
    it("should assign values from it", async () => {
      await run("json-config-nested-namespaces", "nested-namespaces");

      expect(options).toEqual(
        expect.arrayContaining(["namespace.component.alias:string:alias-from-json"])
      );
      expect(options).toEqual(
        expect.arrayContaining([
          "firstNamespace.secondNamespace.fooOption:string:option-from-file",
        ])
      );
      expect(options).toEqual(
        expect.arrayContaining([
          "firstNamespace.secondNamespace.thirdNamespace.fooOption2:boolean:true",
        ])
      );
      expect(options).toEqual(
        expect.arrayContaining([
          "firstNamespace.secondNamespace.thirdNamespace.fooOption3:string:3-from-file",
        ])
      );
    });
  });

  describe("when .mocksrc.yaml config is provided", () => {
    it("should assign value from it", async () => {
      await run("yaml-config", "two-namespaces");

      expect(options).toEqual(expect.arrayContaining(["component.alias:string:alias-from-yaml"]));
    });
  });

  describe("when mocks.config.js file is provided", () => {
    it("should assign value from it", async () => {
      await run("js-config", "two-namespaces");

      expect(options).toEqual(expect.arrayContaining(["component.alias:string:alias-from-js"]));
    });
  });

  describe("when mocks.config.js file is provided and it exports a function", () => {
    it("should assign value from the result of executing the function", async () => {
      await run("js-function-config", "two-namespaces");

      expect(options).toEqual(
        expect.arrayContaining(["component.alias:string:alias-from-js-function"])
      );
    });
  });

  describe("when mocks.config.js file is provided and it exports an async function", () => {
    it("should assign value from the async result of executing the function", async () => {
      await run("js-async-function-config", "two-namespaces");

      expect(options).toEqual(
        expect.arrayContaining(["component.alias:string:alias-from-async-js-function"])
      );
    });
  });

  describe("when env var is provided", () => {
    it("should overwrite the value from file", async () => {
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
