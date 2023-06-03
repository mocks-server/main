/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { ScopedCoreInterface } from "@mocks-server/core";
import type { Router } from "express";

/** Options for creating an CustomRouteVariants interface */
export interface CustomRouteVariantsOptions {
  /** Logger */
  logger: ScopedCoreInterface["logger"];
  /** Mocks server mock interface */
  mock: ScopedCoreInterface["mock"];
}

/** Creates a CustomRouteVariants interface */
export interface CustomRouteVariantsConstructor {
  /**
   * Creates a CustomRouteVariants interface
   * @param options - CustomRouteVariants options {@link CustomRouteVariantsOptions}
   * @returns CustomRouteVariants interface {@link CustomRouteVariantsInterface}.
   * @example const CustomRouteVariantsInterface = new CustomRouteVariantsInterface({ logger, mock });
   */
  new (options: CustomRouteVariantsOptions): CustomRouteVariantsInterface;
}

/** CustomRouteVariants interface */
export interface CustomRouteVariantsInterface {
  /** Express router for the alerts path */
  get router(): Router;
}
