import crossFetch from "cross-fetch";
import type { Response } from "cross-fetch";
import type { AnyObject, ApiClientConfig, Url, ApiPath, Id } from "./types";

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
  DEFAULT_PROTOCOL,
} from "@mocks-server/admin-api-paths";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isUndefined(value: any) {
  return typeof value === "undefined";
}

function handleResponse(res: Response) {
  if (res.status > 199 && res.status < 300) {
    return res.json().catch(() => Promise.resolve());
  }
  return res.json().then((data) => {
    return Promise.reject(new Error(data.message));
  });
}

class ApiClient {
  private _host: ApiClientConfig["host"] = DEFAULT_CLIENT_HOST;
  private _port: ApiClientConfig["port"] = DEFAULT_PORT;

  get _baseUrl(): Url {
    return `${DEFAULT_PROTOCOL}://${this._host}:${this._port}${BASE_PATH}`;
  }

  private _fullUrl(apiPath: ApiPath): Url {
    return `${this._baseUrl}${apiPath}`;
  }

  public config(configuration: ApiClientConfig = {}) {
    if (!isUndefined(configuration.host)) {
      this._host = configuration.host;
    }
    if (!isUndefined(configuration.port)) {
      this._port = configuration.port;
    }
  }

  public read(apiPath: ApiPath) {
    return crossFetch(this._fullUrl(apiPath)).then(handleResponse);
  }

  public patch(apiPath: ApiPath, data: AnyObject) {
    return crossFetch(this._fullUrl(apiPath), {
      method: "PATCH",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    }).then(handleResponse);
  }

  public delete(apiPath: ApiPath) {
    return crossFetch(this._fullUrl(apiPath), {
      method: "DELETE",
    }).then(handleResponse);
  }

  public create(apiPath: ApiPath, data: AnyObject) {
    return crossFetch(this._fullUrl(apiPath), {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    }).then(handleResponse);
  }
}

class ApiResource {
  private _apiPath: ApiPath;
  private _id: Id;
  private _apiClient: ApiClient;

  constructor(apiClient: ApiClient, apiPath: ApiPath, id?: Id) {
    this._apiPath = apiPath;
    this._id = id ? `/${encodeURIComponent(id)}` : "";
    this._apiClient = apiClient;
  }

  private get _fullApiPath() {
    return `${this._apiPath}${this._id}`;
  }

  public read() {
    return this._apiClient.read(this._fullApiPath);
  }

  public update(data: AnyObject) {
    return this._apiClient.patch(this._fullApiPath, data);
  }

  public delete() {
    return this._apiClient.delete(this._fullApiPath);
  }

  public create(data: AnyObject) {
    return this._apiClient.create(this._fullApiPath, data);
  }
}

export class BaseAdminApiClient {
  private _apiClient: ApiClient;
  private _about: ApiResource;
  private _config: ApiResource;
  private _alerts: ApiResource;
  private _collections: ApiResource;
  private _routes: ApiResource;
  private _variants: ApiResource;
  private _customRouteVariants: ApiResource;

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

  public get about() {
    return this._about;
  }

  public get config() {
    return this._config;
  }

  public get alerts() {
    return this._alerts;
  }

  public alert(id: Id) {
    return new ApiResource(this._apiClient, ALERTS, id);
  }

  public get collections() {
    return this._collections;
  }

  public collection(id: Id) {
    return new ApiResource(this._apiClient, COLLECTIONS, id);
  }

  public get routes() {
    return this._routes;
  }

  public route(id: Id) {
    return new ApiResource(this._apiClient, ROUTES, id);
  }

  public get variants() {
    return this._variants;
  }

  public variant(id: Id) {
    return new ApiResource(this._apiClient, VARIANTS, id);
  }

  public get customRouteVariants() {
    return this._customRouteVariants;
  }

  public configClient(configuration: ApiClientConfig) {
    this._apiClient.config(configuration);
  }
}
