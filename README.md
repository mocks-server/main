[![Build status][travisci-image]][travisci-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Quality Gate][quality-gate-image]][quality-gate-url]

[![NPM dependencies][npm-dependencies-image]][npm-dependencies-url] [![Last commit][last-commit-image]][last-commit-url] [![Last release][release-image]][release-url] 

[![NPM downloads][npm-downloads-image]][npm-downloads-url] [![License][license-image]][license-url]

# Mocks Server

Mocks server with extensible fixtures groupables in predefined behaviors. Change behaviors using built-in CLI or REST API.

## Table of contents

- [Getting started](#getting-started)
- [Installation](#installation)
- [Usage](#usage)
	- [Interactive CLI](#interactive-cli)
  - [Rest Api](#rest-api)
	- [Programmatic usage](#programmatic-usage)
		- [CLI](#cli)
		- [Server](#server)
	- [Global usage](#global-usage)
- [Options](#Options)
- [Defining mocks](#defining-mocks)

## Getting Started

This package provides a server that simulate APIs behaviors. As input, it needs "fixtures", which are responses for specific uris, and "features", which are sets of "fixtures".

It also provide a built-in api which allows to change the currently used "feature" in any moment simply making an http request.

## Installation

```bash
npm i @xbyorange/mocks-server --save-dev
```

## Usage

### Interactive CLI

Add an script to your `package.json` file, including the path to your mocks folder:

```json
"scripts": {
  "mocks-server" : "mocks-server --features=./mocks"
}
```

Now, you can start the mocks server CLI simply typing:

```bash
npm run mocks-server
```

![cli-home](./assets/cli_home.png)

### REST API

The server includes a REST API that allows to change dinamically the current feature, change delay time, etc.

Available api resources are:

* `GET` `/mocks/features` Returns an array containing all available features.
* `GET` `/mocks/features/current` Returns current feature.
* `PUT` `/mocks/features/current` Set current feature.
  * Request body example: `{ "name": "feature-name" }`
* `GET` `/mocks/settings` Return current server settings.
  * Response body example: `{ "delay": 0 }`
* `PUT` `/mocks/settings` Change current server settings.
  * Request body example: `{ "delay": 3000 }`

### Programmatic usage

#### CLI

The interactive CLI can be instantiated and started programmatically:

```js
const { Cli } = require("@xbyorange/mocks-server");

const startMyCli = () => {
  const cli = new Cli({
    port: 3200,
    log: "debug",
    watch: false
  });

  return cli.start();
};

startMyCli().catch(err => {
  console.log("Error starting CLI", err);
});
```

##### `Cli` (\[options\]\[,customQuitMethod\])
For first argument options, please read the [options](#options) chapter of this documentation. Available methods of an instance are:
- `start` ()
Inits the server in case it was stopped, adds the watch listeners, and renders main menu.
- `initServer` ()
Inits the server in case it was stopped, adds the watch listeners.
- `stopListeningServerWatch` ()
When server watch is active, the main menu will be displayed on file changes. This behavior can be deactivated using this method. This is useful when this CLI is loaded as a submenu of another CLI, for example.

#### Server

The server can be instantiated and started programmatically:

```js
const { Server } = require("@xbyorange/mocks-server");

const startMyServer = () => {
  const server = new Server(path.resolve(__dirname, "mocks"), {
    port: 3200,
    log: "debug",
    watch: false
  });

  return server.start();
};

startMyServer().then(server => {
  console.log("Server started", server);
});
```

##### `Server` (featuresFolder \[,options\])

First argument is mandatory, and has to be a path to a folder containing "features". All files in the folder will be loaded recursively, including subfolders.
For second argument options, please read the [options](#options) chapter of this documentation.

Available methods of an instance are:

- `start` (). Starts the server.
- `stop` (). Stops the server.
- `restart` (). Stops the server, initializes it again (reloading features files), and starts it again.
- `switchWatch` (state `<Boolean>`). Enable or disable features files watch, depending of the received "state" value.

Available getters are:

- `features`. Returns loaded features object.
- `watchEnabled`. Current state of the features files watcher.
- `error`. When server has returned an error, or an error ocurred loading features, it is available in this property.
- `events`. Returns server events object. A "watch-reload" event is emitted when the server watch detects changes in any features file, and restarts the server.

### Global usage

The mocks server can be used as a global dependency as well:

```bash
npm i @xbyorange/mocks-server -g
```

Now, you can start the built-in command line interface from anywhere, providing a path to a features folder:

```bash
mocks-server --features=./path-to-features
```

## Options

* port `<Number>` Por number for the Server to be listening.
* host `<String>` Host for the server. Default is "0.0.0.0" (Listen to any local host).
* log `<String>` Logs level. Can be one of "silly", "debug", "verbose", "info", "warn", "error".
* watch `<Boolean>` Watch features folder, and restart server on changes. Default is `true`.
* feature `<String>` Selected feature when server is started.
* delay `<Number` Responses delay time in milliseconds.
* features `Path as <String>` Path to a folder containing features to be used by the server.
* recursive `<Boolean>` Load features recursively. Watch is not affected by this option, it is always recursive.
* cli `<Boolean>` Start interactive CLI. Default is `true`.

## Defining mocks

The Mocks server handles two main concepts for defining mocks:

### Features

Each feature consists in a set of "fixtures", which are server responses for specific uris.

Features are extensibles, so, you can have a "base" feature, which defines the standard behavior of the mocks server and responses for all api uris, and change this behavior creating new features that changes only responses for certain "uris". All features are extensible as well.

For creating a Feature, you have to use the mocks-server "Feature" class, providing an array of "fixtures" to it:

```js
// Features file 1

const { Feature } = require("@xbyorange/mocks-server");

const fixtures = require("./fixtures");

const myFeature = new Feature([fixtures.uri_1_fixture, fixtures.uri_2_fixture]);

module.exports = {
  myFeature
};
```

Now, when loaded, the server will have available a "myFeature" feature, which contains two fixtures. You can add more features extending the first one and changing only the response for "uri_2", for example:

```js
// Features file 2

const { myFeature } = require("./features");

const fixtures = require("./fixtures");

const myFeature2 = myFeature.extend([fixtures.uri_2_different_fixture]);

module.exports = {
  myFeature2
};
```

Now, server will have available "myFeature" and "myFeature2" features. And "myFeature2" will send a different response only for "uri_2" (supossing that "uri_2_fixture" and "uri_2_different_fixture" were defined with the same uri)

### Fixtures

A "fixture" defines the response for an specific uri. It has to be an object containing properties:

* url `uri as <String>` Uri of the resource. It can contains expressions for matching dynamic uris. Read the [route-parser](https://www.npmjs.com/package/route-parser) documentation for further info about how to use dynamic routing.
* method `<String>` Method of the request. Defines to which method will response this fixture. Valid values are http request methods, such as "GET", "POST", "PUT", etc.
* response `<Object>` Defines the response that the Mocks Server will send to the request:
	* status `<Number>` Status code to send.
	* body `<Object>` Json object to send as body in the response.
* response `<Function>` Response can be defined as a function too. The function will receive the [express](http://expressjs.com/es/api.html) `request`, `response` and `next` arguments, so you are free to handle the server request as you need.

```js
// Fixtures file

const uri_1_fixture = {
  url: "/api/foo-uri",
  method: "GET",
  response: {
    status: 200,
    body: [
      {
        name: "foo-name"
      }
    ]
  }
};

const uri_2_fixture = {
  url: "/api/foo-uri-2/:id",
  method: "PUT",
  response: {
    status: 204
  }
};

const uri_2_different_fixture = {
  url: "/api/foo-uri-2/:id",
  method: "PUT",
  response: (req, res) => {
    res.status(404);
    res.send({
      message: `${req.params.id} was not found`
    });
  }
};

module.exports = {
  uri_1_fixture,
  uri_2_fixture,
  uri_2_different_fixture
};
```

## Contributing

Contributors are welcome.
Please read the [contributing guidelines](.github/CONTRIBUTING.md) and [code of conduct](.github/CODE_OF_CONDUCT.md).

[coveralls-image]: https://coveralls.io/repos/github/XbyOrange/mocks-server/badge.svg
[coveralls-url]: https://coveralls.io/github/XbyOrange/mocks-server
[travisci-image]: https://travis-ci.com/xbyorange/mocks-server.svg?branch=master
[travisci-url]: https://travis-ci.com/xbyorange/mocks-server
[last-commit-image]: https://img.shields.io/github/last-commit/xbyorange/mocks-server.svg
[last-commit-url]: https://github.com/xbyorange/mocks-server/commits
[license-image]: https://img.shields.io/npm/l/@xbyorange/mocks-server.svg
[license-url]: https://github.com/xbyorange/mocks-server/blob/master/LICENSE
[npm-downloads-image]: https://img.shields.io/npm/dm/@xbyorange/mocks-server.svg
[npm-downloads-url]: https://www.npmjs.com/package/@xbyorange/mocks-server
[npm-dependencies-image]: https://img.shields.io/david/xbyorange/mocks-server.svg
[npm-dependencies-url]: https://david-dm.org/xbyorange/mocks-server
[quality-gate-image]: https://sonarcloud.io/api/project_badges/measure?project=xbyorange-mocks-server&metric=alert_status
[quality-gate-url]: https://sonarcloud.io/dashboard?id=xbyorange-mocks-server
[release-image]: https://img.shields.io/github/release-date/xbyorange/mocks-server.svg
[release-url]: https://github.com/xbyorange/mocks-server/releases
