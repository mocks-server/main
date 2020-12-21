[![Build status][build-image]][build-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Quality Gate][quality-gate-image]][quality-gate-url]

[![NPM dependencies][npm-dependencies-image]][npm-dependencies-url] [![Renovate](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com) [![Last commit][last-commit-image]][last-commit-url] [![Last release][release-image]][release-url] 

[![NPM downloads][npm-downloads-image]][npm-downloads-url] [![License][license-image]][license-url]


# Mocks-server administration api client built with @data-provider

This package contains methods for administrating the mocks-server _(through the [@mocks-server/plugin-admin-api](https://github.com/mocks-server/plugin-admin-api) RESTful API)_.

Built using [@data-provider](https://github.com/data-provider), it can be used in Node.js, browsers, and it is also compatible with other @data-provider packages, such as [@data-provider/react](https://github.com/data-provider/react), so can be easily integrated with frameworks.

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
    behavior: "user-super-admin",
    delay: 1000
  });
  console.log("Behavior and delay changed");
};

example();
```

## Usage with data-provider

Exported properties `about`, `settings`, `behaviors`, `behaviorsModel`, `fixtures` and `fixturesModel` are [@data-provider/axios](https://github.com/data-provider/axios) providers, so can be used to define @data-provider Selectors. Methods can also be connected to frameworks using another @data-provider packages, such as [@data-provider/react](https://github.com/data-provider/react).

## Api

* `about.read()` - Returns info about mocks-server/plugin-admin-api, such as current version.
* `settings.read()` - Returns current @mocks-server settings.
* `settings.update(settingsObject)` - Updates @mocks-server settings. A settings object has to be provided. Read the [@mocks-server configuration documentation](https://www.mocks-server.org/docs/configuration-options) for further info.
* `behaviors.read()` - Returns collection of available behaviors.
* `behavior(behaviorName).read()` - Returns an specific behavior.
* `behaviorsModel.queries.byName(behaviorName).read()` - Returns an specific behavior.
* `fixtures.read()` - Returns collection of available fixtures.
* `fixture(fixtureId).read()` - Returns an specific fixture.
* `fixturesModel.queries.byId(fixtureId).read()` - Returns an specific fixture.

## Configuration

By default, the client is configured to request to http://localhost:3100/admin, based in the [default options of @mocks-server](https://www.mocks-server.org/docs/configuration-options)

You can change both the base url of the "@mocks-server", and the base api path of the "@mocks-server/plugin-admin-api" using the `config` method:

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

[coveralls-image]: https://coveralls.io/repos/github/mocks-server/admin-api-client-data-provider/badge.svg
[coveralls-url]: https://coveralls.io/github/mocks-server/admin-api-client-data-provider
[build-image]: https://github.com/mocks-server/admin-api-client-data-provider/workflows/build/badge.svg?branch=master
[build-url]: https://github.com/mocks-server/admin-api-client-data-provider/actions?query=workflow%3Abuild+branch%3Amaster
[last-commit-image]: https://img.shields.io/github/last-commit/mocks-server/admin-api-client-data-provider.svg
[last-commit-url]: https://github.com/mocks-server/admin-api-client-data-provider/commits
[license-image]: https://img.shields.io/npm/l/@mocks-server/admin-api-client-data-provider.svg
[license-url]: https://github.com/mocks-server/admin-api-client-data-provider/blob/master/LICENSE
[npm-downloads-image]: https://img.shields.io/npm/dm/@mocks-server/admin-api-client-data-provider.svg
[npm-downloads-url]: https://www.npmjs.com/package/@mocks-server/admin-api-client-data-provider
[npm-dependencies-image]: https://img.shields.io/david/mocks-server/admin-api-client-data-provider.svg
[npm-dependencies-url]: https://david-dm.org/mocks-server/admin-api-client-data-provider
[quality-gate-image]: https://sonarcloud.io/api/project_badges/measure?project=mocks-server-admin-api-client-data-provider&metric=alert_status
[quality-gate-url]: https://sonarcloud.io/dashboard?id=mocks-server-admin-api-client-data-provider
[release-image]: https://img.shields.io/github/release-date/mocks-server/admin-api-client-data-provider.svg
[release-url]: https://github.com/mocks-server/admin-api-client-data-provider/releases
