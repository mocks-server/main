/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { UnknownObject, JSONValue } from "../common/Common.types";
import type { JSONSchema7WithInstanceof } from "../mock/Validations.types";
import type { NextFunction, Request, Response, RequestHandler } from "../server/Server.types";

export type VariantHandlerBaseConstructorOptions = UnknownObject;

/** Response preview */
export interface VariantHandlerResponsePreview {
  /** Response status */
  status?: number;
  /** Response headers */
  headers?: UnknownObject;
  /** Response body */
  body?: string | JSONValue | null;
}

/** Common interface of variant handler constructors */
export interface VariantHandlerBaseConstructor {
  /** Schema for validating options */
  validationSchema: JSONSchema7WithInstanceof;
  /** Static id */
  id: string;
}

/** Common interface of variant handlers. Variant handlers should be created extending this interface */
export interface VariantHandlerBaseInterface {
  /**
   * Returns a preview of the route response. Returns null if it is not possible to preview the response
   * @returns Variant handler response preview {@link VariantHandlerResponsePreview}.
   * @example const preview = route.preview;
   */
  get preview(): VariantHandlerResponsePreview | null;
}

/** Common interface of variant handlers of type middleware. Variant handlers providing a middleware should be created extending this interface */
export interface VariantHandlerBaseInterfaceWithMiddleware extends VariantHandlerBaseInterface {
  /**
   * Express middleware to be executed when the request is received for a route using this variant handler
   * @param req - Express request with some custom properties added by Mocks Server middlewares {@link Request}
   * @param res - Express method for sending a response {@link Response}
   * @param next - Express method for executing next middleware {@link NextFunction}
   */
  middleware(req: Request, res: Response, next: NextFunction): void;
}

/** Common interface of variant handlers of type router. Variant handlers providing a router should be created extending this interface */
export interface VariantHandlerBaseInterfaceWithRouter extends VariantHandlerBaseInterface {
  /**
   * Returns an Express router to be mounted in the route path
   */
  get router(): RequestHandler;
}
