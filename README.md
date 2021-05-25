[![Build status][build-image]][build-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Quality Gate][quality-gate-image]][quality-gate-url]

[![NPM dependencies][npm-dependencies-image]][npm-dependencies-url] [![Renovate](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com) [![Last commit][last-commit-image]][last-commit-url] [![Last release][release-image]][release-url] 

[![NPM downloads][npm-downloads-image]][npm-downloads-url] [![License][license-image]][license-url]


# [![Mocks Server][logo-url]][website-url] Mocks Server Plugin Inquirer CLI

[Mocks Server][website-url] plugin that provides an interactive CLI that allows to change the server settings while it is running and displays logs and alerts.

## Usage

This plugin is preinstalled in the [main distribution of the Mocks Server project][main-distribution-url]. _If you want ot install it by yourself, you can refer to the [plugins documentation][plugins-url]._

![Interactive CLI][animated-image-url]

## Main features

* __Displays current [settings][settings-url].__ _Settings will be refreshed automatically even when changed using other plugins, as the REST API, etc._
* __Allows to change [settings][settings-url].__
* __Displays current alerts.__ _Alerts include errors when loading mock files, wrong options, etc._
* __Displays logs.__ _Mocks-server logs are displayed in real time._

## Options

* `cli`: `<String>` Start interactive CLI or not. Default is `true`. Use `false` to disable it _(`--no-cli`) when using command line arguments)_

## Support

[Inquirer][inquirer-url] is used for displaying the interactive CLI. You can [consult its OS Terminals support here][inquirer-support].

## Contributing

Contributors are welcome.
Please read the [contributing guidelines](.github/CONTRIBUTING.md) and [code of conduct](.github/CODE_OF_CONDUCT.md).

[inquirer-url]: https://www.npmjs.com/package/inquirer
[inquirer-support]: https://www.npmjs.com/package/inquirer#support-os-terminals
[website-url]: https://www.mocks-server.org
[plugins-url]: https://www.mocks-server.org/docs/plugins-adding-plugins
[settings-url]: https://www.mocks-server.org/docs/configuration-options
[animated-image-url]: https://www.mocks-server.org/img/inquirer-cli.gif
[main-distribution-url]: https://www.npmjs.com/package/@mocks-server/main
[options-url]: https://www.mocks-server.org/docs/configuration-options
[logo-url]: https://www.mocks-server.org/img/logo_120.png

[coveralls-image]: https://coveralls.io/repos/github/mocks-server/plugin-inquirer-cli/badge.svg
[coveralls-url]: https://coveralls.io/github/mocks-server/plugin-inquirer-cli
[build-image]: https://github.com/mocks-server/plugin-inquirer-cli/workflows/build/badge.svg?branch=master
[build-url]: https://github.com/mocks-server/plugin-inquirer-cli/actions?query=workflow%3Abuild+branch%3Amaster
[last-commit-image]: https://img.shields.io/github/last-commit/mocks-server/plugin-inquirer-cli.svg
[last-commit-url]: https://github.com/mocks-server/plugin-inquirer-cli/commits
[license-image]: https://img.shields.io/npm/l/@mocks-server/plugin-inquirer-cli.svg
[license-url]: https://github.com/mocks-server/plugin-inquirer-cli/blob/master/LICENSE
[npm-downloads-image]: https://img.shields.io/npm/dm/@mocks-server/plugin-inquirer-cli.svg
[npm-downloads-url]: https://www.npmjs.com/package/@mocks-server/plugin-inquirer-cli
[npm-dependencies-image]: https://img.shields.io/david/mocks-server/plugin-inquirer-cli.svg
[npm-dependencies-url]: https://david-dm.org/mocks-server/plugin-inquirer-cli
[quality-gate-image]: https://sonarcloud.io/api/project_badges/measure?project=mocks-server_plugin-inquirer-cli&metric=alert_status
[quality-gate-url]: https://sonarcloud.io/dashboard?id=mocks-server_plugin-inquirer-cli
[release-image]: https://img.shields.io/github/release-date/mocks-server/plugin-inquirer-cli.svg
[release-url]: https://github.com/mocks-server/plugin-inquirer-cli/releases
