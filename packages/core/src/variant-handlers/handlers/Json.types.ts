/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { UnknownObject, JSONValue, ScopedCoreInterface } from "../../common/types";
import type {
  VariantHandlerConstructor,
  VariantHandlerInterfaceWithMiddleware,
} from "../VariantHandlers.types";

/** Json response preview */
export interface VariantHandlerJsonPreview {
  /** Response status */
  status: number;
  /** Response body */
  body: JSONValue;
}

export interface VariantHandlerJsonOptions extends MocksServer.VariantHandlerBaseOptions {
  /** Status to send in the response */
  status: number;
  /** JSON Body to send in the response */
  body: JSONValue;
  /** Object containing HTTP headers to send in the response */
  headers?: UnknownObject;
}

declare global {
  //eslint-disable-next-line @typescript-eslint/no-namespace
  namespace MocksServer {
    interface VariantHandlerOptionsByType {
      json: VariantHandlerJsonOptions;
    }
  }
}

/** Creates an interface of a variant handler of type json */
export interface VariantHandlerJsonConstructor extends VariantHandlerConstructor {
  /**
   * Creates an interface of a variant handler of type json
   * @param options - json variant handler options {@link VariantHandlerJsonOptions}
   * @param core - Mocks-server core interface {@link ScopedCoreInterface}
   * @returns Interface of variant handler of type json {@link VariantHandlerJsonInterface}.
   * @example const variantHandlerJson = new VariantHandlerJson({ status: 200, body: {foo: 2} },core);
   */
  new (options: VariantHandlerJsonOptions, core: ScopedCoreInterface): VariantHandlerJsonInterface;
}

/** Json variant handler interface */
export interface VariantHandlerJsonInterface extends VariantHandlerInterfaceWithMiddleware {
  /** Response preview */
  get preview(): VariantHandlerJsonPreview;
}
