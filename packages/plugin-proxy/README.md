<p align="center"><a href="https://mocks-server.org" target="_blank" rel="noopener noreferrer"><img width="120" src="https://www.mocks-server.org/img/logo_120.png" alt="Mocks Server logo"></a></p>

<p align="center">
  <a href="https://github.com/mocks-server/main/actions?query=workflow%3Abuild+branch%3Amaster"><img src="https://github.com/mocks-server/main/workflows/build/badge.svg?branch=master" alt="Build Status"></a>
  <a href="https://codecov.io/gh/mocks-server/main"><img src="https://codecov.io/gh/mocks-server/main/branch/master/graph/badge.svg?token=2S8ZR55AJV" alt="Coverage"></a>
  <a href="https://sonarcloud.io/project/overview?id=mocks-server_main_plugin-proxy"><img src="https://sonarcloud.io/api/project_badges/measure?project=mocks-server_main_plugin-proxy&metric=alert_status" alt="Quality Gate"></a>
  <a href="https://www.npmjs.com/package/@mocks-server/plugin-proxy"><img src="https://img.shields.io/npm/dm/@mocks-server/plugin-proxy.svg" alt="Downloads"></a>
  <a href="https://renovatebot.com"><img src="https://img.shields.io/badge/renovate-enabled-brightgreen.svg" alt="Renovate"></a>
  <a href="https://github.com/mocks-server/main/blob/master/packages/plugin-proxy/LICENSE"><img src="https://img.shields.io/npm/l/@mocks-server/plugin-proxy.svg" alt="License"></a>
</p>

---

# Mocks Server Plugin Proxy

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


[website-url]: https://www.mocks-server.org
[main-distribution-url]: https://www.npmjs.com/package/@mocks-server/main
[options-url]: https://www.mocks-server.org/docs/configuration-options
