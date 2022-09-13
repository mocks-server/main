import { BaseAdminApiClient } from "./entities";

import type { MocksServerConfig, Id, ApiClientConfig } from "./types";

export class AdminApiClient {
  private _adminApiClient: BaseAdminApiClient;

  constructor() {
    this._adminApiClient = new BaseAdminApiClient();
  }

  readAbout() {
    return this._adminApiClient.about.read();
  }

  readConfig() {
    return this._adminApiClient.config.read();
  }

  updateConfig(newConfig: MocksServerConfig) {
    return this._adminApiClient.config.update(newConfig);
  }

  readAlerts() {
    return this._adminApiClient.alerts.read();
  }

  readAlert(id: Id) {
    return this._adminApiClient.alert(id).read();
  }

  readCollections() {
    return this._adminApiClient.collections.read();
  }

  readCollection(id: Id) {
    return this._adminApiClient.collection(id).read();
  }

  readRoutes() {
    return this._adminApiClient.routes.read();
  }

  readRoute(id: Id) {
    return this._adminApiClient.route(id).read();
  }

  readVariants() {
    return this._adminApiClient.variants.read();
  }

  readVariant(id: Id) {
    return this._adminApiClient.variant(id).read();
  }

  readCustomRouteVariants() {
    return this._adminApiClient.customRouteVariants.read();
  }

  useRouteVariant(id: Id) {
    return this._adminApiClient.customRouteVariants.create({
      id,
    });
  }

  restoreRouteVariants() {
    return this._adminApiClient.customRouteVariants.delete();
  }

  configClient(config: ApiClientConfig) {
    return this._adminApiClient.configClient(config);
  }
}
