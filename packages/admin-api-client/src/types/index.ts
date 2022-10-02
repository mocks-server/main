/* eslint-disable @typescript-eslint/no-namespace */

import type {
  AdminApiClientInterface as _AdminApiClientInterface,
  AdminApiClientConstructor as _AdminApiClientConstructor,
} from './AdminApiClient';

import type {
  ApiResponseBody as _ApiResponseBody,
  ApiClientConfig as _ApiClientConfig,
  
} from './AdminApiClientEntities';

import type { EntityId as _EntityId } from "./Common";

export namespace ApiClient {
  export type ResponseBody = _ApiResponseBody;
  export type Config = _ApiClientConfig;
  export type EntityId = _EntityId;

  export type Interface = _AdminApiClientInterface;
  export type Constructor = _AdminApiClientConstructor;  
}
