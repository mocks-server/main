import type { BASE_PATH, DEFAULT_PROTOCOL } from "@mocks-server/admin-api-paths";

export interface AnyObject {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface MocksServerConfig {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export interface ApiClientConfig {
  host?: string;
  port?: number;
}

export type Id = string
export type CollectionId = Id;

export type DelayTime = number;
export type RouteVariantId = `${Id}:${Id}`
export type ApiPath = string
export type Url = `${typeof DEFAULT_PROTOCOL}://${ApiClientConfig["host"]}:${ApiClientConfig["port"]}${typeof BASE_PATH}${ApiPath}`
