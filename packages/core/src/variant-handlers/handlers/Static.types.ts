/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { ServeStaticOptions } from "serve-static";

import type { UnknownObject, ScopedCoreInterface } from "../../common/types";

import type {
  VariantHandlerConstructor,
  VariantHandlerInterfaceWithRouter,
} from "../VariantHandlers.types";

/** Response preview */
export type VariantHandlerStaticPreview = null;

export interface VariantHandlerStaticOptions {
  /** Path of the folder to be served. It can be a relative path from process.cwd, or an absolute path. */
  path: string;
  /** Object containing headers to set in the response of all static assets */
  headers?: UnknownObject;
  /** Object containing any of the available express.static method options */
  options?: ServeStaticOptions;
}

declare global {
  //eslint-disable-next-line @typescript-eslint/no-namespace
  namespace MocksServer {
    interface VariantHandlerOptionsByType {
      static: VariantHandlerStaticOptions;
    }
  }
}

/** Creates an interface of a variant handler of type static */
export interface VariantHandlerStaticConstructor extends VariantHandlerConstructor {
  /**
   * Creates an interface of a variant handler of type status
   * @param options - Static variant handler options {@link VariantHandlerStaticOptions}
   * @param core - Mocks-server core interface {@link ScopedCoreInterface}
   * @returns Interface of variant handler of type static {@link VariantHandlerStaticInterface}.
   * @example const variantHandlerStatus = new VariantHandlerStatus({status:200},core);
   */
  new (
    options: VariantHandlerStaticOptions & MocksServer.VariantHandlerBaseOptions,
    core: ScopedCoreInterface
  ): VariantHandlerStaticInterface;
}

/** Status variant handler interface */
export interface VariantHandlerStaticInterface extends VariantHandlerInterfaceWithRouter {
  /** Response preview */
  get preview(): VariantHandlerStaticPreview;
}
