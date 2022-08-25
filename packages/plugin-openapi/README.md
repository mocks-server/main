<p align="center"><a href="https://mocks-server.org" target="_blank" rel="noopener noreferrer"><img width="120" src="https://www.mocks-server.org/img/logo_120.png" alt="Mocks Server logo"></a></p>

<p align="center">
  <a href="https://github.com/mocks-server/main/actions?query=workflow%3Abuild+branch%3Amaster"><img src="https://github.com/mocks-server/main/workflows/build/badge.svg?branch=master" alt="Build Status"></a>
  <a href="https://codecov.io/gh/mocks-server/main"><img src="https://codecov.io/gh/mocks-server/main/branch/master/graph/badge.svg?token=2S8ZR55AJV" alt="Coverage"></a>
  <a href="https://sonarcloud.io/project/overview?id=mocks-server_main_plugin-openapi"><img src="https://sonarcloud.io/api/project_badges/measure?project=mocks-server_main_plugin-openapi&metric=alert_status" alt="Quality Gate"></a>
  <a href="https://www.npmjs.com/package/@mocks-server/plugin-openapi"><img src="https://img.shields.io/npm/dm/@mocks-server/plugin-openapi.svg" alt="Downloads"></a>
  <a href="https://renovatebot.com"><img src="https://img.shields.io/badge/renovate-enabled-brightgreen.svg" alt="Renovate"></a>
  <a href="https://github.com/mocks-server/main/blob/master/packages/plugin-openapi/LICENSE"><img src="https://img.shields.io/npm/l/@mocks-server/plugin-openapi.svg" alt="License"></a>
</p>

---

# Mocks Server Plugin OpenApi

[Mocks Server][website-url] plugin enabling to create routes and collections from OpenApi definitions.

## Usage

This plugin is included in the main distribution of the Mocks Server project, so you can refer to the [official documentation website][website-url].

## Options

* __`plugins.openapi.collection.id`__ _(String | Null)_: Id for the collection to be created with __all routes from all OpenAPI documents__. Default is "openapi". When it is set to `null`, no collection will be created.
* __`plugins.openapi.collection.from`__ _(String)_: When provided, the created collection will extend from this one.

Read more about [how to set options in Mocks Server here](https://www.mocks-server.org/docs/configuration/how-to-change-settings).

## Contributing

Contributors are welcome.
Please read the [contributing guidelines](../../.github/CONTRIBUTING.md) and [code of conduct](../../.github/CODE_OF_CONDUCT.md).

[website-url]: https://www.mocks-server.org
