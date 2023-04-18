/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { UnknownObject } from "../../common/CommonTypes";
import type { CoreInterface } from "../../CoreTypes";
import type {
  VariantHandlerBaseConstructorOptions,
  VariantHandlerBaseConstructor,
  VariantHandlerBaseInterfaceWithMiddleware,
} from "../VariantHandlersTypes";

/** Text response preview */
export interface VariantHandlerTextPreview {
  /** Response status */
  status: number;
  /** Response body */
  body: string;
}

export interface VariantHandlerTextOptions extends VariantHandlerBaseConstructorOptions {
  /** Status to send in the response */
  status: number;
  /** Text body to send in the response */
  body: string;
  /** Object containing HTTP headers to send in the response */
  headers?: UnknownObject;
}

/** Creates an interface of a variant handler of type text */
export interface VariantHandlerTextConstructor extends VariantHandlerBaseConstructor {
  /**
   * Creates an interface of a variant handler of type text
   * @param options - text variant handler options {@link VariantHandlerTextOptions}
   * @param core - Mocks-server core interface {@link CoreInterface}
   * @returns Interface of variant handler of type text {@link VariantHandlerTextInterface}.
   * @example const variantHandlerText = new variantHandlerText({ status: 200, body: "foo" }, core);
   */
  new (options: VariantHandlerTextOptions, core: CoreInterface): VariantHandlerTextInterface;
}

/** Json variant handler interface */
export interface VariantHandlerTextInterface extends VariantHandlerBaseInterfaceWithMiddleware {
  /** Response preview */
  get preview(): VariantHandlerTextPreview;
}
