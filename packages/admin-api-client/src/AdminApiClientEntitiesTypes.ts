import type https from "https";

import type { BASE_PATH } from "@mocks-server/admin-api-paths";

import type { AnyObject, EntityId } from "./CommonTypes";

/** API path */
export type ApiPath = string;

/** API protocol */
export type Protocol = "http" | "https";

/** API base url */
export type BaseUrl = `${Protocol}://${ApiClientConfig["host"]}:${ApiClientConfig["port"]}`;

/** API url */
export type Url = `${BaseUrl}${typeof BASE_PATH}${ApiPath}`;

/** API response body parsed */
export type ApiResponseBody = undefined | AnyObject;

/** API request body parsed */
export type ApiRequestBody = Partial<AnyObject>;

/** Cross-fetch request options */
export interface CrossFetchOptions extends RequestInit {
  /** Custom agent to be used. Useful in Node.js environments in order to make able to request to https APIs with self-signed certificates */
  agent?: typeof https.Agent;
}

/** ApiClient configuration */
export interface ApiClientConfig extends CrossFetchOptions {
  /** API host */
  host?: string;
  /** API port */
  port?: number;
  /** Use https protocol or not */
  https?: boolean;
}

/** ApiClient constructor */
export interface ApiClientContructor {
  /**
   * Creates an ApiClient
   * @returns ApiClient interface {@link ApiClientInterface}.
   * @example const apiClient = new ApiClient();
   */
  new (): ApiClientInterface;
}

/** ApiClient interface */
export interface ApiClientInterface {
  /**
   * Configurates the API host, port, protocol and agent
   * @param configuration - API client configuration {@link ApiClientConfig}
   * @example apiClient.config({ host: "192.168.1.1", port: 3200, https: true, agent: new https.Agent({ rejectUnauthorized: false })});
   */
  config(configuration: ApiClientConfig): void;
  /**
   * Executes GET method on an API path
   * @param apiPath - API path {@link ApiPath}
   * @returns Promise. Resolved with parsed response body when status is 2x. Otherwise rejected.
   * @example const response = await apiClient.read("/books");
   */
  get(apiPath: ApiPath): Promise<ApiResponseBody>;
  /**
   * Executes PATCH method on an API path
   * @param apiPath - API path {@link ApiPath}
   * @param data - Data to send as request body {@link ApiRequestBody}
   * @returns Promise. Resolved with parsed response body when status is 2x. Otherwise rejected.
   * @example const response = await apiClient.patch("/books/1", {title: "1984"});
   */
  patch(apiPath: ApiPath, data: ApiRequestBody): Promise<ApiResponseBody>;
  /**
   * Executes DELETE method on an API path
   * @param apiPath - API path {@link ApiPath}
   * @returns Promise. Resolved with parsed response body when status is 2x. Otherwise rejected.
   * @example await apiClient.delete("/books/1");
   */
  delete(apiPath: ApiPath): Promise<ApiResponseBody>;
  /**
   * Executes POST method on an API path
   * @param apiPath - API path {@link ApiPath}
   * @param data - Data to send as request body {@link ApiRequestBody}
   * @returns Promise. Resolved with parsed response body when status is 2x. Otherwise rejected.
   * @example const response = await apiClient.create("/books", {title: "1984"});
   */
  post(apiPath: ApiPath, data: ApiRequestBody): Promise<ApiResponseBody>;
}

/** ApiEntity constructor */
export interface ApiEntityContructor {
  /**
   * Creates an Api entity client
   * @returns ApiEntity interface {@link ApiEntityInterface}.
   * @param apiClient - ApiClientInterface instance
   * @param path - API entity path
   * @param id - Id of an specific API entity. When present, it will be added to the path when requesting
   * @example const apiEntity = new ApiEntity(new ApiClient(), "/books", 1);
   */
  new (apiClient: ApiClientInterface, path: ApiPath, id?: EntityId): ApiEntityInterface;
}

/** ApiEntity interface */
export interface ApiEntityInterface {
  /**
   * Executes GET method on the API entity path
   * @returns Promise. Resolved with parsed response body when status is 2x. Otherwise rejected.
   * @example const response = await apiEntity.read();
   */
  read(): Promise<ApiResponseBody>;
  /**
   * Executes PATCH method on the API entity path
   * @param data - Data to send as request body {@link ApiRequestBody}
   * @returns Promise. Resolved with parsed response body when status is 2x. Otherwise rejected.
   * @example const response = await apiEntity.update({ title: "1984" });
   */
  update(data: ApiRequestBody): Promise<ApiResponseBody>;
  /**
   * Executes DELETE method on the API entity path
   * @returns Promise. Resolved with parsed response body when status is 2x. Otherwise rejected.
   * @example await apiEntity.delete();
   */
  delete(): Promise<ApiResponseBody>;
  /**
   * Executes POST method on the API entity path
   * @param data - Data to send as request body {@link ApiRequestBody}
   * @returns Promise. Resolved with parsed response body when status is 2x. Otherwise rejected.
   * @example await apiEntity.create({ title: "1984" });
   */
  create(data: ApiRequestBody): Promise<ApiResponseBody>;
}

/** Admin API entities client constructor */
export interface AdminApiClientEntitiesConstructor {
  /**
   * Creates Admin API entities client
   * @returns Admin API entities client interface {@link AdminApiClientEntitiesInterface}.
   * @example const adminApiEntitiesClient = new AdminApiClientEntities();
   */
  new (): AdminApiClientEntitiesInterface;
}

/** Admin API entities client */
export interface AdminApiClientEntitiesInterface {
  /** About entity API client */
  about: ApiEntityInterface;
  /** Config entity API client */
  config: ApiEntityInterface;
  /** Alerts entity API client */
  alerts: ApiEntityInterface;
  /**
   * Returns API client for an specific Alert entity
   * @param id - Alert Id {@link EntityId}
   * @returns API client for an specific Alert {@link ApiEntityInterface}.
   * @example const alertApiClient = adminApiClientEntities.alert(2);
   */
  alert(id: EntityId): ApiEntityInterface;
  /** Collections API entity client */
  collections: ApiEntityInterface;
  /**
   * Returns API client for an specific Collection entity
   * @param id - Collection Id {@link EntityId}
   * @returns API client for an specific Collection {@link ApiEntityInterface}.
   * @example const collectionApiClient = adminApiClientEntities.collection(2);
   */
  collection(id: EntityId): ApiEntityInterface;
  /** Routes entity API client */
  routes: ApiEntityInterface;
  /**
   * Returns API client for an specific Route entity
   * @param id - Route Id {@link EntityId}
   * @returns API client for an specific Route {@link ApiEntityInterface}.
   * @example const routeApiClient = adminApiClientEntities.route(2);
   */
  route(id: EntityId): ApiEntityInterface;
  /** Variants entity API client */
  variants: ApiEntityInterface;
  /**
   * Returns API client for an specific Variant entity
   * @param id - Variant Id {@link EntityId}
   * @returns API client for an specific Variant {@link ApiEntityInterface}.
   * @example const variantApiClient = adminApiClientEntities.variant(2);
   */
  /** Custom route variants entity API client */
  customRouteVariants: ApiEntityInterface;
  /**
   * Configurates the API client host, port, protocol and agent
   * @param configuration - API client configuration {@link ApiClientConfig}
   * @example adminApiClientEntities.config({ host: "192.168.1.1", port: 3200, https: true, agent: new https.Agent({ rejectUnauthorized: false })});
   */
  configClient(configuration: ApiClientConfig): void;
}
