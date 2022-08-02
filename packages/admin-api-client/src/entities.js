import crossFetch from "cross-fetch";

import {
  BASE_PATH,
  CONFIG,
  ABOUT,
  ALERTS,
  COLLECTIONS,
  ROUTES,
  VARIANTS,
  CUSTOM_ROUTE_VARIANTS,
  DEFAULT_PORT,
  DEFAULT_CLIENT_HOST,
} from "@mocks-server/admin-api-paths";

function isUndefined(value) {
  return typeof value === "undefined";
}

function handleResponse(res) {
  if (res.status > 199 && res.status < 300) {
    return res.json().catch(() => Promise.resolve());
  }
  return res.json().then((data) => {
    return Promise.reject(new Error(data.message));
  });
}

class ApiClient {
  constructor() {
    this._host = DEFAULT_CLIENT_HOST;
    this._port = DEFAULT_PORT;
  }

  get _baseUrl() {
    return `http://${this._host}:${this._port}${BASE_PATH}`;
  }

  fullUrl(url) {
    return `${this._baseUrl}${url}`;
  }

  config(configuration = {}) {
    if (!isUndefined(configuration.host)) {
      this._host = configuration.host;
    }
    if (!isUndefined(configuration.port)) {
      this._port = configuration.port;
    }
  }

  read(url) {
    return crossFetch(this.fullUrl(url)).then(handleResponse);
  }

  patch(url, data) {
    return crossFetch(this.fullUrl(url), {
      method: "PATCH",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    }).then(handleResponse);
  }

  delete(url) {
    return crossFetch(this.fullUrl(url), {
      method: "DELETE",
    }).then(handleResponse);
  }

  create(url, data) {
    return crossFetch(this.fullUrl(url), {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    }).then(handleResponse);
  }
}

class ApiResource {
  constructor(apiClient, url, id) {
    this._url = url;
    this._id = id ? `/${encodeURIComponent(id)}` : "";
    this._apiClient = apiClient;
  }

  get url() {
    return `${this._url}${this._id}`;
  }

  read() {
    return this._apiClient.read(this.url);
  }

  update(data) {
    return this._apiClient.patch(this.url, data);
  }

  delete() {
    return this._apiClient.delete(this.url);
  }

  create(data) {
    return this._apiClient.create(this.url, data);
  }
}

export class BaseAdminApiClient {
  constructor() {
    this._apiClient = new ApiClient();

    this._about = new ApiResource(this._apiClient, ABOUT);
    this._config = new ApiResource(this._apiClient, CONFIG);
    this._alerts = new ApiResource(this._apiClient, ALERTS);
    this._collections = new ApiResource(this._apiClient, COLLECTIONS);
    this._routes = new ApiResource(this._apiClient, ROUTES);
    this._variants = new ApiResource(this._apiClient, VARIANTS);
    this._customRouteVariants = new ApiResource(this._apiClient, CUSTOM_ROUTE_VARIANTS);
  }

  get about() {
    return this._about;
  }

  get config() {
    return this._config;
  }

  get alerts() {
    return this._alerts;
  }

  alert(id) {
    return new ApiResource(this._apiClient, ALERTS, id);
  }

  get collections() {
    return this._collections;
  }

  collection(id) {
    return new ApiResource(this._apiClient, COLLECTIONS, id);
  }

  get routes() {
    return this._routes;
  }

  route(id) {
    return new ApiResource(this._apiClient, ROUTES, id);
  }

  get variants() {
    return this._variants;
  }

  variant(id) {
    return new ApiResource(this._apiClient, VARIANTS, id);
  }

  get customRouteVariants() {
    return this._customRouteVariants;
  }

  configClient(configuration) {
    this._apiClient.config(configuration);
  }
}
