[![Build status][travisci-image]][travisci-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Quality Gate][quality-gate-image]][quality-gate-url]

[![NPM dependencies][npm-dependencies-image]][npm-dependencies-url] [![Greenkeeper badge](https://badges.greenkeeper.io/mocks-server/admin-api-client.svg)](https://greenkeeper.io/) [![Last commit][last-commit-image]][last-commit-url] [![Last release][release-image]][release-url] 

[![NPM downloads][npm-downloads-image]][npm-downloads-url] [![License][license-image]][license-url]


# Mocks-server administration api client

This package contains methods for administrating the mocks-server _(through the [@mocks-server/plugin-admin-api](https://github.com/mocks-server/plugin-admin-api) RESTful API)_.

Built using [@data-provider](https://github.com/data-provider), it can be used in Node.js, browsers, and is also compatible with @data-provider connectors, such as [@data-provider/connector-react](https://github.com/data-provider/connector-react), so can be easily integrated with frameworks.

## Usage with promises

All methods described in the [Api](#api) (expect the `config` method) return Promises when executed:

```js
import { about, settings } from "@mocks-server/admin-api-client";

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

Exported properties `about`, `settings`, `behaviors`, `behaviorsModel`, `fixtures` and `fixturesModel` are [@data-provider/axios](https://github.com/data-provider/axios) providers, so can be used to define @data-provider Selectors. Methods can also be connected to frameworks using @data-provider connectors, such as [@data-provider/connector-react](https://github.com/data-provider/connector-react).

## Api

* `about.read()` - Returns info about mocks-server/plugin-admin-api, such as current version.
* `settings.read()` - Returns current @mocks-server settings.
* `settings.update(settingsObject)` - Updates @mocks-server settings. A settings object has to be provided. Read the [@mocks-server configuration documentation](https://www.mocks-server.org/docs/configuration-options) for further info.
* `behaviors.read()` - Returns collection of available behaviors.
* `behavior(behaviorName).read()` - Returns an specific behavior.
* `behaviorsModel.byName(behaviorName).read()` - Returns an specific behavior.
* `fixtures.read()` - Returns collection of available fixtures.
* `fixture(fixtureId).read()` - Returns an specific fixture.
* `fixturesModel.byId(fixtureId).read()` - Returns an specific fixture.

## Configuration

By default, the client is configured to request to http://localhost:3100/admin, based in the [default options of @mocks-server](https://www.mocks-server.org/docs/configuration-options)

You can change both the base url of the "@mocks-server", and the base api path of the "@mocks-server/plugin-admin-api" using the `config` method:

```js
import { config } from "@mocks-server/admin-api-client";

config({
  apiPath: "/foo-admin",
  baseUrl: "http://my-mocks-server:3000"
});
```

## Contributing

Contributors are welcome.
Please read the [contributing guidelines](.github/CONTRIBUTING.md) and [code of conduct](.github/CODE_OF_CONDUCT.md).

[plugin-admin-api-url]: https://github.com/mocks-server/plugin-admin-api

[coveralls-image]: https://coveralls.io/repos/github/mocks-server/admin-api-client/badge.svg
[coveralls-url]: https://coveralls.io/github/mocks-server/admin-api-client
[travisci-image]: https://travis-ci.com/mocks-server/admin-api-client.svg?branch=master
[travisci-url]: https://travis-ci.com/mocks-server/admin-api-client
[last-commit-image]: https://img.shields.io/github/last-commit/mocks-server/admin-api-client.svg
[last-commit-url]: https://github.com/mocks-server/admin-api-client/commits
[license-image]: https://img.shields.io/npm/l/@mocks-server/admin-api-client.svg
[license-url]: https://github.com/mocks-server/admin-api-client/blob/master/LICENSE
[npm-downloads-image]: https://img.shields.io/npm/dm/@mocks-server/admin-api-client.svg
[npm-downloads-url]: https://www.npmjs.com/package/@mocks-server/admin-api-client
[npm-dependencies-image]: https://img.shields.io/david/mocks-server/admin-api-client.svg
[npm-dependencies-url]: https://david-dm.org/mocks-server/admin-api-client
[quality-gate-image]: https://sonarcloud.io/api/project_badges/measure?project=mocks-server-admin-api-client&metric=alert_status
[quality-gate-url]: https://sonarcloud.io/dashboard?id=mocks-server-admin-api-client
[release-image]: https://img.shields.io/github/release-date/mocks-server/admin-api-client.svg
[release-url]: https://github.com/mocks-server/admin-api-client/releases
