/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { Router } from "express";

/** Options for creating a Root interface */
export interface RootOptions {
  /** Url to redirect requests to root path */
  redirectUrl: string;
}

/** Creates a Root interface */
export interface RootConstructor {
  /**
   * Creates a Root interface
   * @param options - Root options {@link RootOptions}
   * @returns Root interface {@link RootInterface}.
   * @example const rootInterface = new RootInterface({ redirectUrl });
   */
  new (options: RootOptions): RootInterface;
}

/** Root interface */
export interface RootInterface {
  get router(): Router;
}
