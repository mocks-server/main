/*
Copyright 2019-2022 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { BASE_PATH } = require("@mocks-server/admin-api-paths");

const Root = require("./Root");
const AdminServer = require("./server/Server");
const Swagger = require("./swagger/Swagger");
const Api = require("./Api");

const { PLUGIN_NAME } = require("./support/constants");
const { version } = require("../package.json");

class Plugin {
  static get id() {
    return PLUGIN_NAME;
  }

  constructor({ config, logger, mock, server, alerts, version: coreVersion }) {
    this._server = server;
    this._logger = logger;
    this._config = config;
    this._coreVersion = coreVersion;
    this._alerts = alerts;

    this._adminServer = new AdminServer({
      alerts,
      logger: this._logger.namespace("server"),
      config,
      onChangeOptions: ({ host, port, protocol }) => {
        this._swagger.setOptions({
          version,
          host,
          port,
          protocol,
        });
      },
    });

    // APIS
    this._root = new Root({
      redirectUrl: "/docs",
    });
    this._swagger = new Swagger({ config });

    this._apiRouter = new Api({
      logger: this._logger.namespace("api"),
      config,
      mock,
      alerts,
      coreVersion,
    });

    this._adminServer.addRouter({ path: BASE_PATH, router: this._apiRouter.router });
    this._adminServer.addRouter({ path: "/docs", router: this._swagger.router });
    this._adminServer.addRouter({ path: "/", router: this._root.router });
  }

  init() {
    this._adminServer.init();
  }

  start() {
    return this._adminServer.start();
  }

  stop() {
    return this._adminServer.stop();
  }
}

module.exports = Plugin;
