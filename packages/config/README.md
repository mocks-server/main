<p align="center"><a href="https://mocks-server.org" target="_blank" rel="noopener noreferrer"><img width="120" src="https://www.mocks-server.org/img/logo_120.png" alt="Mocks Server logo"></a></p>

<p align="center">
  <a href="https://github.com/mocks-server/main/actions?query=workflow%3Abuild+branch%3Amaster"><img src="https://github.com/mocks-server/main/workflows/build/badge.svg?branch=master" alt="Build Status"></a>
  <a href="https://codecov.io/gh/mocks-server/main"><img src="https://codecov.io/gh/mocks-server/main/branch/master/graph/badge.svg?token=2S8ZR55AJV" alt="Coverage"></a>
  <a href="https://sonarcloud.io/project/overview?id=mocks-server_main_config"><img src="https://sonarcloud.io/api/project_badges/measure?project=mocks-server_main_config&metric=alert_status" alt="Quality Gate"></a>
  <a href="https://www.npmjs.com/package/@mocks-server/config"><img src="https://img.shields.io/npm/dm/@mocks-server/config.svg" alt="Downloads"></a>
  <a href="https://renovatebot.com"><img src="https://img.shields.io/badge/renovate-enabled-brightgreen.svg" alt="Renovate"></a>
  <a href="https://github.com/mocks-server/main/blob/master/packages/config/LICENSE"><img src="https://img.shields.io/npm/l/@mocks-server/config.svg" alt="License"></a>
</p>

---

# Mocks Server Config

Configuration provider. Reads config from command line arguments, environment variables, files and options received programmatically.

Each external element can define its options under its own namespace. So, each different component is the unique who knows about its own options, but all options values can be defined using the same methods.

This module provides configuration to [Mocks Server](website-url) components and plugins, but it may be used anywhere else because it is fully configurable.

## Usage

A brief example:

```js
const { Config } = require("@mocks-server/config");

const config = new Config({ moduleName: "MOCKS" });
const namespace = config.addNamespace("fooComponent");
const option = namespace.addOption({
  name: "fooOption",
  type: "String",
  default: "foo-value",
});

config.init({ fooComponent: { fooOption: "foo" }}).then(() => {
  /* 
  Will look for option value in:
    1 - Default option value
    2 - Config from init method.
      { fooComponent: { fooOption: "value" }}
    3 - package.json or configuration files using cosmiconfig
      { fooComponent: { fooOption: "value" }}
    4 - Environment variables
      MOCKS_SERVER_FOO_COMPONENT_FOO_OPTION = "foo2"
    5 - Process arguments
      --fooComponent.fooOption=foo
  */ 
  console.log(option.value);
});
```


[website-url]: https://www.mocks-server.org
[logo-url]: https://www.mocks-server.org/img/logo_120.png
[main-url]: https://www.npmjs.com/package/@mocks-server/main
