import type https = require("https");
import type { BASE_PATH } from "@mocks-server/admin-api-paths";

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
  https?: boolean;
  agent?: typeof https.Agent,
}

export type Id = string
export type CollectionId = Id;

export type Protocol = "http" | "https"
export type DelayTime = number;
export type RouteVariantId = `${Id}:${Id}`
export type ApiPath = string
export type Url = `${Protocol}://${ApiClientConfig["host"]}:${ApiClientConfig["port"]}${typeof BASE_PATH}${ApiPath}`

export interface CrossFetchOptions extends RequestInit {
  agent?: typeof https.Agent,
}
