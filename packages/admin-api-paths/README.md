<p align="center"><a href="https://mocks-server.org" target="_blank" rel="noopener noreferrer"><img width="120" src="https://www.mocks-server.org/img/logo_120.png" alt="Mocks Server logo"></a></p>

<p align="center">
  <a href="https://github.com/mocks-server/main/actions?query=workflow%3Abuild+branch%3Amaster"><img src="https://github.com/mocks-server/main/workflows/build/badge.svg?branch=master" alt="Build Status"></a>
  <a href="https://codecov.io/gh/mocks-server/main"><img src="https://codecov.io/gh/mocks-server/main/branch/master/graph/badge.svg?token=2S8ZR55AJV" alt="Coverage"></a>
  <a href="https://sonarcloud.io/project/overview?id=mocks-server_main_admin-api-paths"><img src="https://sonarcloud.io/api/project_badges/measure?project=mocks-server_main_admin-api-paths&metric=alert_status" alt="Quality Gate"></a>
  <a href="https://www.npmjs.com/package/@mocks-server/admin-api-paths"><img src="https://img.shields.io/npm/dm/@mocks-server/admin-api-paths.svg" alt="Downloads"></a>
  <a href="https://renovatebot.com"><img src="https://img.shields.io/badge/renovate-enabled-brightgreen.svg" alt="Renovate"></a>
  <a href="https://github.com/mocks-server/main/blob/master/packages/admin-api-paths/LICENSE"><img src="https://img.shields.io/npm/l/@mocks-server/admin-api-paths.svg" alt="License"></a>
</p>

---

# Api paths of the Mocks-Server Plugin Admin Api

Constants defining API paths of the [Mocks Server plugin-admin-api][plugin-admin-api-url]. Use them to build plugin clients.

## Usage

```js
import { SETTINGS } from "@mocks-server/admin-api-paths";

console.log(SETTINGS); // /settings
```

## Contributing

Contributors are welcome.
Please read the [contributing guidelines](.github/CONTRIBUTING.md) and [code of conduct](.github/CODE_OF_CONDUCT.md).

[plugin-admin-api-url]: https://github.com/mocks-server/plugin-admin-api
