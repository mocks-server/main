import type { OptionDefinition, GetOptionValueTypeFromDefinition } from "@mocks-server/config";
import type { ScopedCoreInterface } from "@mocks-server/core";
import type { Request as ExpressRequest, Router } from "express";

/** Express request object with custom properties */
export interface RequestWithId extends ExpressRequest {
  /** Request id, added by the "express-request-id" middleware */
  id?: string;
}

export type PortNumberOptionDefinition = OptionDefinition<number, { hasDefault: true }>;
export type HostOptionDefinition = OptionDefinition<string, { hasDefault: true }>;

export type HttpsProtocolOptionDefinition = OptionDefinition<boolean, { hasDefault: true }>;
export type HttpsCertOptionDefinition = OptionDefinition<string>;
export type HttpsKeyOptionDefinition = OptionDefinition<string>;

//eslint-disable-next-line @typescript-eslint/no-namespace
declare global {
  //eslint-disable-next-line @typescript-eslint/no-namespace
  namespace MocksServer {
    interface PluginsConfig {
      adminApi?: {
        port?: GetOptionValueTypeFromDefinition<PortNumberOptionDefinition>;
        host?: GetOptionValueTypeFromDefinition<HostOptionDefinition>;
        https?: {
          enabled?: GetOptionValueTypeFromDefinition<HttpsProtocolOptionDefinition>;
          cert?: GetOptionValueTypeFromDefinition<HttpsCertOptionDefinition>;
          key?: GetOptionValueTypeFromDefinition<HttpsKeyOptionDefinition>;
        };
      };
    }
  }
}

export interface ServerOptions {
  /** Port where the server is running */
  port: number;
  /** Host where the server is running */
  host: string;
  /** Protocol used by the server */
  protocol: string;
}

export interface OnChangeOptions {
  (options: ServerOptions): void;
}

/** Options for creating a Server interface */
export interface ServerConstructorOptions {
  alerts: ScopedCoreInterface["alerts"];
  logger: ScopedCoreInterface["logger"];
  config: ScopedCoreInterface["config"];
  onChangeOptions: OnChangeOptions;
}

/** Creates a Server interface */
export interface ServerConstructor {
  /**
   * Creates a Server interface
   * @param options - Server options {@link ServerConstructorOptions}
   * @returns Server interface {@link ServerInterface}.
   * @example const serverInterface = new ServerInterface({ config });
   */
  new (options: ServerConstructorOptions): ServerInterface;
}

/** Server interface */
export interface ServerInterface {
  /** Initialize the server */
  init(): void;
  /** Start the server */
  start(): Promise<void>;
  /** Restart the server */
  restart(): Promise<void>;
  /** Stop the server */
  stop(): Promise<void>;
  /** Get the server protocol */
  get protocol(): string;
  /** Get the server url */
  get url(): string;
  /** Add router to the server */
  addRouter(router: ServerRouter): void;
}

/** Server router */
export interface ServerRouter {
  /** Path to mount the router */
  path: string;
  /** Express router */
  router: Router;
}
