/* eslint-disable @typescript-eslint/no-namespace */

import type {
  AdminApiClientInterface as _AdminApiClientInterface,
  AdminApiClientConstructor as _AdminApiClientConstructor,
} from './AdminApiClient';

import type {
  ApiResponseBody as _ApiResponseBody,
  ApiClientConfig as _ApiClientConfig,
  Protocol as _Protocol,
  Url as _Url,
  BaseUrl as _BaseUrl
} from './AdminApiClientEntities';

import type { EntityId as _EntityId } from "./Common";

export namespace ApiClient {
  export type ResponseBody = _ApiResponseBody;
  export type Config = _ApiClientConfig;
  export type EntityId = _EntityId;
  export type Protocol = _Protocol;
  export type BaseUrl = _BaseUrl;
  export type Url = _Url;

  export type Interface = _AdminApiClientInterface;
  export type Constructor = _AdminApiClientConstructor;  
}
