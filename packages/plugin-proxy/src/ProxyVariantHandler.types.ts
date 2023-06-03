import type {
  ScopedCoreInterface,
  VariantHandlerConstructor,
  VariantHandlerInterfaceWithMiddleware,
} from "@mocks-server/core";
import type { Request } from "express";
import type { ProxyOptions } from "express-http-proxy";

/** Proxy response preview */
export type VariantHandlerProxyResponsePreview = null;

export interface VariantHandlerProxyOptions extends MocksServer.VariantHandlerBaseOptions {
  /** Proxy host, or function to get it */
  host: string | ((req: Request) => string);
  /** Response body */
  options: ProxyOptions;
}

declare global {
  //eslint-disable-next-line @typescript-eslint/no-namespace
  namespace MocksServer {
    interface VariantHandlerOptionsByType {
      proxy: VariantHandlerProxyOptions;
    }
  }
}

/** Creates an interface of a variant handler of type proxy */
export interface VariantHandlerProxyConstructor extends VariantHandlerConstructor {
  /**
   * Creates an interface of a variant handler of type proxy
   * @param options - proxy variant handler options {@link VariantHandlerProxyOptions}
   * @param core - Mocks-server core interface {@link ScopedCoreInterface}
   * @returns Interface of variant handler of type proxy {@link VariantHandlerProxyInterface}.
   * @example const variantHandlerProxy = new VariantHandlerProxy({ status: 200, body: {foo: 2} },core);
   */
  new (
    options: VariantHandlerProxyOptions,
    core: ScopedCoreInterface
  ): VariantHandlerProxyInterface;
}

/** Proxy variant handler interface */
export interface VariantHandlerProxyInterface extends VariantHandlerInterfaceWithMiddleware {
  /** Response preview */
  get preview(): VariantHandlerProxyResponsePreview;
}
