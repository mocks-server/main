[![Build status][travisci-image]][travisci-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Quality Gate][quality-gate-image]][quality-gate-url]

[![NPM dependencies][npm-dependencies-image]][npm-dependencies-url] [![Greenkeeper badge](https://badges.greenkeeper.io/mocks-server/main.svg)](https://greenkeeper.io/) [![Last commit][last-commit-image]][last-commit-url] [![Last release][release-image]][release-url] 

[![NPM downloads][npm-downloads-image]][npm-downloads-url] [![License][license-image]][license-url]

# [![Mocks Server][logo-url]][website-url] Mocks Server

This package provides a server that simulates multiple API behaviors. It can be added as a dependency of your project, and started simply running an NPM command.

It is simple and easy out-of-the-box, but powerful and very customizable through the usage of [plugins and other customization methods](https://www.mocks-server.org/docs/advanced-developing-plugins).

## Documentation

Please refer to the [project documentation website][website-url]:

* [Get started](https://www.mocks-server.org/docs/get-started-intro)
* [Guides](https://www.mocks-server.org/docs/guides-defining-fixtures)
* [Configuration](https://www.mocks-server.org/docs/configuration-options)
* [Plugins](https://www.mocks-server.org/docs/plugins-adding-plugins)
* [Integrations](https://www.mocks-server.org/docs/integrations-cypress)
* [Api](https://www.mocks-server.org/docs/advanced-programmatic-usage)

## Why a mocks server?

Controlling the responses of the api will improve the front-end development workflow, avoiding early dependencies with back-end. It also improves the testing and development of error cases or another cases that are commonly hard to reproduce in the real api.

Defining the api responses during the earliest phases of development will improve the communication among team members and align their expectations.

Working with Node.js, it integrates better in front-end projects as any other NPM dependency, and it will be easier for front-end developers to maintain the mocks.

## Contributing

Contributors are welcome.
Please read the [contributing guidelines](.github/CONTRIBUTING.md) and [code of conduct](.github/CODE_OF_CONDUCT.md).

[website-url]: https://www.mocks-server.org
[logo-url]: https://www.mocks-server.org/img/logo_120.png
[inquirer-url]: https://www.npmjs.com/package/inquirer#support-os-terminals
[inquirer-support]: https://www.npmjs.com/package/inquirer#support-os-terminals

[coveralls-image]: https://coveralls.io/repos/github/mocks-server/main/badge.svg
[coveralls-url]: https://coveralls.io/github/mocks-server/main
[travisci-image]: https://travis-ci.com/mocks-server/main.svg?branch=master
[travisci-url]: https://travis-ci.com/mocks-server/main
[last-commit-image]: https://img.shields.io/github/last-commit/mocks-server/main.svg
[last-commit-url]: https://github.com/mocks-server/main/commits
[license-image]: https://img.shields.io/npm/l/@mocks-server/main.svg
[license-url]: https://github.com/mocks-server/main/blob/master/LICENSE
[npm-downloads-image]: https://img.shields.io/npm/dm/@mocks-server/main.svg
[npm-downloads-url]: https://www.npmjs.com/package/@mocks-server/main
[npm-dependencies-image]: https://img.shields.io/david/mocks-server/main.svg
[npm-dependencies-url]: https://david-dm.org/mocks-server/main
[quality-gate-image]: https://sonarcloud.io/api/project_badges/measure?project=mocks-server-main&metric=alert_status
[quality-gate-url]: https://sonarcloud.io/dashboard?id=mocks-server-main
[release-image]: https://img.shields.io/github/release-date/mocks-server/main.svg
[release-url]: https://github.com/mocks-server/main/releases
