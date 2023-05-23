/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { UnknownObject, ScopedCoreInterface } from "../../common/types";
import type {
  VariantHandlerConstructor,
  VariantHandlerInterfaceWithMiddleware,
} from "../VariantHandlers.types";

/** Response preview */
export interface VariantHandlerStatusPreview {
  /** Response status */
  status: number;
}

export interface VariantHandlerStatusOptions extends MocksServer.VariantHandlerBaseOptions {
  /** Status to send in the response */
  status: number;
  /** Object containing HTTP headers to send in the response */
  headers?: UnknownObject;
}

declare global {
  //eslint-disable-next-line @typescript-eslint/no-namespace
  namespace MocksServer {
    interface VariantHandlerOptionsByType {
      status: VariantHandlerStatusOptions;
    }
  }
}

/** Creates an interface of a variant handler of type status */
export interface VariantHandlerStatusConstructor extends VariantHandlerConstructor {
  /**
   * Creates an interface of a variant handler of type status
   * @param options - Status variant handler options {@link VariantHandlerStatusOptions}
   * @param core - Mocks-server core interface {@link ScopedCoreInterface}
   * @returns Interface of variant handler of type middleware {@link VariantHandlerStatusInterface}.
   * @example const variantHandlerStatus = new VariantHandlerStatus({status:200},core);
   */
  new (
    options: VariantHandlerStatusOptions,
    core: ScopedCoreInterface
  ): VariantHandlerStatusInterface;
}

/** Status variant handler interface */
export interface VariantHandlerStatusInterface extends VariantHandlerInterfaceWithMiddleware {
  /** Response preview */
  get preview(): VariantHandlerStatusPreview;
}
