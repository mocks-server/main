<p align="center"><a href="https://www.mocks-server.org" target="_blank" rel="noopener noreferrer"><img width="120" src="https://www.mocks-server.org/img/logo_120.png" alt="Mocks Server logo"></a></p>

<p align="center">
  <a href="https://github.com/mocks-server/main/actions?query=workflow%3Abuild+branch%3Amaster"><img src="https://github.com/mocks-server/main/workflows/build/badge.svg?branch=master" alt="Build Status"></a>
  <a href="https://codecov.io/gh/mocks-server/main"><img src="https://codecov.io/gh/mocks-server/main/branch/master/graph/badge.svg?token=2S8ZR55AJV" alt="Coverage"></a>
  <a href="https://sonarcloud.io/project/overview?id=mocks-server_main"><img src="https://sonarcloud.io/api/project_badges/measure?project=mocks-server_main&metric=alert_status" alt="Quality Gate"></a>
  <a href="https://www.npmjs.com/package/@mocks-server/main"><img src="https://img.shields.io/npm/dm/@mocks-server/main.svg" alt="Downloads"></a>
  <a href="https://renovatebot.com"><img src="https://img.shields.io/badge/renovate-enabled-brightgreen.svg" alt="Renovate"></a>
  <a href="https://github.com/mocks-server/main/releases"><img src="https://img.shields.io/github/release-date/mocks-server/main.svg" alt="Last release"></a>
  <a href="https://github.com/mocks-server/main/commits"><img src="https://img.shields.io/github/last-commit/mocks-server/main.svg" alt="Last commit"></a>
  <a href="https://github.com/mocks-server/main/blob/master/LICENSE"><img src="https://img.shields.io/npm/l/@mocks-server/main.svg" alt="License"></a>
</p>

---

## Introduction

Node.js mock server running live, interactive mocks in place of real APIs. __It makes able to define many different responses for a same route__, so, you can change the whole mocked API behavior by simply changing the response of one or many routes while the server is running.

## Usage

Define your mocked API routes in YAML, JSON, JavaScript or TypeScript files. Mocks Server loads them automatically and watches for changes. Defining routes using any of the available APIs is also possible.

Routes can be defined in many ways, from plain objects to plain text and even Express middlewares, and they can act in different ways also, from sending a response to proxy the request to another host.

## Configuration

Configure the server simply modifying the configuration file at the root folder of your project, or use command line arguments, or even environment variables.

For changing options while it is running, you can also use any of the available integrations tools that enable live interactions with Mocks Server.

## Integrations

Providing a Javascript API, an interactive command line interface and a REST API for __changing the responses of the mocked API while it is running, it is easy to use both for development and testing__. Tools providing integrations with other ecosystems are also available, such as Cypress commands.

## Documentation

To check out docs, visit [www.mocks-server.org][website-url].

## Ecosystem

| Project | Status | Description |
| --- | --- | --- |
| [main] | [![main-status]][main-package] | Main distribution. It includes all plugins preinstalled |
| [core] | [![core-status]][core-package] | Pluggable core. It can be used programmatically also |
| [plugin-admin-api] | [![plugin-admin-api-status]][plugin-admin-api-package] | Plugin providing an administration REST API |
| [plugin-inquirer-cli] | [![plugin-inquirer-cli-status]][plugin-inquirer-cli-package] | Plugin providing an administration interactive CLI |
| [plugin-openapi] | [![plugin-openapi-status]][plugin-openapi-package] | Plugin allowing to create routes and collections from OpenApi definitions |
| [plugin-proxy] | [![plugin-proxy-status]][plugin-proxy-package] | Plugin providing Proxy route handler |
| [admin-api-client] | [![admin-api-client-status]][admin-api-client-package] | API client for [plugin-admin-api] |
| [admin-api-client-data-provider] | [![admin-api-client-data-provider-status]][admin-api-client-data-provider-package] | API client for [plugin-admin-api] built using [data-provider] |
| [admin-api-paths] | [![admin-api-paths-status]][admin-api-paths-package] | Definition of [plugin-admin-api] routes |
| [cypress-commands] | [![cypress-commands-status]][cypress-commands-package] | [Cypress][cypress] commands to administrate Mocks Server |
| [config] | [![config-status]][config-package] | Provides configuration to [core][core] components and plugins |
| [nested-collections] | [![nested-collections-status]][nested-collections-package] | Nested collections manager. Used to provide alert namespaces to plugins |
| [logger] | [![logger-status]][logger-package] | Winston-based logger with namespaces and events emitter |

