/* eslint-disable @typescript-eslint/no-namespace */
import "./Cypress"

import type {
  AdminApiClientInterface as _AdminApiClientInterface,
  AdminApiClientConstructor as _AdminApiClientConstructor,
  AdminApiClientConfig as _AdminApiClientConfig,
} from './AdminApiClient';

export namespace ApiClient {
  export type Config = _AdminApiClientConfig;
  export type Interface = _AdminApiClientInterface;
  export type Constructor = _AdminApiClientConstructor;  
}
