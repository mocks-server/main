[![Build status][travisci-image]][travisci-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Quality Gate][quality-gate-image]][quality-gate-url]

[![NPM dependencies][npm-dependencies-image]][npm-dependencies-url] [![Greenkeeper badge](https://badges.greenkeeper.io/mocks-server/plugin-inquirer-cli.svg)](https://greenkeeper.io/) [![Last commit][last-commit-image]][last-commit-url] [![Last release][release-image]][release-url] 

[![NPM downloads][npm-downloads-image]][npm-downloads-url] [![License][license-image]][license-url]


# [![Mocks Server][logo-url]][website-url] Mocks Server Plugin Inquirer CLI

Plugin for [Mocks Server][website-url] that provides an interactive CLI that allows to change the server settings while it is running.

## Usage

This plugin is included in the [main distribution of the Mocks Server project][main-distribution-url], so you can refer to the [official documentation website][website-url].

![Interactive CLI](assets/cli_animation.gif)

## Options

* `cli`: `<String>` Start interactive CLI or not. Default is `true`. Use `false` to disable it.

## Support

[Inquirer][inquirer-url] is used for displaying the interactive CLI. You can [consult his OS Terminals support here][inquirer-support].

## Contributing

Contributors are welcome.
Please read the [contributing guidelines](.github/CONTRIBUTING.md) and [code of conduct](.github/CODE_OF_CONDUCT.md).

[inquirer-url]: https://www.npmjs.com/package/inquirer
[inquirer-support]: https://www.npmjs.com/package/inquirer#support-os-terminals
[website-url]: https://www.mocks-server.org
[main-distribution-url]: https://www.npmjs.com/package/@mocks-server/main
[options-url]: https://www.mocks-server.org/docs/configuration-options
[logo-url]: https://www.mocks-server.org/img/logo_120.png

[coveralls-image]: https://coveralls.io/repos/github/mocks-server/plugin-inquirer-cli/badge.svg
[coveralls-url]: https://coveralls.io/github/mocks-server/plugin-inquirer-cli
[travisci-image]: https://travis-ci.com/mocks-server/plugin-inquirer-cli.svg?branch=master
[travisci-url]: https://travis-ci.com/mocks-server/plugin-inquirer-cli
[last-commit-image]: https://img.shields.io/github/last-commit/mocks-server/plugin-inquirer-cli.svg
[last-commit-url]: https://github.com/mocks-server/plugin-inquirer-cli/commits
[license-image]: https://img.shields.io/npm/l/@mocks-server/plugin-inquirer-cli.svg
[license-url]: https://github.com/mocks-server/plugin-inquirer-cli/blob/master/LICENSE
[npm-downloads-image]: https://img.shields.io/npm/dm/@mocks-server/plugin-inquirer-cli.svg
[npm-downloads-url]: https://www.npmjs.com/package/@mocks-server/plugin-inquirer-cli
[npm-dependencies-image]: https://img.shields.io/david/mocks-server/plugin-inquirer-cli.svg
[npm-dependencies-url]: https://david-dm.org/mocks-server/plugin-inquirer-cli
[quality-gate-image]: https://sonarcloud.io/api/project_badges/measure?project=mocks-server-plugin-inquirer-cli&metric=alert_status
[quality-gate-url]: https://sonarcloud.io/dashboard?id=mocks-server-plugin-inquirer-cli
[release-image]: https://img.shields.io/github/release-date/mocks-server/plugin-inquirer-cli.svg
[release-url]: https://github.com/mocks-server/plugin-inquirer-cli/releases
