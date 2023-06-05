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
export interface VariantHandlerFilePreview {
  /** Response status */
  status: number;
}

/** Options of the Express res.sendFile method. Defined here because Express types define them as any */
export interface VariantHandlerFileOptionsExpress {
  /** Sets the max-age property of the Cache-Control header in milliseconds or a string in ms format */
  maxAge?: number;
  /** Root directory for relative filenames. */
  root?: string;
  /** Sets the Last-Modified header to the last modified date of the file on the OS. Set false to disable it */
  lastModified?: boolean;
  /** Object containing HTTP headers to serve with the file. */
  headers?: UnknownObject;
  /** Option for serving dotfiles. Possible values are “allow”, “deny”, “ignore”.	 */
  dotfiles?: "allow" | "deny" | "ignore";
  /** Enable or disable accepting ranged requests. */
  acceptRanges?: boolean;
  /** Enable or disable setting Cache-Control response header. */
  cacheControl?: boolean;
  /** Enable or disable the immutable directive in the Cache-Control response header. */
  inmutable?: boolean;
}

/** Express.sendFile used internally. Root path is added automatically if not received */
export interface VariantHandlerFileOptionsExpressWithRoot
  extends VariantHandlerFileOptionsExpress {
  /** Root directory for relative filenames. */
  root: string;
}

export interface VariantHandlerFileOptions {
  /** Path to the file to be served */
  path: string;
  /** Response status to send */
  status: number;
  /** Object containing HTTP headers to send in the response */
  headers: UnknownObject;
  /** Options for the express.sendFile method */
  options?: VariantHandlerFileOptionsExpress;
}

declare global {
  //eslint-disable-next-line @typescript-eslint/no-namespace
  namespace MocksServer {
    interface VariantHandlerOptionsByType {
      file: VariantHandlerFileOptions;
    }
  }
}

/** Creates an interface of a variant handler of type file */
export interface VariantHandlerFileConstructor extends VariantHandlerConstructor {
  /**
   * Creates an interface of a variant handler of type file
   * @param options - File variant handler options {@link VariantHandlerFileOptions}
   * @param core - Mocks-server core interface {@link ScopedCoreInterface}
   * @returns Interface of variant handler of type file {@link VariantHandlerFileInterface}.
   * @example const fileVariantHandler = new FileVariantHandler({path: "path/to/file", status: 200}, core);
   */
  new (
    options: VariantHandlerFileOptions & MocksServer.VariantHandlerBaseOptions,
    core: ScopedCoreInterface
  ): VariantHandlerFileInterface;
}

/** File variant handler interface */
export interface VariantHandlerFileInterface extends VariantHandlerInterfaceWithMiddleware {
  /** Response preview */
  get preview(): VariantHandlerFilePreview;
}