## Contributing

Contributors are welcome.
Please read the [contributing guidelines](.github/CONTRIBUTING.md) and [code of conduct](.github/CODE_OF_CONDUCT.md).

[main]: https://github.com/mocks-server/main/tree/master/packages/main
[main-status]: https://img.shields.io/npm/v/@mocks-server/main.svg
[main-package]: https://npmjs.com/package/@mocks-server/main

[core]: https://github.com/mocks-server/main/tree/master/packages/core
[core-status]: https://img.shields.io/npm/v/@mocks-server/core.svg
[core-package]: https://npmjs.com/package/@mocks-server/core

[plugin-admin-api]: https://github.com/mocks-server/main/tree/master/packages/plugin-admin-api
[plugin-admin-api-status]: https://img.shields.io/npm/v/@mocks-server/plugin-admin-api.svg
[plugin-admin-api-package]: https://npmjs.com/package/@mocks-server/plugin-admin-api

[plugin-inquirer-cli]: https://github.com/mocks-server/main/tree/master/packages/plugin-inquirer-cli
[plugin-inquirer-cli-status]: https://img.shields.io/npm/v/@mocks-server/plugin-inquirer-cli.svg
[plugin-inquirer-cli-package]: https://npmjs.com/package/@mocks-server/plugin-inquirer-cli

[plugin-openapi]: https://github.com/mocks-server/main/tree/master/packages/plugin-openapi
[plugin-openapi-status]: https://img.shields.io/npm/v/@mocks-server/plugin-openapi.svg
[plugin-openapi-package]: https://npmjs.com/package/@mocks-server/plugin-openapi

[plugin-proxy]: https://github.com/mocks-server/main/tree/master/packages/plugin-proxy
[plugin-proxy-status]: https://img.shields.io/npm/v/@mocks-server/plugin-proxy.svg
[plugin-proxy-package]: https://npmjs.com/package/@mocks-server/plugin-proxy

[admin-api-client]: https://github.com/mocks-server/main/tree/master/packages/admin-api-client
[admin-api-client-status]: https://img.shields.io/npm/v/@mocks-server/admin-api-client.svg
[admin-api-client-package]: https://npmjs.com/package/@mocks-server/admin-api-client

[admin-api-client-data-provider]: https://github.com/mocks-server/main/tree/master/packages/admin-api-client-data-provider
[admin-api-client-data-provider-status]: https://img.shields.io/npm/v/@mocks-server/admin-api-client-data-provider.svg
[admin-api-client-data-provider-package]: https://npmjs.com/package/@mocks-server/admin-api-client-data-provider

[admin-api-paths]: https://github.com/mocks-server/main/tree/master/packages/admin-api-paths
[admin-api-paths-status]: https://img.shields.io/npm/v/@mocks-server/admin-api-paths.svg
[admin-api-paths-package]: https://npmjs.com/package/@mocks-server/admin-api-paths

[cypress-commands]: https://github.com/mocks-server/main/tree/master/packages/cypress-commands
[cypress-commands-status]: https://img.shields.io/npm/v/@mocks-server/cypress-commands.svg
[cypress-commands-package]: https://npmjs.com/package/@mocks-server/cypress-commands

[config]: https://github.com/mocks-server/main/tree/master/packages/config
[config-status]: https://img.shields.io/npm/v/@mocks-server/config.svg
[config-package]: https://npmjs.com/package/@mocks-server/config

[nested-collections]: https://github.com/mocks-server/main/tree/master/packages/nested-collections
[nested-collections-status]: https://img.shields.io/npm/v/@mocks-server/nested-collections.svg
[nested-collections-package]: https://npmjs.com/package/@mocks-server/nested-collections

[logger]: https://github.com/mocks-server/main/tree/master/packages/logger
[logger-status]: https://img.shields.io/npm/v/@mocks-server/logger.svg
[logger-package]: https://npmjs.com/package/@mocks-server/logger

[website-url]: https://www.mocks-server.org
[data-provider]: https://www.data-provider.org
[cypress]: https://www.cypress.io/
