[![Build status][travisci-image]][travisci-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Quality Gate][quality-gate-image]][quality-gate-url]

[![NPM dependencies][npm-dependencies-image]][npm-dependencies-url] [![Last commit][last-commit-image]][last-commit-url] [![Last release][release-image]][release-url] 

[![NPM downloads][npm-downloads-image]][npm-downloads-url] [![License][license-image]][license-url]


# Mocks server Cypress commands

This solution provides you commands for easily changing [@mocks-server settings][mocks-server-options-url], such as current behavior, delay time, etc.

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

Set current behavior:

```js
cy.mocksServerSetBehavior("admin-user");
```

Set delay time:

```js
cy.mocksServerSetDelay(2000);
```

Set any setting:

```js
cy.mocksServerSetSettings({
  watch: false,
  delay: 0,
  behavior: "catalog-error"
});
```

## Configuration

By default, the client is configured to request to http://localhost:3100/admin, based in the [default options of @mocks-server][mocks-server-options-url]

You can change both the base url of the "@mocks-server", and the admin api path of the "@mocks-server/plugin-admin-api" using the `config` method in your project's `cypress/support/commands.js`:

```js
import { config } from "@mocks-server/cypress-commands";

config({
  adminApiPath: "/foo-admin",
  baseUrl: "http://my-mocks-server:3200"
});
```

### Using commands

You should usually change the mock server settings in a `before` statement:

```js
describe("user with default role", () => {
  before(() => {
    cy.mocksServerSetBehavior("normal-user");
    cy.visit("/");
  });

  it("should not see the users section link", () => {
    cy.get("#users-section-link").should("not.be.visible");
  });
});

describe("user with admin role", () => {
  before(() => {
    cy.mocksServerSetBehavior("admin-user");
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
[travisci-image]: https://travis-ci.com/mocks-server/cypress-commands.svg?branch=master
[travisci-url]: https://travis-ci.com/mocks-server/cypress-commands
[last-commit-image]: https://img.shields.io/github/last-commit/mocks-server/cypress-commands.svg
[last-commit-url]: https://github.com/mocks-server/cypress-commands/commits
[license-image]: https://img.shields.io/npm/l/@mocks-server/cypress-commands.svg
[license-url]: https://github.com/mocks-server/cypress-commands/blob/master/LICENSE
[npm-downloads-image]: https://img.shields.io/npm/dm/@mocks-server/cypress-commands.svg
[npm-downloads-url]: https://www.npmjs.com/package/@mocks-server/cypress-commands
[npm-dependencies-image]: https://img.shields.io/david/mocks-server/cypress-commands.svg
[npm-dependencies-url]: https://david-dm.org/mocks-server/cypress-commands
[quality-gate-image]: https://sonarcloud.io/api/project_badges/measure?project=mocks-server-cypress-commands&metric=alert_status
[quality-gate-url]: https://sonarcloud.io/dashboard?id=mocks-server-cypress-commands
[release-image]: https://img.shields.io/github/release-date/mocks-server/cypress-commands.svg
[release-url]: https://github.com/mocks-server/cypress-commands/releases
