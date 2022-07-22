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

Plugin for [Mocks Server][website-url] that provides a [variant handler](https://www.mocks-server.org/docs/variant-handlers/intro) that proxy requests to another host and pass response back to original caller.

It uses the [express-http-proxy](https://github.com/villadora/express-http-proxy) package under the hood, and supports all of its options.

> Important: From v3.0.0, this plugin includes two route handlers: `proxy` and `proxy-v4`. This was made to allow Mocks Server v3 users to progressively adapt their code to Mocks Server v4 without breaking changes. It is strongly recommended to use the `proxy-v4` handler. In the next major release, backward compatibilty will be removed and the `proxy` handler will be replaced by `proxy-v4`.

## Usage of `proxy-v4` handler

This plugin is included in the [main distribution of the Mocks Server project][main-distribution-url], so you can also read the [official documentation website][website-url].

### Proxy routes

If you want a [route variant](https://www.mocks-server.org/docs/usage/variants) to use the `proxy-v4` handler, define its `handler` property as "proxy-v4". Use the `host` property to set the host for the route, and the `options` property to set any of the [express-http-proxy](https://github.com/villadora/express-http-proxy) options.

```js
module.exports = [
  {
    id: "proxy-all",
    url: "*",
    method: ["GET", "POST", "PATCH", "PUT"],
    variants: [
      {
        id: "proxy-to-google",
        type: "proxy-v4", // This route variant will use the "proxy" handler from this plugin
        options: {
          host: "https://www.google.com", // proxy host
          options: {}, // Options for express-http-proxy
        },
      },
    ],
  },
];
```

### Options

Here are listed the specific properties that can be defined in a `proxy-v4` route variant. They must be defined in the `options` property of the variant:

* __`host`__ _(String|Function)_: The proxy host. Equivalent to the [`express-http-proxy` `host` option](https://github.com/villadora/express-http-proxy#host), so it can also be a function.
* __`options`__ _(Object)_: Object containing any of the [options supported by the `express-http-proxy` package](https://github.com/villadora/express-http-proxy#options). Some of them are:
  * __filter__ _(Function)_: [`filter` option](https://github.com/villadora/express-http-proxy#filter-supports-promises) for `express-http-proxy`.
  * __userResDecorator__ _(Function)_: [`userResDecorator` option](https://github.com/villadora/express-http-proxy#userresdecorator-was-intercept-supports-promise) for `express-http-proxy`.
  * __...__ all other [`express-http-proxy` options](https://github.com/villadora/express-http-proxy#options) are also supported.

> Tip: Note that the variant `delay` option is still valid for routes handled by this plugin, so you can use it to simulate that host responses are slow.

## Usage of `proxy` handler

### Proxy routes

If you want a Mocks Server v3 [route variant](https://www.mocks-server.org/docs/usage/variants) to use the `proxy` handler, define its `type` property as "proxy". Use the `host` property to set the host for the route, and the `options` property to set any of the [express-http-proxy](https://github.com/villadora/express-http-proxy) options.

```js
module.exports = [
  {
    id: "proxy-all",
    url: "*",
    method: ["GET", "POST", "PATCH", "PUT"],
    variants: [
      {
        id: "proxy-to-google",
        type: "proxy", // This route variant will use the "proxy" handler from this plugin
        host: "https://www.google.com", // proxy host
        options: {}, // Options for express-http-proxy
      },
    ],
  },
];
```

### Route variant options

Mocks server common properties to all route handlers are in _cursive_. Specific properties of this plugin are in __bold__:

* __`host`__ _(String|Function)_: The proxy host. Equivalent to the [`express-http-proxy` `host` option](https://github.com/villadora/express-http-proxy#host), so it can also be a function.
* __`options`__ _(Object)_: Object containing any of the [options supported by the `express-http-proxy` package](https://github.com/villadora/express-http-proxy#options). Some of them are:
  * __filter__ _(Function)_: [`filter` option](https://github.com/villadora/express-http-proxy#filter-supports-promises) for `express-http-proxy`.
  * __userResDecorator__ _(Function)_: [`userResDecorator` option](https://github.com/villadora/express-http-proxy#userresdecorator-was-intercept-supports-promise) for `express-http-proxy`.
  * __...__ all other [`express-http-proxy` options](https://github.com/villadora/express-http-proxy#options) are also supported.

> Tip: Note that the `delay` option is still valid for routes handled by this plugin, so you can use it to simulate that host responses are slow.

[website-url]: https://www.mocks-server.org
[main-distribution-url]: https://www.npmjs.com/package/@mocks-server/main
[options-url]: https://www.mocks-server.org/docs/configuration/options
