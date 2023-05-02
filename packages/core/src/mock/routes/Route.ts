import type { LoggerInterface } from "@mocks-server/logger";

import type {
  VariantHandlerInterface,
  VariantHandlerResponsePreview,
} from "../../variant-handlers/VariantHandlers.types";

import type {
  RouteConstructor,
  RouteId,
  RouteInterface,
  RouteOptions,
  RouteDefinitionHTTPMethod,
  RouteInterfaceEnabled,
  RouteDefinitionId,
} from "./Route.types";

export function routeIsEnabled(route: RouteInterface): route is RouteInterfaceEnabled {
  return !route.disabled;
}

export const Route: RouteConstructor = class Route implements RouteInterface {
  private _id: RouteId;
  private _method: RouteDefinitionHTTPMethod;
  private _path: string;
  private _logger: LoggerInterface;
  private _delay?: number | null;
  private _disabled: boolean;
  private _handler?: VariantHandlerInterface;
  private _variantId: MocksServer.VariantDefinitionId;
  private _routeId: RouteDefinitionId;
  private _type?: MocksServer.VariantHandlerTypes;
  private _preview?: VariantHandlerResponsePreview | null;

  constructor({
    id,
    method,
    path,
    logger,
    delay,
    disabled,
    handler,
    variantId,
    routeId,
    type,
    preview,
  }: RouteOptions) {
    this._id = id;
    this._method = method;
    this._path = path;
    this._logger = logger;
    this._delay = delay;
    this._disabled = disabled;
    this._handler = handler;
    this._variantId = variantId;
    this._routeId = routeId;
    this._type = type;
    this._preview = preview;
  }

  public get id(): RouteId {
    return this._id;
  }

  public get variantId(): MocksServer.VariantDefinitionId {
    return this._variantId;
  }

  public get routeId(): RouteDefinitionId {
    return this._routeId;
  }

  public get method(): RouteDefinitionHTTPMethod {
    return this._method;
  }

  public get path(): string {
    return this._path;
  }

  public get url(): string {
    return this._path;
  }

  public get delay(): undefined | number | null {
    return this._delay;
  }

  public get disabled(): boolean {
    return this._disabled;
  }

  public get logger(): LoggerInterface {
    return this._logger;
  }

  public get handler(): VariantHandlerInterface | undefined {
    return this._handler;
  }

  public get type(): MocksServer.VariantHandlerTypes | undefined {
    return this._type;
  }

  public get preview(): VariantHandlerResponsePreview | undefined | null {
    return this._preview;
  }
};
