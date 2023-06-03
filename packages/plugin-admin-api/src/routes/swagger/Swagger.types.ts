/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { ScopedCoreInterface } from "@mocks-server/core";
import type { Router } from "express";

/** Options for creating a Swagger interface */
export interface SwaggerOptions {
  /** Configuration interface */
  config: ScopedCoreInterface["config"];
}

/** Creates a Swagger interface */
export interface SwaggerConstructor {
  /**
   * Creates a Swagger interface
   * @param options - Swagger options {@link SwaggerOptions}
   * @returns Swagger interface {@link SwaggerInterface}.
   * @example const swaggerInterface = new SwaggerInterface({ config });
   */
  new (options: SwaggerOptions): SwaggerInterface;
}

export interface SwaggerUiOptions {
  /** Version of the API */
  version: string;
  /** Port where the server is running */
  port: number;
  /** Host where the server is running */
  host: string;
  /** Protocol used by the server */
  protocol: string;
}

/** Swagger interface */
export interface SwaggerInterface {
  /**
   * Set current configuration for creating the Swagger UI with the right values
   * @example updateNotifier.init();
   */
  setOptions(options: SwaggerUiOptions): void;

  get router(): Router;
}
