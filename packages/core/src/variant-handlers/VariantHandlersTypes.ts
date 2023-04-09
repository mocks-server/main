/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { UnknownObject } from "../common/CommonTypes";

export type VariantHandlerBaseConstructorOptions = UnknownObject;

export interface VariantHandlerResponsePreview {
  status?: number;
  headers?: UnknownObject;
  body?: UnknownObject | string | null;
}

/** Common interface of variant handler constructors */
export interface VariantHandlerBaseConstructor {
  /**
   * Static id
   */
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
