/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { CoreInterface } from "../../Core.types";
import type { Request, Response, NextFunction } from "../../server/Server.types";
import type {
  VariantHandlerBaseConstructorOptions,
  VariantHandlerConstructor,
  VariantHandlerInterfaceWithMiddleware,
} from "../VariantHandlers.types";

/** Response preview */
export type VariantHandlerMiddlewarePreview = null;

export interface VariantHandlerMiddlewareOptions extends VariantHandlerBaseConstructorOptions {
  /** Middleware to be executed as request handler */
  middleware: (req: Request, res: Response, next: NextFunction, core: CoreInterface) => void;
}

declare global {
  //eslint-disable-next-line @typescript-eslint/no-namespace
  namespace MocksServer {
    interface VariantHandlerOptionsByType {
      middleware: VariantHandlerMiddlewareOptions;
    }
  }
}

/** Creates an interface of a variant handler of type middleware */
export interface VariantHandlerMiddlewareConstructor extends VariantHandlerConstructor {
  /**
   * Creates an interface of a variant handler of type middleware
   * @param options - Middleware variant handler options {@link VariantHandlerMiddlewareOptions}
   * @param core - Mocks-server core interface {@link CoreInterface}
   * @returns Interface of variant handler of type middleware {@link VariantHandlerMiddlewareInterface}.
   * @example const variantHandlerMiddleware = new VariantHandlerMiddleware({middleware},core);
   */
  new (
    options: VariantHandlerMiddlewareOptions,
    core: CoreInterface
  ): VariantHandlerMiddlewareInterface;
}

/** Middleware variant handler interface */
export interface VariantHandlerMiddlewareInterface extends VariantHandlerInterfaceWithMiddleware {
  /** Response preview */
  get preview(): VariantHandlerMiddlewarePreview;
}
