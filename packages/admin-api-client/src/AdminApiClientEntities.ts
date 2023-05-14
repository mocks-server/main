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
  HTTPS_PROTOCOL,
} from "@mocks-server/admin-api-paths";
import crossFetch from "cross-fetch";

import type {
  Url,
  Protocol,
  CrossFetchOptions,
  ApiPath,
  ApiClientConfig,
  ApiRequestBody,
  ApiClientInterface,
  ApiResponseBody,
  ApiEntityInterface,
  AdminApiClientEntitiesInterface,
  AdminApiClientEntitiesConstructor,
  ApiEntityContructor,
  ApiClientContructor,
} from "./AdminApiClientEntities.types";
import type { EntityId } from "./Common.types";

const JSON_HEADERS = {
  "Content-Type": "application/json",
};

function isUndefined(value: unknown) {
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

const ApiClient: ApiClientContructor = class ApiClient implements ApiClientInterface {
  private _host: ApiClientConfig["host"] = DEFAULT_CLIENT_HOST;
  private _port: ApiClientConfig["port"] = DEFAULT_PORT;
  private _protocol: Protocol = DEFAULT_PROTOCOL;
  private _agent?: ApiClientConfig["agent"];

  get _baseUrl(): Url {
    return `${this._protocol}://${this._host}:${this._port}${BASE_PATH}`;
  }

  private _fullUrl(apiPath: ApiPath): Url {
    return `${this._baseUrl}${apiPath}`;
  }

  private _addAgent(options: CrossFetchOptions = {}): CrossFetchOptions {
    if (this._agent) {
      options.agent = this._agent;
    }
    return options;
  }

  public config(configuration: ApiClientConfig = {}): void {
    if (!isUndefined(configuration.host)) {
      this._host = configuration.host;
    }
    if (!isUndefined(configuration.port)) {
      this._port = configuration.port;
    }
    if (!isUndefined(configuration.https)) {
      this._protocol = configuration.https ? HTTPS_PROTOCOL : DEFAULT_PROTOCOL;
    }
    if (!isUndefined(configuration.agent)) {
      this._agent = configuration.agent;
    }
  }

  public get(apiPath: ApiPath): Promise<ApiResponseBody> {
    return crossFetch(this._fullUrl(apiPath), this._addAgent()).then(handleResponse);
  }

  public patch(apiPath: ApiPath, data: ApiRequestBody): Promise<ApiResponseBody> {
    return crossFetch(
      this._fullUrl(apiPath),
      this._addAgent({
        method: "PATCH",
        body: JSON.stringify(data),
        headers: JSON_HEADERS,
      })
    ).then(handleResponse);
  }

  public delete(apiPath: ApiPath): Promise<ApiResponseBody> {
    return crossFetch(
      this._fullUrl(apiPath),
      this._addAgent({
        method: "DELETE",
      })
    ).then(handleResponse);
  }

  public post(apiPath: ApiPath, data: ApiRequestBody): Promise<ApiResponseBody> {
    return crossFetch(
      this._fullUrl(apiPath),
      this._addAgent({
        method: "POST",
        body: JSON.stringify(data),
        headers: JSON_HEADERS,
      })
    ).then(handleResponse);
  }
};

const ApiEntity: ApiEntityContructor = class ApiEntity implements ApiEntityInterface {
  private _path: ApiPath;
  private _id: EntityId;
  private _apiClient: ApiClientInterface;

  constructor(apiClient: ApiClientInterface, path: ApiPath, id?: EntityId) {
    this._path = path;
    this._id = id ? `/${encodeURIComponent(id)}` : "";
    this._apiClient = apiClient;
  }

  private get _fullApiPath() {
    return `${this._path}${this._id}`;
  }

  public read(): Promise<ApiResponseBody> {
    return this._apiClient.get(this._fullApiPath);
  }

  public update(data: ApiRequestBody): Promise<ApiResponseBody> {
    return this._apiClient.patch(this._fullApiPath, data);
  }

  public delete(): Promise<ApiResponseBody> {
    return this._apiClient.delete(this._fullApiPath);
  }

  public create(data: ApiRequestBody): Promise<ApiResponseBody> {
    return this._apiClient.post(this._fullApiPath, data);
  }
};

export const AdminApiClientEntities: AdminApiClientEntitiesConstructor = class AdminApiClientEntities
  implements AdminApiClientEntitiesInterface
{
  private _apiClient: ApiClientInterface;
  private _about: ApiEntityInterface;
  private _config: ApiEntityInterface;
  private _alerts: ApiEntityInterface;
  private _collections: ApiEntityInterface;
  private _routes: ApiEntityInterface;
  private _variants: ApiEntityInterface;
  private _customRouteVariants: ApiEntityInterface;

  constructor() {
    this._apiClient = new ApiClient();

    this._about = new ApiEntity(this._apiClient, ABOUT);
    this._config = new ApiEntity(this._apiClient, CONFIG);
    this._alerts = new ApiEntity(this._apiClient, ALERTS);
    this._collections = new ApiEntity(this._apiClient, COLLECTIONS);
    this._routes = new ApiEntity(this._apiClient, ROUTES);
    this._variants = new ApiEntity(this._apiClient, VARIANTS);
    this._customRouteVariants = new ApiEntity(this._apiClient, CUSTOM_ROUTE_VARIANTS);
  }

  public get about(): ApiEntityInterface {
    return this._about;
  }

  public get config(): ApiEntityInterface {
    return this._config;
  }

  public get alerts(): ApiEntityInterface {
    return this._alerts;
  }

  public alert(id: EntityId): ApiEntityInterface {
    return new ApiEntity(this._apiClient, ALERTS, id);
  }

  public get collections(): ApiEntityInterface {
    return this._collections;
  }

  public collection(id: EntityId): ApiEntityInterface {
    return new ApiEntity(this._apiClient, COLLECTIONS, id);
  }

  public get routes(): ApiEntityInterface {
    return this._routes;
  }

  public route(id: EntityId): ApiEntityInterface {
    return new ApiEntity(this._apiClient, ROUTES, id);
  }

  public get variants(): ApiEntityInterface {
    return this._variants;
  }

  public variant(id: EntityId): ApiEntityInterface {
    return new ApiEntity(this._apiClient, VARIANTS, id);
  }

  public get customRouteVariants(): ApiEntityInterface {
    return this._customRouteVariants;
  }

  public configClient(configuration: ApiClientConfig): void {
    this._apiClient.config(configuration);
  }
};
