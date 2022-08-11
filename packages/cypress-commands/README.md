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

Extends Cypress' cy commands with methods for easily changing [Mocks Server configuration][mocks-server-options-url] while it is running, such as current collection, custom route variants, delay time, etc.

For further info, you can read the [Mocks Server Cypress integration docs](https://www.mocks-server.org/docs/integrations/cypress).

## Installation

This module is distributed via npm and should be installed as one of your project's devDependencies:

```bash
npm i --save-dev @mocks-server/cypress-commands
```

### Registering commands

`@mocks-server/cypress-commands` extends Cypress' cy commands.

At the top of your Cypress' support file (usually `cypress/support/e2e.js` for `e2e` testing type):

```javascript
import { register } from "@mocks-server/cypress-commands";

register();
```

Read [Cypress configuration docs](https://docs.cypress.io/guides/references/configuration) for further info.

<details>
<summary><strong>Registering commands in Cypress <10.0</strong></summary>

Add these lines to your project's `cypress/support/index.js`:

```js
import { register } from "@mocks-server/cypress-commands";

register();
```

</details>

## Usage

Once registered, you can use all next commands:

### Commands

#### `cy.mocksSetCollection("users-error")`

Set current collection.

#### `cy.mocksUseRouteVariant("users:success")`

Set a specific route variant to be used by the current collection.

#### `cy.mocksRestoreRouteVariants()`

Restore route variants to those defined in the current collection.

#### `cy.mocksSetDelay(2000)`

Set routes default delay.

#### `cy.mocksSetConfig({ files: { watch: false}, mock: { routes: { delay: 0 }}})`

Set any [Mocks Server setting][mocks-server-options-url].

#### `cy.mocksConfigClient(configuration)`

Configures the [Mocks Server administration API client](https://github.com/mocks-server/admin-api-client), used under the hood to communicate with the administration REST API.

* __`configuration`__ _`<Object>`_ - It must be an object containing any of next properties:
  * __`enabled`__ _`<Boolean>`_ - Enables or disables the API client.
  * __`port`__ _`<Number>`_ - Changes the API client port. 
  * __`host`__ _`<String>`_ - Changes the API client host.
  * __`https`__ _`<Boolean>`_ - If `true`, changes the client protocol to "https". Default is `false`.

## Configuration

By default, the API client is configured to request to `http://127.0.0.1:3110/api`, based in the [default Mocks Server Plugin Admin Api options][mocks-server-options-url]

Use next settings only if you changed the administration API configuration and you need to configure the client properly, or in case you also need to run your tests without starting the Mocks Server.

You can change the protocol, host and port of the administration API using the `cy.mocksConfigClient` command mentioned above, or the plugin environment variables:

* __`MOCKS_SERVER_LOGS`__: Log commands status on Cypress or not. Default is `true`.
* __`MOCKS_SERVER_ADMIN_API_PORT`__: Modifies the admin API client port. Default is `3110`.
* __`MOCKS_SERVER_ADMIN_API_HOST`__: Modifies the admin API client host. Default is `127.0.0.1`.
* __`MOCKS_SERVER_ADMIN_API_HTTPS`__: If `true`, changes the admin API client protocol to "https". Default is `false`.
* __`MOCKS_SERVER_ENABLED`__: Disables requests to the Mocks Server admin API, so the commands will not fail even when Mocks Server is not running. This is useful to reuse same tests with a mocked API and a real API, because commands to change Mocks Server configuration will be ignored.

> Note: These environment variables only affect to the default Mocks Server API client (except `MOCKS_SERVER_LOGS`). Read [usage with multiple Mocks Servers](#usage-with-multiple-mocks-servers) bellow for further info.

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

## Usage with multiple Mocks Servers

This package can be used also to control multiple Mocks Server processes. __All commands described above support passing an extra argument__, which can be a different `AdminApiClient` instance configured in a different way. When the commands receive a `AdminApiClient` instance, it uses its configuration to perform requests to the Mocks Server administration API client instead of the default one.

Note that changing the plugin environment variables values don't affect to custom API clients created this way, so, if you want to configure them using environment variables you'll have to use your own.

### AdminApiClient(configuration)

Returns a new Mocks Server Admin API client to be provided to this plugin's Cypress commands, so they use that client instead of the default one. Configuration options are the same than described for the `cy.mocksConfigClient` command:

* __`configuration`__ _`<Object>`_ - Optional (configuration can be changed also afterwards using the `cy.mocksConfigClient` command and passing the client to be configured). It should be an object containing any of next properties:
  * __`enabled`__ _`<Boolean>`_ - Enables or disables the API client.
  * __`port`__ _`<Number>`_ - Changes the API client port. 
  * __`host`__ _`<String>`_ - Changes the API client host.
  * __`https`__ _`<Boolean>`_ - If `true`, changes the client protocol to "https". Default is `false`.

### Commands API when using a custom client

* __`cy.mocksSetCollection("users-error", adminApiClient)`__ - Set current collection using the provided client.
* __`cy.mocksUseRouteVariant("users:success", adminApiClient)`__ - Set a specific route variant using the provided client.
* __`cy.mocksRestoreRouteVariants(adminApiClient)`__ - Restore route variants using the provided client.
* __`cy.mocksSetDelay(2000, adminApiClient)`__ - Set routes default delay using the provided client.
* __`cy.mocksSetConfig(mocksServerConfiguration, adminApiClient)`__ - Set any [Mocks Server setting][mocks-server-options-url] using the provided client.
* __`cy.mocksConfigClient(clientConfiguration, adminApiClient)`__ - Configures the provided admin API client.

### Example

```js
import { AdminApiClient } from "@mocks-server/cypress-commands";

const usersApiClient = new AdminApiClient({
  port: 3500,
  host: "127.0.0.1"
});
const gravatarApiClient = new AdminApiClient({
  port: 3200,
  host: "localhost"
});

describe("users page", () => {
  describe("When normal user is logged in and gravatar API does not work", () => {
    before(() => {
      cy.mocksSetCollection("normal-user", usersApiClient);
      cy.mocksSetCollection("server-error", gravatarApiClient);
      cy.visit("/");
    });

    it("should not see the users section link", () => {
      cy.get("#users-section-link").should("not.be.visible");
    });

    it("should not display user avatars", () => {
      cy.get(".user-avatar").should("not.be.visible");
    });
  });
});
```

## Usage with TypeScript

For those writing [TypesScript tests in Cypress][cypress-typescript], this package includes TypeScript declarations.

Add "@mocks-server/cypress-commands" to the `types` property in the `tsconfig.json` file. You may also need to set the TS `allowSyntheticDefaultImports` option to true:

```json
{
  "compilerOptions": {
    "types": ["cypress", "@mocks-server/cypress-commands"],
    "allowSyntheticDefaultImports": true
  }
}
```

Or reference the package in the files using it:

```typescript
/// <reference types="@mocks-server/cypress-commands" />
```

## Further info

For further info, you can read the [Mocks Server Cypress integration docs](https://www.mocks-server.org/docs/integrations/cypress).

## Release notes

Current major release (`5.x`) is compatible only with `@mocks-server/main` versions upper or equal than `3.6`. Use prior releases for lower versions. If you don't want to update to the latest major version of this package yet but you want to update `@mocks-server/main`, you can also use any `4.x` version of this package with any `@mocks-server/main@3.x` version.

## License

MIT, see [LICENSE](./LICENSE) for details.

[mocks-server-url]: https://www.mocks-server.org
[mocks-server-options-url]: https://www.mocks-server.org/docs/configuration/options
[cypress-typescript]: https://docs.cypress.io/guides/tooling/typescript-support.html
