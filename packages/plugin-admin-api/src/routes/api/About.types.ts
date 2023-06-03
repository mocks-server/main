/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { ScopedCoreInterface } from "@mocks-server/core";
import type { Router } from "express";

/** Options for creating an About interface */
export interface AboutOptions {
  /** Logger */
  logger: ScopedCoreInterface["logger"];
  /** Version of Mocks Server core */
  coreVersion: string;
}

/** Creates a About interface */
export interface AboutConstructor {
  /**
   * Creates a About interface
   * @param options - About options {@link AboutOptions}
   * @returns About interface {@link AboutInterface}.
   * @example const AboutInterface = new AboutInterface({ logger, coreVersion });
   */
  new (options: AboutOptions): AboutInterface;
}

/** About interface */
export interface AboutInterface {
  /** Express router for the about path */
  get router(): Router;
}
