[![Build status][build-image]][build-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Quality Gate][quality-gate-image]][quality-gate-url]

[![NPM dependencies][npm-dependencies-image]][npm-dependencies-url] [![Renovate](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com) [![Last commit][last-commit-image]][last-commit-url] [![Last release][release-image]][release-url] 

[![NPM downloads][npm-downloads-image]][npm-downloads-url] [![License][license-image]][license-url]


# Mocks Server Cypress commands

Extends Cypress' cy commands with methods for easily changing [Mocks Server settings][mocks-server-options-url], such as current mock, route variants, delay time, etc.

## Installation

This module is distributed via npm and should be installed as one of your project's devDependencies:

```bash
npm i --save-dev @mocks-server/cypress-commands
```

## Usage

`@mocks-server/cypress-commands` extends Cypress' cy command.

Add this line to your project's `cypress/support/commands.js`:

```js
import "@mocks-server/cypress-commands"
```

You can now use all next commands:

### Commands

##### `cy.mocksSetMock("users-error")`

Sets current mock.

##### `cy.mocksUseRouteVariant("users:success")`

Sets a specific route variant to be used by current mock.

##### `cy.mocksRestoreRoutesVariants()`

Restore routes variants to those defined in current mock.

##### `cy.mocksSetDelay(2000)`

Sets delay time.

##### `cy.mocksSetSettings({ watch: false, delay: 0 })`

Sets any [Mocks Server setting][mocks-server-options-url].

##### `cy.mocksConfig({ adminApiPath: "/foo", baseUrl: "http://localhost:3000" })`

Configures the [Mocks Server administration API client](https://github.com/mocks-server/admin-api-client), used under the hood.

##### `cy.mocksSetBehavior("foo")`

Legacy method that sets behavior in Mocks Server v1.x

## Configuration

By default, the API client is configured to request to `http://localhost:3100/admin`, based in the [default Mocks Server options][mocks-server-options-url]

You can change both the base url of Mocks Server, and the api path of the administration API using the `cy.mocksConfig` command mentioned above, or the plugin environment variables:

* __`MOCKS_SERVER_BASE_URL`__: Modifies the base url of Mocks Server. Default is `http://localhost:3100`.
* __`MOCKS_SERVER_ADMIN_API_PATH`__: Modifies the path of the Mocks Server administration API. Default is `/admin`.
* __`MOCKS_SERVER_ENABLED`__: Disables requests to Mocks Server, so the commands will not fail even when Mocks Server is not running. This is useful to reuse same tests with mocks and a real API, because commands to change Mocks Server settings will be ignored.

### Using commands

You should usually change Mocks Server settings in a `before` statement:

```js
describe("user with default role", () => {
  before(() => {
    cy.mocksSetMock("normal-user");
    cy.visit("/");
  });

  it("should not see the users section link", () => {
    cy.get("#users-section-link").should("not.be.visible");
  });
});

describe("user with admin role", () => {
  before(() => {
    cy.mocksSetMock("admin-user");
    cy.visit("/");
  });

  it("should see the users section link", () => {
    cy.get("#users-section-link").should("be.visible");
  });
});
```

## Contributing

Contributors are welcome.
Please read the [contributing guidelines](.github/CONTRIBUTING.md) and [code of conduct](.github/CODE_OF_CONDUCT.md).

## License

MIT, see [LICENSE](./LICENSE) for details.

[mocks-server-url]: https://www.mocks-server.org
[mocks-server-options-url]: https://www.mocks-server.org/docs/configuration-options

[coveralls-image]: https://coveralls.io/repos/github/mocks-server/cypress-commands/badge.svg
[coveralls-url]: https://coveralls.io/github/mocks-server/cypress-commands
[build-image]: https://github.com/mocks-server/cypress-commands/workflows/build/badge.svg?branch=master
[build-url]: https://github.com/mocks-server/cypress-commands/actions?query=workflow%3Abuild+branch%3Amaster
[last-commit-image]: https://img.shields.io/github/last-commit/mocks-server/cypress-commands.svg
[last-commit-url]: https://github.com/mocks-server/cypress-commands/commits
[license-image]: https://img.shields.io/npm/l/@mocks-server/cypress-commands.svg
[license-url]: https://github.com/mocks-server/cypress-commands/blob/master/LICENSE
[npm-downloads-image]: https://img.shields.io/npm/dm/@mocks-server/cypress-commands.svg
[npm-downloads-url]: https://www.npmjs.com/package/@mocks-server/cypress-commands
[npm-dependencies-image]: https://img.shields.io/david/mocks-server/cypress-commands.svg
[npm-dependencies-url]: https://david-dm.org/mocks-server/cypress-commands
[quality-gate-image]: https://sonarcloud.io/api/project_badges/measure?project=mocks-server_cypress-commands&metric=alert_status
[quality-gate-url]: https://sonarcloud.io/dashboard?id=mocks-server_cypress-commands
[release-image]: https://img.shields.io/github/release-date/mocks-server/cypress-commands.svg
[release-url]: https://github.com/mocks-server/cypress-commands/releases
