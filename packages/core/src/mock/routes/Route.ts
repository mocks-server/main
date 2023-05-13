import type { LoggerInterface } from "@mocks-server/logger";

import type { HTTPMethod, RequestHandlerHttpMethod } from "../../server/Server.types";
import type {
  VariantHandlerInterface,
  VariantHandlerResponsePreview,
} from "../../variant-handlers/VariantHandlers.types";
import type {
  RouteDefinitionHTTPMethod,
  RouteDefinitionId,
  RouteDefinitionHTTPValidMethod,
  HTTPMethodId,
} from "../definitions/RouteDefinitions.types";

import type {
  RouteConstructor,
  RouteId,
  RouteInterface,
  RouteOptions,
  RouteInterfaceEnabled,
  RoutePlainObject,
} from "./Route.types";
import { HTTP_METHODS, ALL_HTTP_METHODS_ALIAS, ALL_HTTP_METHODS } from "./RoutesValidator";

export function routeIsEnabled(route: RouteInterface): route is RouteInterfaceEnabled {
  return !route.disabled;
}

function getExpressHttpMethod(method: RouteDefinitionHTTPValidMethod): HTTPMethod {
  return HTTP_METHODS[method.toUpperCase() as HTTPMethodId] as HTTPMethod; // TODO, remove as when HTTP_METHODS is typed
}

function shouldHandleAllMethods(method: RouteDefinitionHTTPMethod): boolean {
  return !method || method === ALL_HTTP_METHODS_ALIAS;
}

function normalizeMethod(method: RouteDefinitionHTTPMethod): RequestHandlerHttpMethod[] {
  if (Array.isArray(method)) {
    return method.map(getExpressHttpMethod);
  }
  return [getExpressHttpMethod(method)];
}

export const Route: RouteConstructor = class Route implements RouteInterface {
  private _id: RouteId;
  private _method: RequestHandlerHttpMethod[];
  private _path: string;
  private _logger: LoggerInterface;
  private _delay: number | null;
  private _disabled: boolean;
  private _handler: VariantHandlerInterface | null;
  private _variantId: MocksServer.VariantDefinitionId;
  private _routeId: RouteDefinitionId;
  private _type: MocksServer.VariantHandlerTypes | null;
  private _preview: VariantHandlerResponsePreview | null;
  private _allMethods: boolean;

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
    this._allMethods = shouldHandleAllMethods(method);
    this._method = this._allMethods ? ALL_HTTP_METHODS : normalizeMethod(method);
    this._path = path;
    this._logger = logger;
    this._delay = delay;
    this._disabled = disabled;
    this._handler = handler || null;
    this._variantId = variantId;
    this._routeId = routeId;
    this._type = type || null;
    this._preview = preview || null;
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

  public get allMethods(): boolean {
    return this._allMethods;
  }

  public get methods(): RequestHandlerHttpMethod[] {
    return this._method;
  }

  public get path(): string {
    return this._path;
  }

  public get url(): string {
    return this._path;
  }

  public get delay(): number | null {
    return this._delay;
  }

  public get disabled(): boolean {
    return this._disabled;
  }

  public get logger(): LoggerInterface {
    return this._logger;
  }

  public get handler(): VariantHandlerInterface | null {
    return this._handler;
  }

  public get type(): MocksServer.VariantHandlerTypes | null {
    return this._type;
  }

  public get preview(): VariantHandlerResponsePreview | null {
    return this._preview;
  }

  public toPlainObject(): RoutePlainObject {
    return {
      id: this._id,
      methods: this._method,
      path: this._path,
      delay: this._delay,
      disabled: this._disabled,
      type: this._type,
      preview: this._preview,
      definition: {
        route: this._routeId,
        variant: this._variantId,
      },
    };
  }
};
