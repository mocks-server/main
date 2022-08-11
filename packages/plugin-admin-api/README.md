<p align="center"><a href="https://mocks-server.org" target="_blank" rel="noopener noreferrer"><img width="120" src="https://www.mocks-server.org/img/logo_120.png" alt="Mocks Server logo"></a></p>

<p align="center">
  <a href="https://github.com/mocks-server/main/actions?query=workflow%3Abuild+branch%3Amaster"><img src="https://github.com/mocks-server/main/workflows/build/badge.svg?branch=master" alt="Build Status"></a>
  <a href="https://codecov.io/gh/mocks-server/main"><img src="https://codecov.io/gh/mocks-server/main/branch/master/graph/badge.svg?token=2S8ZR55AJV" alt="Coverage"></a>
  <a href="https://sonarcloud.io/project/overview?id=mocks-server_main_plugin-admin-api"><img src="https://sonarcloud.io/api/project_badges/measure?project=mocks-server_main_plugin-admin-api&metric=alert_status" alt="Quality Gate"></a>
  <a href="https://www.npmjs.com/package/@mocks-server/plugin-admin-api"><img src="https://img.shields.io/npm/dm/@mocks-server/plugin-admin-api.svg" alt="Downloads"></a>
  <a href="https://renovatebot.com"><img src="https://img.shields.io/badge/renovate-enabled-brightgreen.svg" alt="Renovate"></a>
  <a href="https://github.com/mocks-server/main/blob/master/packages/plugin-admin-api/LICENSE"><img src="https://img.shields.io/npm/l/@mocks-server/plugin-admin-api.svg" alt="License"></a>
</p>

---

# Mocks Server Plugin Admin Api

Plugin for [Mocks Server][website-url] that provides a REST API allowing to interact with the server while it is running.

This is __very useful when running E2E tests, because you can change the responses of the API mock__ simply with a HTTP request in the `before` method of your tests, for example.

A __client for the administration api__ is also distributed as a separated package: [@mocks-server/admin-api-client](https://www.npmjs.com/package/@mocks-server/admin-api-client).

## Usage

This plugin is included in the main distribution of the Mocks Server project, so you can refer to the [official documentation website][website-url].

## Options

* __`plugins.adminApi.port`__ _(Number)_: Port for the administration REST API. Default is `3110`.
* __`plugins.adminApi.host`__ _(String)_: Host for the administration REST API. Default is `0.0.0.0` (Reachable to all IPv4 addresses on the local machine).
* __`plugins.adminApi.https.enabled`__ _(Boolean)_: Enables the HTTPS protocol in the administration REST API
* __`plugins.adminApi.https.cert`__ _(String)_: Path to the HTTPS certificate. Relative to the current `process.cwd()` or absolute.
* __`plugins.adminApi.https.key`__ _(String)_: Path to the HTTPS certificate key. Relative to the current `process.cwd()` or absolute.

Read more about [how to set options in Mocks Server here](https://www.mocks-server.org/docs/configuration/how-to-change-settings).

## API resources

Available API resources are described in the OpenAPI specification provided by the API server itself at [http://localhost:3110/docs/open-api.json](http://localhost:3110/docs/open-api.json) once it is started.

## Contributing

Contributors are welcome.
Please read the [contributing guidelines](.github/CONTRIBUTING.md) and [code of conduct](.github/CODE_OF_CONDUCT.md).

[website-url]: https://www.mocks-server.org/docs/integrations/rest-api
[logo-url]: https://www.mocks-server.org/img/logo_120.png
