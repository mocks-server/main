<p align="center"><a href="https://mocks-server.org" target="_blank" rel="noopener noreferrer"><img width="120" src="https://www.mocks-server.org/img/logo_120.png" alt="Mocks Server logo"></a></p>

<p align="center">
  <a href="https://github.com/mocks-server/main/actions?query=workflow%3Abuild+branch%3Amaster"><img src="https://github.com/mocks-server/main/workflows/build/badge.svg?branch=master" alt="Build Status"></a>
  <a href="https://codecov.io/gh/mocks-server/main"><img src="https://codecov.io/gh/mocks-server/main/branch/master/graph/badge.svg?token=2S8ZR55AJV" alt="Coverage"></a>
  <a href="https://sonarcloud.io/project/overview?id=mocks-server_main_plugin-inquirer-cli"><img src="https://sonarcloud.io/api/project_badges/measure?project=mocks-server_main_plugin-inquirer-cli&metric=alert_status" alt="Quality Gate"></a>
  <a href="https://www.npmjs.com/package/@mocks-server/plugin-inquirer-cli"><img src="https://img.shields.io/npm/dm/@mocks-server/plugin-inquirer-cli.svg" alt="Downloads"></a>
  <a href="https://renovatebot.com"><img src="https://img.shields.io/badge/renovate-enabled-brightgreen.svg" alt="Renovate"></a>
  <a href="https://github.com/mocks-server/main/blob/master/packages/plugin-inquirer-cli/LICENSE"><img src="https://img.shields.io/npm/l/@mocks-server/plugin-inquirer-cli.svg" alt="License"></a>
</p>

---

# Mocks Server Plugin Inquirer CLI

[Mocks Server][website-url] plugin that provides an interactive CLI that allows to change the server settings while it is running and displays logs and alerts.

## Usage

This plugin is pre-installed in the [main distribution of the Mocks Server project][main-distribution-url]. _If you want to install it by yourself, you can refer to the [plugins documentation][plugins-url]._

![Interactive CLI][animated-image-url]

## Main features

* __Displays current [configuration][settings-url].__ _Settings will be refreshed automatically even when changed using other plugins, as the REST API, etc._
* __Allows to change some [settings][settings-url].__
* __Displays current alerts.__ _Alerts include errors when loading mock files, wrong options, etc._
* __Displays logs.__ _Mocks-server logs are displayed in real time._

## Options

* `enabled`: `<boolean>` Start the interactive CLI or not. Default is `true`. Use `false` to disable it _(`--no-plugins.inquirerCli.enabled`) when using command line arguments)_
* `emojis`: `<boolean>` Render emojis or not. Default is `true`.

Read more about [how to set options in Mocks Server here][settings-url].

## Support

[Inquirer][inquirer-url] is used for displaying the interactive CLI. You can [consult its OS Terminals support here][inquirer-support].

## Contributing

Contributors are welcome.
Please read the [contributing guidelines](.github/CONTRIBUTING.md) and [code of conduct](.github/CODE_OF_CONDUCT.md).

[inquirer-url]: https://www.npmjs.com/package/inquirer
[inquirer-support]: https://www.npmjs.com/package/inquirer#support-os-terminals
[website-url]: https://www.mocks-server.org
[plugins-url]: https://www.mocks-server.org/docs/plugins/intro
[settings-url]: https://www.mocks-server.org/docs/configuration/how-to-change-settings
[animated-image-url]: https://www.mocks-server.org/img/inquirer-cli.gif
[main-distribution-url]: https://www.npmjs.com/package/@mocks-server/main
[logo-url]: https://www.mocks-server.org/img/logo_120.png
