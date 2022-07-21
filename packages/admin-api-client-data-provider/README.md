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

This package provides an API client for administrating Mocks Server _(it performs requests to the [Admin API plugin][plugin-admin-api-url] under the hood)_.

Built using [`data-provider`](https://github.com/data-provider), it can be used in Node.js, browsers, and it is also compatible with other `data-provider` packages, such as [`@data-provider/react`](https://github.com/data-provider/react), so it can be easily integrated in other ecosystems.

## Installation

```bash
npm i --save redux @data-provider/core @data-provider/axios @mocks-server/admin-api-client-data-provider
```

## Usage with promises

All methods described in the [Api](#api) (except the `configClient` method) return Promises when executed:

```js
import { about, config } from "@mocks-server/admin-api-client-data-provider";

const example = async () => {
  const { version } = await about.read();
  console.log(`Current plugin-admin-api version is ${version}`);

  const currentConfig = await config.read();
  console.log("Current mocks-server config is", JSON.stringify(currentConfig));

  await config.update({
    mock: {
      collections: {
        selected: "user-super-admin",
      },
      routes: {
        delay: 1000,
      },
    },
  });
  console.log("Collection and delay changed");
};

example();
```

## Usage with data-provider

All exported properties are [`@data-provider/axios`](https://github.com/data-provider/axios) providers, so can be used to define @data-provider Selectors. Methods can also be connected to frameworks using another `data-provider` packages, such as [`@data-provider/react`](https://github.com/data-provider/react).

## Api

* `about.read()` - Returns info about current version of Mocks Server and plugins.
* `config.read()` - Returns current Mocks Server config.
* `config.update(configObject)` - Updates Mocks Server config. A configuration object has to be provided. Read the [Mocks Server configuration documentation](https://www.mocks-server.org/docs/configuration/options) for further info.
* `alerts.read()` - Returns current alerts.
* `alertModel.queries.byId(id).read()` - Returns an alert by ID.
* `collections.read()` - Returns available collections.
* `collection.queries.byId(mockId).read()` - Returns a specific mock.
* `routes.read()` - Returns available routes.
* `route.queries.byId(id).read()` - Returns a route by id.
* `variants.read()` - Returns available route variants.
* `variant.queries.byId(id).read()` - Returns an specific route variant.
* `customRouteVariants.read()` - Returns current custom route variants.
* `customRouteVariants.create(id)` - Sets a specific route variant to be used by current collection.
* `customRouteVariants.delete()` - Restore route variants to those defined in the current collection.

## Configuration

By default, the client is configured to request to http://127.0.0.1:3110/api, based in the [default options of Mocks Server admin API plugin](https://www.mocks-server.org/docs/configuration/options)

You can change both the port and the host using the `configClient` method:

```js
import { configClient } from "@mocks-server/admin-api-client-data-provider";

configClient({
  port: 3500,
  host: "localhost"
});
```

## Release notes

Current major release is compatible only with `@mocks-server/main` versions upper or equal than `3.6`. Use prior releases for lower versions. If you don't want to update to the latest major version of this package yet but you want to update `@mocks-server/main`, you can also use any `5.x` version of this package with any `@mocks-server/main@3.x` version.

## Contributing

Contributors are welcome.
Please read the [contributing guidelines](.github/CONTRIBUTING.md) and [code of conduct](.github/CODE_OF_CONDUCT.md).

[plugin-admin-api-url]: https://github.com/mocks-server/plugin-admin-api
