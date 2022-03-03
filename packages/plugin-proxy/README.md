[![Build status][build-image]][build-url] [![Coverage Status][coveralls-image]][coveralls-url] [![Quality Gate][quality-gate-image]][quality-gate-url]

[![Renovate](https://img.shields.io/badge/renovate-enabled-brightgreen.svg)](https://renovatebot.com) [![Last commit][last-commit-image]][last-commit-url] [![Last release][release-image]][release-url] 

[![NPM downloads][npm-downloads-image]][npm-downloads-url] [![License][license-image]][license-url]


# [![Mocks Server][logo-url]][website-url] Mocks Server Plugin Proxy

Plugin for [Mocks Server][website-url] that provides a [route handler](https://www.mocks-server.org/docs/api-routes-handler) that proxy requests to another host and pass response back to original caller.

It uses the [express-http-proxy](https://github.com/villadora/express-http-proxy) package under the hood, and supports all of its options.

## Usage

This plugin is included in the [main distribution of the Mocks Server project][main-distribution-url], so you can also read the [official documentation website][website-url].

### Proxy routes

If you want a [route variant](https://www.mocks-server.org/docs/get-started-routes) to use the `proxy` handler, define its `handler` property as "proxy". Use the `host` property to set the host for the route, and the `options` property to set any of the [express-http-proxy](https://github.com/villadora/express-http-proxy) options.

```js
module.exports = [
  {
    id: "proxy-all",
    url: "*",
    method: ["GET", "POST", "PATCH", "PUT"],
    variants: [
      {
        id: "proxy-to-google",
        handler: "proxy", // This route variant will use the "proxy" handler from this plugin
        host: "https://www.google.com", // proxy host
        options: {} // Options for express-http-proxy
      },
      {
        id: "disabled",
        response: (req, res, next) => next(),
      },
    ],
  },
];
```

### Route variant options

Mocks server common properties to all route handlers are in _cursive_. Specific properties of this plugin are in __bold__:

* _`id`_ _(String)_: Id of the route variant.
* _`handler`_ _(String)_: Must be "proxy" to let this plugin handle the route.
* _`delay`_ _(Number|null)_: Milliseconds of delay for this variant.
* __`host`__ _(String|Function)_: The proxy host. Equivalent to the [`express-http-proxy` `host` option](https://github.com/villadora/express-http-proxy#host), so it can also be a function.
* __`options`__ _(Object)_: Object containing any of the [options supported by the `express-http-proxy` package](https://github.com/villadora/express-http-proxy#options). Some of them are:
  * __filter__ _(Function)_: [`filter` option](https://github.com/villadora/express-http-proxy#filter-supports-promises) for `express-http-proxy`.
  * __userResDecorator__ _(Function)_: [`userResDecorator` option](https://github.com/villadora/express-http-proxy#userresdecorator-was-intercept-supports-promise) for `express-http-proxy`.
  * __...__ all other [`express-http-proxy` options](https://github.com/villadora/express-http-proxy#options) are also supported.

> Tip: Note that the `delay` option is still valid for routes handled by this plugin, so you can use it to simulate that host responses are slow.


## Contributing

Contributors are welcome.
Please read the [contributing guidelines](.github/CONTRIBUTING.md) and [code of conduct](.github/CODE_OF_CONDUCT.md).

[website-url]: https://www.mocks-server.org
[main-distribution-url]: https://www.npmjs.com/package/@mocks-server/main
[options-url]: https://www.mocks-server.org/docs/configuration-options
[logo-url]: https://www.mocks-server.org/img/logo_120.png

[coveralls-image]: https://coveralls.io/repos/github/mocks-server/plugin-proxy/badge.svg
[coveralls-url]: https://coveralls.io/github/mocks-server/plugin-proxy
[build-image]: https://github.com/mocks-server/plugin-proxy/workflows/build/badge.svg?branch=main
[build-url]: https://github.com/mocks-server/plugin-proxy/actions?query=workflow%3Abuild+branch%3Amain
[last-commit-image]: https://img.shields.io/github/last-commit/mocks-server/plugin-proxy.svg
[last-commit-url]: https://github.com/mocks-server/plugin-proxy/commits
[license-image]: https://img.shields.io/npm/l/@mocks-server/plugin-proxy.svg
[license-url]: https://github.com/mocks-server/plugin-proxy/blob/main/LICENSE
[npm-downloads-image]: https://img.shields.io/npm/dm/@mocks-server/plugin-proxy.svg
[npm-downloads-url]: https://www.npmjs.com/package/@mocks-server/plugin-proxy
[quality-gate-image]: https://sonarcloud.io/api/project_badges/measure?project=mocks-server_plugin-proxy&metric=alert_status
[quality-gate-url]: https://sonarcloud.io/dashboard?id=mocks-server_plugin-proxy
[release-image]: https://img.shields.io/github/release-date/mocks-server/plugin-proxy.svg
[release-url]: https://github.com/mocks-server/plugin-proxy/releases
