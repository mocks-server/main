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

Extends Cypress' cy commands with methods for easily changing [Mocks Server settings][mocks-server-options-url], such as current collection, custom route variants, delay time, etc.

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

##### `cy.mocksSetCollection("users-error")`

Set current collection.

##### `cy.mocksUseRouteVariant("users:success")`

Set a specific route variant to be used by the current collection.

##### `cy.mocksRestoreRouteVariants()`

Restore route variants to those defined in the current collection.

##### `cy.mocksSetDelay(2000)`

Set routes default delay.

##### `cy.mocksSetConfig({ files: { watch: false}, mock: { routes: { delay: 0 }}})`

Set any [Mocks Server setting][mocks-server-options-url].

##### `cy.mocksConfigAdminApiClient({ port: 3110, host: "127.0.0.1" })`

Configures the [Mocks Server administration API client](https://github.com/mocks-server/admin-api-client), used under the hood to communicate with the administration REST API. Use this command only if you changed the administration API configuration and you need to configure the client properly.

## Configuration

By default, the API client is configured to request to `http://127.0.0.1:3110/api`, based in the [default Mocks Server options][mocks-server-options-url]

You can change both the host and port of the administration API using the `cy.mocksConfigAdminApiClient` command mentioned above, or the plugin environment variables:

* __`MOCKS_SERVER_ADMIN_API_PORT`__: Modifies the admin API client port. Default is `3110`.
* __`MOCKS_SERVER_ADMIN_API_HOST`__: Modifies the admin API client host. Default is `127.0.0.1`.
* __`MOCKS_SERVER_ENABLED`__: Disables requests to the Mocks Server admin API, so the commands will not fail even when Mocks Server is not running. This is useful to reuse same tests with a mocked API and a real API, because commands to change Mocks Server configuration will be ignored.

### Using commands

You should usually change Mocks Server configuration in a `before` statement:

```js
describe("user with default role", () => {
  before(() => {
    cy.mocksSetCollection("normal-user");
    cy.visit("/");
  });

  it("should not see the users section link", () => {
    cy.get("#users-section-link").should("not.be.visible");
  });
});

describe("user with admin role", () => {
  before(() => {
    cy.mocksSetCollection("admin-user");
    cy.visit("/");
  });

  it("should see the users section link", () => {
    cy.get("#users-section-link").should("be.visible");
  });
});
```

## Release notes

Current major release (`5.x`) is compatible only with `@mocks-server/main` versions upper or equal than `3.6`. Use prior releases for lower versions. If you don't want to update to the latest major version of this package yet but you want to update `@mocks-server/main`, you can also use any `4.x` version of this package with any `@mocks-server/main@3.x` version.

## License

MIT, see [LICENSE](./LICENSE) for details.

[mocks-server-url]: https://www.mocks-server.org
[mocks-server-options-url]: https://www.mocks-server.org/docs/configuration-options
