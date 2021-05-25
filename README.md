[![Build status][build-image]][build-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Quality Gate][quality-gate-image]][quality-gate-url]

[![NPM dependencies][npm-dependencies-image]][npm-dependencies-url] [![Renovate](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com) [![Last commit][last-commit-image]][last-commit-url] [![Last release][release-image]][release-url] 

[![NPM downloads][npm-downloads-image]][npm-downloads-url] [![License][license-image]][license-url]

# [![Mocks Server][logo-url]][website-url] Mocks Server

## The project

This project provides a mock server that can store and simulate multiple API behaviors. It can be added as a dependency of your project, and started simply running an NPM command.

Providing an interactive command line user interface and a REST API for changing the responses of the API, it is easy to use both for development and testing.

### Main features

* __Route variants__: Define many responses for a same [route](https://www.mocks-server.org/docs/get-started-routes).
* __Multiple mocks__: Group different [route variants](https://www.mocks-server.org/docs/get-started-routes) into different [mocks](https://www.mocks-server.org/docs/get-started-mocks). Change the current mock while the server is running using the [interactive command line interface](https://www.mocks-server.org/docs/plugins-inquirer-cli) or the [REST API](https://www.mocks-server.org/docs/plugins-admin-api).
* __Multiple formats__: Responses can be defined [using `json` or JavaScript files](https://www.mocks-server.org/docs/guides-organizing-files). [Babel](https://babeljs.io/) is also supported, so [ESM modules and TypeScript can also be used](https://www.mocks-server.org/docs/guides-using-babel).
* __Express middlewares__: Route variants [can be defined as `express` middlewares](https://www.mocks-server.org/docs/guides-using-middlewares).
* __Multiple interfaces__: Settings can be changed using the [interactive CLI](https://www.mocks-server.org/docs/plugins-inquirer-cli) or the [admin REST API](https://www.mocks-server.org/docs/plugins-admin-api). The CLI is perfect for development, and the API can be used from tests, for example.
* __Integrations__: Integrations with other tools are available, as the [Cypress plugin](https://www.mocks-server.org/docs/integrations-cypress).
* __Customizable__: You can [develop your own plugins](https://www.mocks-server.org/docs/plugins-developing-plugins), or even [routes handlers](https://www.mocks-server.org/docs/api-routes-handler), that allows to customize the format in which route variants are defined.

## Installation

Add it to your dependencies using NPM:

```bash
npm i @mocks-server/main --save-dev
```

Add next script to your `package.json` file:

```json
{
  "scripts": {
    "mocks" : "mocks-server"
  }
}
```

## Usage

Now, you can start Mocks Server with the command:

```bash
npm run mocks
```

When started for the first time, __it creates a scaffold folder__ named `mocks` in your project, containing next files and folders:

```
project-root/
├── mocks/
│   ├── routes/
│   │   ├── middlewares.js
│   │   └── users.js
│   └── mocks.json
└── mocks.config.js
```

The folder contains examples from this documentation providing a simple API with two different mocks and some route variants. You can use the interactive CLI that is also started to change the server settings and see how you can change the responses of the API changing the current mock, changing route variants, etc.

![Interactive CLI][inquirer-cli-image]

## How does it work?

It loads all files in the ["routes"](https://www.mocks-server.org/docs/get-started-routes) folder, containing handlers for routes, and the ["mocks"](https://www.mocks-server.org/docs/get-started-mocks) file, which defines sets of ["route variants"](https://www.mocks-server.org/docs/get-started-routes).

```js
// mocks/routes/users.js
module.exports = [
  {
    id: "get-users", // id of the route
    url: "/api/users", // url in express format
    method: "GET", // HTTP method
    variants: [
      {
        id: "empty", // id of the variant
        response: {
          status: 200, // status to send
          body: [] // body to send
        }
      },
      {
        id: "error", // id of the variant
        response: {
          status: 400, // status to send
          body: { // body to send
            message: "Error"
          }
        }
      }
    ]
  }
]
```

The server will respond to the requests with the route variants defined in the current mock.

```jsonc
// mocks/mocks.json
[
  {
    "id": "base", //id of the mock
    "routesVariants": ["get-users:empty", "get-user:success"] //routes variants to use
  },
  {
    "id": "users-error", //id of the mock
    "from": "base", //inherits the route variants of "base" mock
    "routesVariants": ["get-users:error"] //get-users route uses another variant
  }
]
```

Then, you can easily [change the responses of the API while the server is running](#configuration) changing the current mock, or defining specific route variants. This can make your __development or acceptance tests environments very much agile and flexible__, as you can define different ["mocks"](https://www.mocks-server.org/docs/get-started-mocks) for every different case you want to simulate.

## Configuration

Configure the server simply [modifying the `mocks.config.js` file at the root folder of your project](https://www.mocks-server.org/docs/configuration-file).

For changing [settings](https://www.mocks-server.org/docs/configuration-options) (such as current mock, delay time, etc.) while it is running, you can use:
* [Interactive command line interface](https://www.mocks-server.org/docs/plugins-inquirer-cli), which is very useful in local environments for development.
* [REST API](https://www.mocks-server.org/docs/plugins-admin-api) which is very useful to change mock or route variants from E2E tests, for example, as the [Cypress plugin does.](https://www.mocks-server.org/docs/integrations-cypress)

## Why a mock server?

Controlling the responses of the api will improve the front-end development workflow, avoiding early dependencies with back-end. It also improves the testing and development of error cases or another cases that are commonly hard to reproduce with a real api.

Defining the api responses during the earliest phases of development will improve the communication among team members and align their expectations.

Working with Node.js, it integrates better in front-end projects as any other NPM dependency, and it will be easier for front-end developers to maintain the mocks.

## Why "Mocks" in plural?

As explained, Mocks Server can store different mocks, which are sets of different route variants. So it simulates multiple api behaviors and send different responses to the same request at your convenience, so it is like having different mock servers that can be changed while running.

## Customization

Mocks Server is very customizable, and gives you the possibility of extend it with every new amazing feature you want:

- [Start it programmatically](https://www.mocks-server.org/docs/api-programmatic-usage) and use its multiple methods and events to manage it from your program.
- Add new options and features [installing plugins](https://www.mocks-server.org/docs/plugins-adding-plugins), or [developing your owns](https://www.mocks-server.org/docs/plugins-developing-plugins).
- Add new [routes handlers](https://www.mocks-server.org/docs/api-routes-handler), which allows to customize the format in which route variants are defined.


## Contributing

Contributors are welcome.
Please read the [contributing guidelines](.github/CONTRIBUTING.md) and [code of conduct](.github/CODE_OF_CONDUCT.md).

[website-url]: https://www.mocks-server.org
[logo-url]: https://www.mocks-server.org/img/logo_120.png
[inquirer-cli-image]: https://www.mocks-server.org/img/inquirer-cli.gif

[coveralls-image]: https://coveralls.io/repos/github/mocks-server/main/badge.svg
[coveralls-url]: https://coveralls.io/github/mocks-server/main
[build-image]: https://github.com/mocks-server/main/workflows/build/badge.svg?branch=master
[build-url]: https://github.com/mocks-server/main/actions?query=workflow%3Abuild+branch%3Amaster
[last-commit-image]: https://img.shields.io/github/last-commit/mocks-server/main.svg
[last-commit-url]: https://github.com/mocks-server/main/commits
[license-image]: https://img.shields.io/npm/l/@mocks-server/main.svg
[license-url]: https://github.com/mocks-server/main/blob/master/LICENSE
[npm-downloads-image]: https://img.shields.io/npm/dm/@mocks-server/main.svg
[npm-downloads-url]: https://www.npmjs.com/package/@mocks-server/main
[npm-dependencies-image]: https://img.shields.io/david/mocks-server/main.svg
[npm-dependencies-url]: https://david-dm.org/mocks-server/main
[quality-gate-image]: https://sonarcloud.io/api/project_badges/measure?project=mocks-server_main&metric=alert_status
[quality-gate-url]: https://sonarcloud.io/dashboard?id=mocks-server_main
[release-image]: https://img.shields.io/github/release-date/mocks-server/main.svg
[release-url]: https://github.com/mocks-server/main/releases
