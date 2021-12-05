[![Build status][build-image]][build-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Quality Gate][quality-gate-image]][quality-gate-url]

[![Renovate](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com) [![Last commit][last-commit-image]][last-commit-url] [![Last release][release-image]][release-url] 

[![NPM downloads][npm-downloads-image]][npm-downloads-url] [![License][license-image]][license-url]


# Mocks-server administration api client

This package contains methods for administrating Mocks Server _(using the [Admin API plugin](https://github.com/mocks-server/plugin-admin-api) under the hood)_.

Requests to the Mocks Server API are made using [`cross-fetch`](https://www.npmjs.com/package/cross-fetch), which makes this package compatible with browsers and nodejs environments, but, if you are going to build a browser application, you'll probably prefer to use the [`@mocks-server/admin-api-client-data-provider` package](https://www.npmjs.com/package/@mocks-server/admin-api-client-data-provider), which uses [Data Provider](https://www.data-provider.org), and works well with Redux, React, etc.

## Install

```bash
npm install --save @mocks-server/admin-api-client
```

The UMD build is also available on unpkg:

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
    mock: "user-super-admin",
    delay: 1000
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

##### Legacy methods

* `readBehaviors()` - Returns collection of available behaviors.
* `readBehavior(behaviorName)` - Returns an specific behavior.
* `readFixtures()` - Returns collection of available fixtures.
* `readFixture(fixtureId)` - Returns an specific fixture.

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

[coveralls-image]: https://coveralls.io/repos/github/mocks-server/admin-api-client/badge.svg
[coveralls-url]: https://coveralls.io/github/mocks-server/admin-api-client
[build-image]: https://github.com/mocks-server/admin-api-client/workflows/build/badge.svg?branch=master
[build-url]: https://github.com/mocks-server/admin-api-client/actions?query=workflow%3Abuild+branch%3Amaster
[last-commit-image]: https://img.shields.io/github/last-commit/mocks-server/admin-api-client.svg
[last-commit-url]: https://github.com/mocks-server/admin-api-client/commits
[license-image]: https://img.shields.io/npm/l/@mocks-server/admin-api-client.svg
[license-url]: https://github.com/mocks-server/admin-api-client/blob/master/LICENSE
[npm-downloads-image]: https://img.shields.io/npm/dm/@mocks-server/admin-api-client.svg
[npm-downloads-url]: https://www.npmjs.com/package/@mocks-server/admin-api-client
[quality-gate-image]: https://sonarcloud.io/api/project_badges/measure?project=mocks-server_admin-api-client&metric=alert_status
[quality-gate-url]: https://sonarcloud.io/dashboard?id=mocks-server_admin-api-client
[release-image]: https://img.shields.io/github/release-date/mocks-server/admin-api-client.svg
[release-url]: https://github.com/mocks-server/admin-api-client/releases
