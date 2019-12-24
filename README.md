[![Build status][travisci-image]][travisci-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Quality Gate][quality-gate-image]][quality-gate-url]

[![NPM dependencies][npm-dependencies-image]][npm-dependencies-url] [![Last commit][last-commit-image]][last-commit-url] [![Last release][release-image]][release-url] 

[![NPM downloads][npm-downloads-image]][npm-downloads-url] [![License][license-image]][license-url]


# Mocks-server administration API client.

This package contains methods for administrating the mocks-server (using the plugin-admin-api RESTful API).

It can be used both from Browsers or from Node.js.

## Usage

```js
import { setBaseUrl, changeDelay } from "@mocks-server/admin-api-client";

setBaseUrl("http://localhost:3100");

changeDelay(1000).then(() => {
  console.log("Delay setting changed!");
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
