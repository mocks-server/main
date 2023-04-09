/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { CoreInterface } from "../../CoreTypes";
import type {
  VariantHandlerBaseConstructorOptions,
  VariantHandlerBaseConstructor,
  VariantHandlerBaseInterface,
} from "../VariantHandlersTypes";

export interface VariantHandlerFilePreview {
  status: number;
}

export interface VariantHandlerFileOptions extends VariantHandlerBaseConstructorOptions {
  /** Path to the file to be served */
  path: string;
}

/** Creates a File variant handler interface */
export interface VariantHandlerFileConstructor extends VariantHandlerBaseConstructor {
  /**
   * Creates a File variant handler interface
   * @param options - File variant handler options {@link VariantHandlerFileOptions}
   * @param core - Mocks-server core interface {@link CoreInterface}
   * @returns Interface of variant handler of type file {@link VariantHandlerFileInterface}.
   * @example const fileVariantHandler = new FileVariantHandler();
   */
  new (options: VariantHandlerFileOptions, core: CoreInterface): VariantHandlerFileInterface;
}

/** File variant handler interface */
export interface VariantHandlerFileInterface extends VariantHandlerBaseInterface {
  get preview(): VariantHandlerFilePreview;
}
