import type { ConfigInterface } from "@mocks-server/config";
import type { LoggerInterface } from "@mocks-server/logger";
import type {
  NextFunction as ExpressNextFunction,
  Request as ExpressRequest,
  Response as ExpressResponse,
  RequestHandler as ExpressRequestHandler,
  ErrorRequestHandler as ExpressErrorRequestHandler,
  Router as ExpressRouter,
} from "express";

import type { AlertsInterface } from "../alerts/Alerts.types";

export type AllHttpMethods = "all";

export type HTTPMethod =
  | "get"
  | "post"
  | "patch"
  | "delete"
  | "put"
  | "options"
  | "head"
  | "trace";

export type RequestHandlerHttpMethod = HTTPMethod | AllHttpMethods;

export type ProtocolHttps = "https";
export type ProtocolHttp = "http";

/** Express next function */
export type NextFunction = ExpressNextFunction;

/** Express response method with custom properties */
export type Response = ExpressResponse;

/** Express request object with custom properties */
export interface Request extends ExpressRequest {
  /** Request id, added by the "express-request-id" middleware */
  id?: string;
}

/** Express request handler */
export interface RequestHandler extends ExpressRequestHandler {
  (req: Request, res: Response, next: NextFunction): void;
}

export type Router = ExpressRouter;

/** Custom express router to be mounted on a path */
export interface CustomRouter {
  /** Path where the router will be mounted */
  path: string;
  /** Express router */
  router: Router;
}

/** Express error request handler */
export interface ErrorRequestHandler extends ExpressErrorRequestHandler {
  (error: Error, req: Request, res: Response, next: NextFunction): void;
}

/** Options for creating a Server interface */
export interface ServerOptions {
  /** Config interface */
  config: ConfigInterface;
  /** Alerts interface */
  alerts: AlertsInterface;
  /** Logger interface */
  logger: LoggerInterface;
  /** Express router containing mock routes */
  mockRouter: Router;
}

/** Creates a Server interface */
export interface ServerConstructor {
  /** Unique id for Server class */
  get id(): string;
  /**
   * Creates a server interface interface
   * @param options - Server options {@link ServerOptions}
   * @returns ServerInterface interface {@link ServerInterface}.
   * @example const server = new Server({ config, alerts, logger, mockRouter });
   */
  new (options: ServerOptions): ServerInterface;
}

/** Server interface */
export interface ServerInterface {
  /**
   * Initialize the server. Listen to process exit signal to stop server before exiting
   * @example await server.init();
   */
  init(): Promise<void>;
  /**
   * Stop the server
   * @example await server.stop();
   */
  stop(): Promise<void>;
  /**
   * Start the server
   * @example await server.start();
   */
  start(): Promise<void>;
  /**
   * Restart the server
   * @example await server.restart();
   */
  restart(): Promise<void>;
  /**
   * Add a custom router to the express app
   * @example await server.addRouter("/custom", expressRouter);
   */
  addRouter(path: string, router: Router): Promise<void>;
  /**
   * Remove a custom router from the express app. The path must be the same as the one used to add the router
   * @example await server.removeRouter("/custom", expressRouter);
   */
  removeRouter(path: string, router: Router): Promise<void>;
  /**
   * Returns the protocol currently used by the server
   * @returns "https" or "http"
   */
  get protocol(): ProtocolHttp | ProtocolHttps;
  /**
   * Returns the server url, including the protocol and the port
   * @returns Server url
   * @example http://localhost:3000
   */
  get url(): string;
}
