<p align="center"><a href="https://mocks-server.org" target="_blank" rel="noopener noreferrer"><img width="120" src="https://www.mocks-server.org/img/logo_120.png" alt="Mocks Server logo"></a></p>

<p align="center">
  <a href="https://github.com/mocks-server/main/actions?query=workflow%3Abuild+branch%3Amaster"><img src="https://github.com/mocks-server/main/workflows/build/badge.svg?branch=master" alt="Build Status"></a>
  <a href="https://codecov.io/gh/mocks-server/main"><img src="https://codecov.io/gh/mocks-server/main/branch/master/graph/badge.svg?token=2S8ZR55AJV" alt="Coverage"></a>
  <a href="https://sonarcloud.io/project/overview?id=mocks-server_main_cypress-commands"><img src="https://sonarcloud.io/api/project_badges/measure?project=mocks-server_main_cypress-commands&metric=alert_status" alt="Quality Gate"></a>
  <a href="https://www.npmjs.com/package/@mocks-server/cypress-commands"><img src="https://img.shields.io/npm/dm/@mocks-server/cypress-commands.svg" alt="Downloads"></a>
  <a href="https://renovatebot.com"><img src="https://img.shields.io/badge/renovate-enabled-brightgreen.svg" alt="Renovate"></a>
  <a href="https://github.com/mocks-server/main/blob/master/packages/cypress-commands/LICENSE"><img src="https://img.shields.io/npm/l/@mocks-server/cypress-commands.svg" alt="License"></a>
</p>

---

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

By default, the API client is configured to request to `http://127.0.0.1:3100/admin`, based in the [default Mocks Server options][mocks-server-options-url]

You can change both the base url of Mocks Server, and the api path of the administration API using the `cy.mocksConfig` command mentioned above, or the plugin environment variables:

* __`MOCKS_SERVER_BASE_URL`__: Modifies the base url of Mocks Server. Default is `http://127.0.0.1:3100`.
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

## License

MIT, see [LICENSE](./LICENSE) for details.

[mocks-server-url]: https://www.mocks-server.org
[mocks-server-options-url]: https://www.mocks-server.org/docs/configuration-options
