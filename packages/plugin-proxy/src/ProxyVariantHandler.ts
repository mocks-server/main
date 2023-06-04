import type {
  ScopedCoreInterface,
  JSONSchema7WithInstanceof,
  Request,
  Response,
} from "@mocks-server/core";
import type { NextFunction } from "express";
import httpProxy from "express-http-proxy";
import type { ProxyOptions } from "express-http-proxy";

import type {
  VariantHandlerProxyConstructor,
  VariantHandlerProxyInterface,
  VariantHandlerProxyOptions,
  VariantHandlerProxyResponsePreview,
} from "./ProxyVariantHandler.types";

export const ProxyVariantHandler: VariantHandlerProxyConstructor = class ProxyVariantHandler
  implements VariantHandlerProxyInterface
{
  private _options: VariantHandlerProxyOptions;
  private _logger: ScopedCoreInterface["logger"];
  private _host: VariantHandlerProxyOptions["host"];
  private _optionsProxy: ProxyOptions;
  private _middleware: ReturnType<typeof httpProxy>;

  constructor(options: VariantHandlerProxyOptions, core: ScopedCoreInterface) {
    this._options = options;
    this._logger = core.logger;
    this._host = this._options.host;
    this._optionsProxy = this._options.options;
    this._middleware = httpProxy(this._host, this._optionsProxy);
  }

  public static get id(): string {
    return "proxy";
  }

  public static get validationSchema(): JSONSchema7WithInstanceof {
    return {
      type: "object",
      properties: {
        host: {
          oneOf: [
            {
              type: "string",
            },
            {
              instanceof: "Function",
            },
          ],
        },
        options: {
          type: "object",
        },
      },
      required: ["host"],
    };
  }

  public get preview(): VariantHandlerProxyResponsePreview {
    return null;
  }

  public middleware(req: Request, res: Response, next: NextFunction): void {
    const host = this._host instanceof Function ? this._host(req) : this._host;
    this._logger.verbose(`Proxy redirecting request to ${host} | req: ${req.id}`);
    this._middleware(req, res, next);
  }
};
