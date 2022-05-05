const { fixtureRunner, optionsFromLogs } = require("./support/utils");

describe("Config from args", () => {
  let runner, options;

  const run = async function (folder, file, runnerOptions) {
    runner = fixtureRunner(folder, file, runnerOptions);
    await runner.hasExited();
    options = optionsFromLogs(runner.logs.join);
  };

  describe("when argument is provided", () => {
    it("option should get the value from it", async () => {
      await run("no-config", "only-init", {
        args: ["--no-config.readFile"],
      });
      expect(runner.exitCode).toEqual(0);
      expect(options).toEqual(expect.arrayContaining(["config.readFile:boolean:false"]));
    });

    it("option should not get the value from it when readArguments is disabled in init method", async () => {
      await run("no-config", "disable-read-arguments", {
        args: ["--no-config.readFile"],
      });
      expect(runner.exitCode).toEqual(0);
      expect(options).toEqual(expect.arrayContaining(["config.readFile:boolean:true"]));
    });
  });

  describe("when argument is provided to namespace", () => {
    it("option should get the value from it", async () => {
      await run("no-config", "several-namespaces", {
        args: ["--namespace.component.alias=alias-from-arg"],
      });
      expect(runner.exitCode).toEqual(0);
      expect(options).toEqual(
        expect.arrayContaining(["namespace.component.alias:string:alias-from-arg"])
      );
    });

    it("option should get the value from it when namespaces are added after init method", async () => {
      await run("no-config", "several-namespaces-after-init", {
        args: ["--namespace.component.alias=alias-from-arg"],
      });
      expect(runner.exitCode).toEqual(0);
      expect(options).toEqual(
        expect.arrayContaining(["namespace.component.alias:string:alias-from-arg"])
      );
    });
  });

  describe("when option is string", () => {
    it("option should get the value from it", async () => {
      await run("no-config", "option-types", {
        args: ["--component.stringWithDefault=foo-from-args"],
      });
      expect(runner.exitCode).toEqual(0);
      expect(options).toEqual(
        expect.arrayContaining(["component.stringWithDefault:string:foo-from-args"])
      );
    });
  });

  describe("when option is object", () => {
    it("option should merge the value from it", async () => {
      await run("no-config", "option-types", {
        args: ['--component.objectWithDefault={"foo2":"var2"}'],
      });
      expect(runner.exitCode).toEqual(0);
      expect(options).toEqual(
        expect.arrayContaining(['component.objectWithDefault:object:{"foo":"var","foo2":"var2"}'])
      );
    });

    it("should merge value from env vars and files when option is of type object", async () => {
      await run("json-config-option-types", "option-types", {
        args: ['--component.objectWithDefault={"foo2":"from-arg"}'],
        env: {
          MOCKS_COMPONENT_OBJECT_WITH_DEFAULT: '{"foo2":"from-env","foo3":true,"foo4":5}',
        },
      });

      expect(options).toEqual(
        expect.arrayContaining([
          'component.objectWithDefault:object:{"foo":"var","foo2":"from-arg","foo3":true,"foo4":5}',
        ])
      );
    });
  });

  describe("when option is boolean and default value is true", () => {
    it("option should be false if --no argument is provided", async () => {
      await run("no-config", "option-types", {
        args: ["--no-component.booleanDefaultTrue"],
      });
      expect(runner.exitCode).toEqual(0);
      expect(options).toEqual(
        expect.arrayContaining(["component.booleanDefaultTrue:boolean:false"])
      );
    });
  });

  describe("when option is boolean and default value is true and env var is provided", () => {
    it("option should be false if --no argument is provided", async () => {
      await run("no-config", "option-types", {
        args: ["--no-component.booleanDefaultTrue"],
        env: {
          MOCKS_COMPONENT_BOOLEAN_DEFAULT_TRUE: true,
        },
      });
      expect(runner.exitCode).toEqual(0);
      expect(options).toEqual(
        expect.arrayContaining(["component.booleanDefaultTrue:boolean:false"])
      );
    });
  });

  describe("when option is boolean and default value is false", () => {
    it("option should be true if argument is provided", async () => {
      await run("no-config", "option-types", {
        args: ["--component.booleanDefaultFalse"],
      });
      expect(runner.exitCode).toEqual(0);
      expect(options).toEqual(
        expect.arrayContaining(["component.booleanDefaultFalse:boolean:true"])
      );
    });
  });

  describe("when option is number", () => {
    it("option should be of type number", async () => {
      await run("no-config", "option-types", {
        args: ["--component.numberDefaultZero=5"],
      });
      expect(runner.exitCode).toEqual(0);
      expect(options).toEqual(expect.arrayContaining(["component.numberDefaultZero:number:5"]));
    });

    it("option value should include decimals", async () => {
      await run("no-config", "option-types", {
        args: ["--component.numberDefaultZero=5.34"],
      });
      expect(runner.exitCode).toEqual(0);
      expect(options).toEqual(expect.arrayContaining(["component.numberDefaultZero:number:5.34"]));
    });
  });

  describe("when option is boolean and default value is false and env var is provided", () => {
    it("option should be true if argument is provided", async () => {
      await run("no-config", "option-types", {
        args: ["--component.booleanDefaultFalse"],
        env: {
          MOCKS_COMPONENT_BOOLEAN_DEFAULT_TRUE: false,
        },
      });
      expect(runner.exitCode).toEqual(0);
      expect(options).toEqual(
        expect.arrayContaining(["component.booleanDefaultFalse:boolean:true"])
      );
    });
  });

  describe("when programmatic config is provided", () => {
    it("argument should overwrite the value from it", async () => {
      await run("js-async-function-config", "two-namespaces", {
        args: ["--component.alias=alias-from-arg", "--firstNamespace.fooOption=option-from-arg"],
      });

      expect(options).toEqual(expect.arrayContaining(["component.alias:string:alias-from-arg"]));
      expect(options).toEqual(
        expect.arrayContaining(["firstNamespace.fooOption:string:option-from-arg"])
      );
    });
  });

  describe("when env var is provided", () => {
    it("argument should overwrite the value from it", async () => {
      await run("no-config", "two-namespaces", {
        args: ["--component.alias=alias-from-arg", "--firstNamespace.fooOption=option-from-arg"],
        env: {
          MOCKS_FOO_NAMESPACE_FOO_OPTION: "option-from-env-var",
          MOCKS_COMPONENT_ALIAS: "alias-from-env-var",
        },
      });

      expect(options).toEqual(expect.arrayContaining(["component.alias:string:alias-from-arg"]));
      expect(options).toEqual(
        expect.arrayContaining(["firstNamespace.fooOption:string:option-from-arg"])
      );
    });
  });

  describe("when file is provided", () => {
    it("argument should overwrite the value from it", async () => {
      await run("js-async-function-config", "two-namespaces", {
        args: ["--component.alias=alias-from-arg"],
        env: {
          MOCKS_COMPONENT_ALIAS: "alias-from-env-var",
        },
      });

      expect(options).toEqual(expect.arrayContaining(["component.alias:string:alias-from-arg"]));
    });
  });

  describe("when file is provided with namespaces config", () => {
    it("argument should overwrite the value from it", async () => {
      await run("json-config-two-namespaces", "several-namespaces", {
        args: [
          "--namespace.component.alias=alias-from-arg",
          "--firstNamespace.secondNamespace.fooOption=option-from-arg",
        ],
        env: {
          MOCKS_NAMESPACE_COMPONENT_ALIAS: "alias-from-env-var",
          MOCKS_FIRST_NAMESPACE_SECOND_NAMESPACE_FOO_OPTION: "option-from-env-var",
        },
      });

      expect(options).toEqual(
        expect.arrayContaining(["namespace.component.alias:string:alias-from-arg"])
      );
      expect(options).toEqual(
        expect.arrayContaining(["firstNamespace.secondNamespace.fooOption:string:option-from-arg"])
      );
    });

    it("argument should overwrite the value from it when namespaces are added after init method", async () => {
      await run("json-config-two-namespaces", "several-namespaces-after-init", {
        args: [
          "--namespace.component.alias=alias-from-arg",
          "--firstNamespace.secondNamespace.fooOption=option-from-arg",
        ],
        env: {
          MOCKS_NAMESPACE_COMPONENT_ALIAS: "alias-from-env-var",
          MOCKS_FIRST_NAMESPACE_SECOND_NAMESPACE_FOO_OPTION: "option-from-env-var",
        },
      });

      expect(options).toEqual(
        expect.arrayContaining(["namespace.component.alias:string:alias-from-arg"])
      );
      expect(options).toEqual(
        expect.arrayContaining(["firstNamespace.secondNamespace.fooOption:string:option-from-arg"])
      );
    });
  });

  describe("when file is provided with nested namespaces config", () => {
    it("argument should overwrite the value from it", async () => {
      await run("json-config-nested-namespaces", "nested-namespaces", {
        args: ["--firstNamespace.secondNamespace.thirdNamespace.fooOption3=3-from-arg"],
      });

      expect(options).toEqual(
        expect.arrayContaining([
          "firstNamespace.secondNamespace.thirdNamespace.fooOption3:string:3-from-arg",
        ])
      );
    });

    it("argument should overwrite the value from it when it is boolean", async () => {
      await run("json-config-nested-namespaces", "nested-namespaces", {
        args: ["--no-firstNamespace.secondNamespace.thirdNamespace.fooOption2"],
      });

      expect(options).toEqual(
        expect.arrayContaining([
          "firstNamespace.secondNamespace.thirdNamespace.fooOption2:boolean:false",
        ])
      );
    });
  });

  describe("when programmatic, file and env vars are provided", () => {
    it("argument should overwrite the value from all of them", async () => {
      await run("js-async-function-config", "two-namespaces", {
        args: ["--component.alias=alias-from-arg", "--firstNamespace.fooOption=option-from-arg"],
        env: {
          MOCKS_FOO_NAMESPACE_FOO_OPTION: "option-from-env-var",
          MOCKS_COMPONENT_ALIAS: "alias-from-env-var",
        },
      });

      expect(options).toEqual(expect.arrayContaining(["component.alias:string:alias-from-arg"]));
      expect(options).toEqual(
        expect.arrayContaining(["firstNamespace.fooOption:string:option-from-arg"])
      );
    });
  });
});
