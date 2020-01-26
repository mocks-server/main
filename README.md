[![Build status][travisci-image]][travisci-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Quality Gate][quality-gate-image]][quality-gate-url]

[![NPM dependencies][npm-dependencies-image]][npm-dependencies-url] [![Renovate](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com) [![Last commit][last-commit-image]][last-commit-url] [![Last release][release-image]][release-url] 

[![NPM downloads][npm-downloads-image]][npm-downloads-url] [![License][license-image]][license-url]


# [![Mocks Server][logo-url]][website-url] Mocks Server Plugin Admin Api

Plugin for [Mocks Server][website-url] that provides an API REST that allows to change dinamically the current behavior, change delay time, and another [Mocks Server options][options-url].

This is __very useful when running acceptance tests, as you can change the behavior of the api__ simply making an HTTP request in your tests `before` method, for example.

## Usage

This plugin is included in the [main distribution of the Mocks Server project][main-distribution-url], so you can refer to the [official documentation website][website-url].

## Options

* `adminApiPath` - Base path for the administration api. Default is "/admin". You should change it only if there is any conflict with the api you are mocking.
* `adminApiDeprecatedPaths` - Boolean option, disables deprecated "/mocks" api path, which is still enabled by default.

Read more about [how to define options for the mocks-server plugins here](https://www.mocks-server.org/docs/configuration-options).

## API Resources

Available api resources are:

* `GET` `/admin/about` Returns plugin information.
  * Response body example: `{ "version": "1.2.0" }`
* `GET` `/admin/behaviors` Returns behaviors collection.
* `GET` `/admin/behaviors/:id` Returns an specific behavior.
* `GET` `/admin/fixtures` Returns fixtures collection.
* `GET` `/admin/fixtures/:id` Returns an specific fixture.
* `GET` `/admin/settings` Returns current server settings.
  * Response body example: `{ "delay": 0, behavior: "foo-behavior", path: "mocks" }`
* `PATCH` `/admin/settings` Changes current server settings.
  * Request body example: `{ "delay": 3000 }`

> Deprecated api resources under "/mocks" api path are still available.

## Contributing

Contributors are welcome.
Please read the [contributing guidelines](.github/CONTRIBUTING.md) and [code of conduct](.github/CODE_OF_CONDUCT.md).

[website-url]: https://www.mocks-server.org
[main-distribution-url]: https://www.npmjs.com/package/@mocks-server/main
[options-url]: https://www.mocks-server.org/docs/configuration-options
[logo-url]: https://www.mocks-server.org/img/logo_120.png

[coveralls-image]: https://coveralls.io/repos/github/mocks-server/plugin-admin-api/badge.svg
[coveralls-url]: https://coveralls.io/github/mocks-server/plugin-admin-api
[travisci-image]: https://travis-ci.com/mocks-server/plugin-admin-api.svg?branch=master
[travisci-url]: https://travis-ci.com/mocks-server/plugin-admin-api
[last-commit-image]: https://img.shields.io/github/last-commit/mocks-server/plugin-admin-api.svg
[last-commit-url]: https://github.com/mocks-server/plugin-admin-api/commits
[license-image]: https://img.shields.io/npm/l/@mocks-server/plugin-admin-api.svg
[license-url]: https://github.com/mocks-server/plugin-admin-api/blob/master/LICENSE
[npm-downloads-image]: https://img.shields.io/npm/dm/@mocks-server/plugin-admin-api.svg
[npm-downloads-url]: https://www.npmjs.com/package/@mocks-server/plugin-admin-api
[npm-dependencies-image]: https://img.shields.io/david/mocks-server/plugin-admin-api.svg
[npm-dependencies-url]: https://david-dm.org/mocks-server/plugin-admin-api
[quality-gate-image]: https://sonarcloud.io/api/project_badges/measure?project=mocks-server-plugin-admin-api&metric=alert_status
[quality-gate-url]: https://sonarcloud.io/dashboard?id=mocks-server-plugin-admin-api
[release-image]: https://img.shields.io/github/release-date/mocks-server/plugin-admin-api.svg
[release-url]: https://github.com/mocks-server/plugin-admin-api/releases
