import { BaseAdminApiClient } from "./entities";

export class AdminApiClient {
  constructor() {
    this._adminApiClient = new BaseAdminApiClient();
  }

  readAbout() {
    return this._adminApiClient.about.read();
  }

  readConfig() {
    return this._adminApiClient.config.read();
  }

  updateConfig(newConfig) {
    return this._adminApiClient.config.update(newConfig);
  }

  readAlerts() {
    return this._adminApiClient.alerts.read();
  }

  readAlert(id) {
    return this._adminApiClient.alert(id).read();
  }

  readCollections() {
    return this._adminApiClient.collections.read();
  }

  readCollection(id) {
    return this._adminApiClient.collection(id).read();
  }

  readRoutes() {
    return this._adminApiClient.routes.read();
  }

  readRoute(id) {
    return this._adminApiClient.route(id).read();
  }

  readVariants() {
    return this._adminApiClient.variants.read();
  }

  readVariant(id) {
    return this._adminApiClient.variant(id).read();
  }

  readCustomRouteVariants() {
    return this._adminApiClient.customRouteVariants.read();
  }

  useRouteVariant(id) {
    return this._adminApiClient.customRouteVariants.create({
      id,
    });
  }

  restoreRouteVariants() {
    return this._adminApiClient.customRouteVariants.delete();
  }

  configClient(config) {
    return this._adminApiClient.configClient(config);
  }
}

const defaultClient = new AdminApiClient();

export const readAbout = defaultClient.readAbout.bind(defaultClient);

export const readConfig = defaultClient.readConfig.bind(defaultClient);

export const updateConfig = defaultClient.updateConfig.bind(defaultClient);

export const readAlerts = defaultClient.readAlerts.bind(defaultClient);

export const readAlert = defaultClient.readAlert.bind(defaultClient);

export const readCollections = defaultClient.readCollections.bind(defaultClient);

export const readCollection = defaultClient.readCollection.bind(defaultClient);

export const readRoutes = defaultClient.readRoutes.bind(defaultClient);

export const readRoute = defaultClient.readRoute.bind(defaultClient);

export const readVariants = defaultClient.readVariants.bind(defaultClient);

export const readVariant = defaultClient.readVariant.bind(defaultClient);

export const readCustomRouteVariants = defaultClient.readCustomRouteVariants.bind(defaultClient);

export const useRouteVariant = defaultClient.useRouteVariant.bind(defaultClient);

export const restoreRouteVariants = defaultClient.restoreRouteVariants.bind(defaultClient);

export const configClient = defaultClient.configClient.bind(defaultClient);
