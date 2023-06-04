/*
Copyright 2019-2023 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import { BASE_PATH } from "@mocks-server/admin-api-paths";
import type { ScopedCoreInterface, PluginInterface, PluginConstructor } from "@mocks-server/core";

import { readPackageVersion } from "./common/Helpers";
import { Api } from "./routes/api/Api";
import type { ApiInterface } from "./routes/api/Api.types";
import { Root } from "./routes/Root";
import type { RootInterface } from "./routes/Root.types";
import { Swagger } from "./routes/swagger/Swagger";
import type { SwaggerInterface } from "./routes/swagger/Swagger.types";
import { Server } from "./server/Server";
import type { ServerInterface } from "./server/Server.types";
import { PLUGIN_NAME } from "./support/Constants";

export const Plugin: PluginConstructor = class Plugin implements PluginInterface {
  private _version: string;
  private _logger: ScopedCoreInterface["logger"];
  private _server: ServerInterface;
  private _root: RootInterface;
  private _swagger: SwaggerInterface;
  private _apiRouter: ApiInterface;

  constructor({ config, logger, mock, alerts, version: coreVersion }: ScopedCoreInterface) {
    this._version = readPackageVersion();
    this._logger = logger;

    this._server = new Server({
      alerts,
      logger: this._logger.namespace("server"),
      config,
      onChangeOptions: ({ host, port, protocol }) => {
        this._swagger.setOptions({
          version: this._version,
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

    this._server.addRouter({ path: BASE_PATH, router: this._apiRouter.router });
    this._server.addRouter({ path: "/docs", router: this._swagger.router });
    this._server.addRouter({ path: "/", router: this._root.router });
  }

  public static get id() {
    return PLUGIN_NAME;
  }

  public async init() {
    this._server.init();
  }

  public async start() {
    return this._server.start();
  }

  public async stop() {
    return this._server.stop();
  }
};
