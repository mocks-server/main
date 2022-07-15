<p align="center"><a href="https://mocks-server.org" target="_blank" rel="noopener noreferrer"><img width="120" src="https://www.mocks-server.org/img/logo_120.png" alt="Mocks Server logo"></a></p>

<p align="center">
  <a href="https://github.com/mocks-server/main/actions?query=workflow%3Abuild+branch%3Amaster"><img src="https://github.com/mocks-server/main/workflows/build/badge.svg?branch=master" alt="Build Status"></a>
  <a href="https://codecov.io/gh/mocks-server/main"><img src="https://codecov.io/gh/mocks-server/main/branch/master/graph/badge.svg?token=2S8ZR55AJV" alt="Coverage"></a>
  <a href="https://sonarcloud.io/project/overview?id=mocks-server_main_admin-api-client"><img src="https://sonarcloud.io/api/project_badges/measure?project=mocks-server_main_admin-api-client&metric=alert_status" alt="Quality Gate"></a>
  <a href="https://www.npmjs.com/package/@mocks-server/admin-api-client"><img src="https://img.shields.io/npm/dm/@mocks-server/admin-api-client.svg" alt="Downloads"></a>
  <a href="https://renovatebot.com"><img src="https://img.shields.io/badge/renovate-enabled-brightgreen.svg" alt="Renovate"></a>
  <a href="https://github.com/mocks-server/main/blob/master/packages/admin-api-client/LICENSE"><img src="https://img.shields.io/npm/l/@mocks-server/admin-api-client.svg" alt="License"></a>
</p>

---

# Mocks-server administration api client

This package provides an API client for administrating Mocks Server _(it performs requests to the [Admin API plugin][plugin-admin-api-url] under the hood)_.

Requests to the Mocks Server administration API are made using [`cross-fetch`](https://www.npmjs.com/package/cross-fetch), which makes this package compatible with browsers and Node.js environments, but, if you are going to build a browser application, you'll probably prefer to use the [`@mocks-server/admin-api-client-data-provider` package](https://www.npmjs.com/package/@mocks-server/admin-api-client-data-provider), which uses [Data Provider](https://www.data-provider.org), and works well with Redux, React, etc.

## Install

```bash
npm install --save @mocks-server/admin-api-client
```

The UMD build is also available on unpkg. When UMD package is loaded, it creates a `mocksServerAdminApiClient` global object containing all of the methods.

```html
<script src="https://unpkg.com/@mocks-server/admin-api-paths/dist/index.umd.js"></script>
<script src="https://unpkg.com/@mocks-server/admin-api-client/dist/index.umd.js"></script>
```

> The umd distribution is bundled with the `cross-env` dependency, but requires the `@mocks-server/admin-api-paths` dependency to be added separately.

## Usage

All methods described in the [Api](#api) (except the `config` method) return Promises when executed:

```js
import { readAbout, readSettings, updateSettings } from "@mocks-server/admin-api-client";

const example = async () => {
  const { version } = await readAbout();
  console.log(`Current Admin API plugin version is ${version}`);

  const currentSettings = await readSettings();
  console.log("Current Mocks Server settings are", currentSettings);

  await updateSettings({
    mock: {
      collections: {
        selected: "user-super-admin"
      },
      routes: {
        delay: 1000
      },
    },
  });
  console.log("Mock and delay changed");
};

example();
```

## Api

* `readAbout()` - Returns info about the Admin API plugin, such as current version.
* `readSettings()` - Returns current Mocks Server settings.
* `updateSettings(settingsObject)` - Updates Mocks Server settings. A settings object has to be provided. Read the [Mocks Server configuration docs](https://www.mocks-server.org/docs/configuration-options) for further info.
* `readAlerts()` - Returns array of current alerts.
* `readAlert(alertId)` - Returns an specific alert.
* `readMocks()` - Returns available mocks.
* `readMock(id)` - Returns data of a specific mock.
* `readRoutes()` - Returns available routes.
* `readRoute(id)` - Returns data of a specific route.
* `readRoutesVariants()` - Returns available routes variants.
* `readRouteVariant(id)` - Returns data of a specific route variant.
* `readCustomRoutesVariants()` - Returns current routes variants manually added to current mock.
* `useRouteVariant(id)` - Sets a specific route variant to be used by current mock.
* `restoreRoutesVariants()` - Restore routes variants to those defined in current mock.

## Configuration

By default, the client is configured to request to `http://127.0.0.1:3100/admin`, based in the [default options of Mocks Server](https://www.mocks-server.org/docs/configuration-options)

You can change both the base url of Mocks Server, and the path of the [Admin API plugin][plugin-admin-api-url] using the `config` method:

```js
import { config } from "@mocks-server/admin-api-client";

config({
  adminApiPath: "/foo-admin",
  baseUrl: "http://my-mocks-server:3000"
});
```

## Contributing

Contributors are welcome.
Please read the [contributing guidelines](.github/CONTRIBUTING.md) and [code of conduct](.github/CODE_OF_CONDUCT.md).

[plugin-admin-api-url]: https://github.com/mocks-server/plugin-admin-api
