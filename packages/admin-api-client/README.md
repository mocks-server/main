<p align="center"><a href="https://mocks-server.org" target="_blank" rel="noopener noreferrer"><img width="120" src="https://www.mocks-server.org/img/logo_120.png" alt="Mocks Server logo"></a></p>

<p align="center">
  <a href="https://github.com/mocks-server/main/actions?query=workflow%3Abuild+branch%3Amaster"><img src="https://github.com/mocks-server/main/workflows/build/badge.svg?branch=master" alt="Build Status"></a>
  <a href="https://codecov.io/gh/mocks-server/main"><img src="https://codecov.io/gh/mocks-server/main/branch/master/graph/badge.svg?token=2S8ZR55AJV" alt="Coverage"></a>
  <a href="https://sonarcloud.io/project/overview?id=mocks-server_main_admin-api-client"><img src="https://sonarcloud.io/api/project_badges/measure?project=mocks-server_main_admin-api-client&metric=alert_status" alt="Quality Gate"></a>
  <a href="https://www.npmjs.com/package/@mocks-server/admin-api-client"><img src="https://img.shields.io/npm/dm/@mocks-server/admin-api-client.svg" alt="Downloads"></a>
  <a href="https://renovatebot.com"><img src="https://img.shields.io/badge/renovate-enabled-brightgreen.svg" alt="Renovate"></a>
  <a href="https://github.com/mocks-server/main/blob/master/packages/admin-api-client/LICENSE"><img src="https://img.shields.io/npm/l/@mocks-server/admin-api-client.svg" alt="License"></a>
</p>

---

# Mocks-server administration api client

This package provides an API client for administrating Mocks Server through HTTP requests to the [Admin API plugin][plugin-admin-api-url].

Requests to the Mocks Server administration API are made using [`cross-fetch`](https://www.npmjs.com/package/cross-fetch), which makes this package compatible with browsers and Node.js environments, but, if you are going to build a browser application, you'll probably prefer to use the [`@mocks-server/admin-api-client-data-provider` package](https://www.npmjs.com/package/@mocks-server/admin-api-client-data-provider), which uses [Data Provider](https://www.data-provider.org), and works well with Redux, React, etc.

## Installation

```bash
npm install --save @mocks-server/admin-api-client
```

The UMD build is also available on unpkg. When UMD package is loaded, it creates a `mocksServerAdminApiClient` global object containing all methods and classes.

```html
<script src="https://unpkg.com/@mocks-server/admin-api-paths/dist/index.umd.js"></script>
<script src="https://unpkg.com/@mocks-server/admin-api-client/dist/index.umd.js"></script>
```

> NOTE: The umd distribution is bundled with the `cross-fetch` dependency, but it requires the `@mocks-server/admin-api-paths` dependency to be added separately.

## Usage

Import and create a new `AdminApiClient` class. All methods described in the [Api](#api) return Promises when executed (except the `configClient` method):

```js
import { AdminApiClient } from "@mocks-server/admin-api-client";

const example = async () => {
  const adminApiClient = new AdminApiClient();

  const { version } = await adminApiClient.readAbout();
  console.log(`Current Admin API plugin version is ${versions.adminApi}`);

  const currentConfig = await adminApiClient.readConfig();
  console.log("Current Mocks Server config is", JSON.stringify(currentConfig));

  await adminApiClient.updateConfig({
    mock: {
      collections: {
        selected: "user-super-admin"
      },
      routes: {
        delay: 1000
      },
    },
  });
  console.log("Collection and delay changed");
};

example();
```

## Api

### new AdminApiClient()

Returns an instance containing next methods:

* `readAbout()` - Returns info about the Admin API plugin, such as current version.
* `readConfig()` - Returns current configuration.
* `updateConfig(configObject)` - Updates Mocks Server configuration. A configuration object has to be provided. Read the [Mocks Server configuration docs](https://www.mocks-server.org/docs/configuration/options) for further info.
* `readAlerts()` - Returns array of current alerts.
* `readAlert(alertId)` - Returns an specific alert.
* `readCollections()` - Returns available collections.
* `readCollection(id)` - Returns a collection by ID.
* `readRoutes()` - Returns available routes.
* `readRoute(id)` - Returns a route by ID.
* `readVariants()` - Returns available route variants.
* `readVariant(id)` - Returns a route variant by ID.
* `readCustomRouteVariants()` - Returns current custom route variants of the current collection.
* `useRouteVariant(id)` - Sets a custom route variant to be used by current collection.
* `restoreRouteVariants()` - Restore route variants to those defined in current collection.
* `configClient(clientConfig)` - Changes the client configuration.
  * `clientConfig` _`<Object>`_ - It should be an object containing any of next properties:
    * `port` - _`<Number>`_ - Changes the client port. Default is `3110`.
    * `host` - _`<String>`_ - Changes the client host. Default is `127.0.0.1`.
    * `https` - _`<Boolean>`_ - If `true`, changes the client protocol to "https". Default is `false`.
    * `agent` - _`<http.Agent | https.Agent>`_ - A custom agent can be provided. This is useful in Node.js environments in order to make able to request to https APIs with self-signed certificates ([see example below](#requesting-to-apis-with-https-enabled-and-self-signed-certificate)).

## Configuration

By default, clients are configured to request to `http://127.0.0.1:3110/api`, based in the [default options of Mocks Server Plugin Admin API](https://www.mocks-server.org/docs/configuration/options)

You can change the host, port and protocol of the administration API using the `configClient` method:

```js
import { AdminApiClient } from "@mocks-server/admin-api-client";

const apiClient = new AdminApiClient();
apiClient.configClient({
  host: "localhost",
  port: 3500,
  https: true,
});
```

### Requesting to APIs with https enabled and self-signed certificate

When the administration API is started with https enabled using a self-signed certificate, and the client is used in Node.js, a custom agent can be provided in order to avoid unauthorized rejections:

```js
import https from "https";
import { AdminApiClient } from "@mocks-server/admin-api-client";

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

const apiClient = new AdminApiClient();
apiClient.configClient({
  host: "localhost",
  port: 3500,
  https: true,
  agent: httpsAgent
});
```

## Contributing

Contributors are welcome.
Please read the [contributing guidelines](.github/CONTRIBUTING.md) and [code of conduct](.github/CODE_OF_CONDUCT.md).

[plugin-admin-api-url]: https://github.com/mocks-server/main/blob/master/packages/admin-api-client
