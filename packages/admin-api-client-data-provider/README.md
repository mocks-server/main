<p align="center"><a href="https://mocks-server.org" target="_blank" rel="noopener noreferrer"><img width="120" src="https://www.mocks-server.org/img/logo_120.png" alt="Mocks Server logo"></a></p>

<p align="center">
  <a href="https://github.com/mocks-server/main/actions?query=workflow%3Abuild+branch%3Amaster"><img src="https://github.com/mocks-server/main/workflows/build/badge.svg?branch=master" alt="Build Status"></a>
  <a href="https://codecov.io/gh/mocks-server/main"><img src="https://codecov.io/gh/mocks-server/main/branch/master/graph/badge.svg?token=2S8ZR55AJV" alt="Coverage"></a>
  <a href="https://sonarcloud.io/project/overview?id=mocks-server_main_admin-api-client-data-provider"><img src="https://sonarcloud.io/api/project_badges/measure?project=mocks-server_main_admin-api-client-data-provider&metric=alert_status" alt="Quality Gate"></a>
  <a href="https://www.npmjs.com/package/@mocks-server/admin-api-client-data-provider"><img src="https://img.shields.io/npm/dm/@mocks-server/admin-api-client-data-provider.svg" alt="Downloads"></a>
  <a href="https://renovatebot.com"><img src="https://img.shields.io/badge/renovate-enabled-brightgreen.svg" alt="Renovate"></a>
  <a href="https://github.com/mocks-server/main/blob/master/packages/admin-api-client-data-provider/LICENSE"><img src="https://img.shields.io/npm/l/@mocks-server/admin-api-client-data-provider.svg" alt="License"></a>
</p>

---

# Mocks-server administration api client built with @data-provider

This package contains methods for administrating [`mocks-server`](https://mocks-server.org) _(through the [`@mocks-server/plugin-admin-api`](https://github.com/mocks-server/plugin-admin-api) REST API)_.

Built using [`data-provider`](https://github.com/data-provider), it can be used in Node.js, browsers, and it is also compatible with other `data-provider` packages, such as [`@data-provider/react`](https://github.com/data-provider/react), so can be easily integrated with frameworks.

## Installation

```bash
npm i --save redux @data-provider/core @data-provider/axios @mocks-server/admin-api-client-data-provider
```

## Usage with promises

All methods described in the [Api](#api) (expect the `config` method) return Promises when executed:

```js
import { about, settings } from "@mocks-server/admin-api-client-data-provider";

const example = async () => {
  const { version } = await about.read();
  console.log(`Current plugin-admin-api version is ${version}`);

  const currentSettings = await settings.read();
  console.log("Current mocks-server settings are", currentSettings);

  await settings.update({
    mock: "user-super-admin",
    delay: 1000
  });
  console.log("Mock and delay changed");
};

example();
```

## Usage with data-provider

Exported properties `about`, `settings`, `mocks`, `mocksModel`, `routes`, `routesModel`, `routesVariants` and `routesVariantsModel` are [`@data-provider/axios`](https://github.com/data-provider/axios) providers, so can be used to define @data-provider Selectors. Methods can also be connected to frameworks using another `data-provider` packages, such as [`@data-provider/react`](https://github.com/data-provider/react).

## Api

* `about.read()` - Returns info about `mocks-server/plugin-admin-api`, such as current version.
* `settings.read()` - Returns current `mocks-server` settings.
* `settings.update(settingsObject)` - Updates `mocks-server` settings. A settings object has to be provided. Read the [`mocks-server` configuration documentation](https://www.mocks-server.org/docs/configuration-options) for further info.
* `alerts.read()` - Returns collection of current alerts.
* `alert(id).read()` - Returns a specific alert.
* `alertsModel.queries.byId(id).read()` - Returns a specific alert.
* `mocks.read()` - Returns collection of available mocks.
* `mock(mockId).read()` - Returns a specific mock.
* `mocksModel.queries.byId(mockId).read()` - Returns a specific mock.
* `routes.read()` - Returns collection of available routes.
* `route(id).read()` - Returns a specific route.
* `routesModel.queries.byId(id).read()` - Returns an specific route.
* `routesVariants.read()` - Returns collection of available routes variants.
* `routeVariant(id).read()` - Returns a specific route variant.
* `routesVariantsModel.queries.byId(id).read()` - Returns an specific route variant.
* `customRouteVariants.read()` - Returns collection of current custom route variants.
* `customRouteVariants.create(id)` - Sets a specific route variant to be used by current mock.
* `customRouteVariants.delete()` - Restore routes variants to those defined in current mock.

## Configuration

By default, the client is configured to request to http://localhost:3100/admin, based in the [default options of `mocks-server`](https://www.mocks-server.org/docs/configuration-options)

You can change both the base url of `mocks-server`, and the base api path of `mocks-server/plugin-admin-api` using the `config` method:

```js
import { config } from "@mocks-server/admin-api-client-data-provider";

config({
  apiPath: "/foo-admin",
  baseUrl: "http://my-mocks-server:3000"
});
```

## Contributing

Contributors are welcome.
Please read the [contributing guidelines](.github/CONTRIBUTING.md) and [code of conduct](.github/CODE_OF_CONDUCT.md).

[plugin-admin-api-url]: https://github.com/mocks-server/plugin-admin-api
