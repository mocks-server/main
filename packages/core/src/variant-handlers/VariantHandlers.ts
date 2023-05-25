/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/
import type { ConfigNamespaceInterface, OptionInterfaceOfType } from "@mocks-server/config";
import type { LoggerInterface } from "@mocks-server/logger";

import {
  VariantHandlerFile,
  VariantHandlerJson,
  VariantHandlerMiddleware,
  VariantHandlerStatic,
  VariantHandlerStatus,
  VariantHandlerText,
} from "./handlers";
import type {
  VariantHandlerConstructor,
  VariantHandlersConstructor,
  VariantHandlersInterface,
  VariantHandlersOptionDefinition,
  VariantHandlersOptions,
} from "./types";

const OPTIONS: [VariantHandlersOptionDefinition] = [
  {
    description: "Variant Handlers to be registered",
    name: "register",
    type: "array",
    itemsType: "unknown",
    default: [],
  },
];

export const VariantHandlers: VariantHandlersConstructor = class VariantHandlers
  implements VariantHandlersInterface
{
  static get id() {
    return "variantHandlers";
  }

  private _logger: LoggerInterface;
  private _config: ConfigNamespaceInterface;
  private _registerOption: OptionInterfaceOfType<
    VariantHandlerConstructor[],
    { hasDefault: true }
  >;
  private _registeredVariantHandlers: VariantHandlerConstructor[];
  private _coreVariantHandlers: VariantHandlerConstructor[];

  constructor({ logger, config }: VariantHandlersOptions) {
    this._logger = logger;
    this._registeredVariantHandlers = [];
    this._coreVariantHandlers = [
      VariantHandlerJson,
      VariantHandlerText,
      VariantHandlerStatus,
      VariantHandlerMiddleware,
      VariantHandlerStatic,
      VariantHandlerFile,
    ];
    this._config = config;

    [this._registerOption] = this._config.addOptions(OPTIONS) as [
      OptionInterfaceOfType<VariantHandlerConstructor[], { hasDefault: true }>
    ];
  }

  private _registerOne(VariantHandler: VariantHandlerConstructor): void {
    // TODO, check id, etc..
    this._logger.debug(`Registering '${VariantHandler.id}' variant handler`);
    this._registeredVariantHandlers.push(VariantHandler);
  }

  public register(variantHandlers: VariantHandlerConstructor[]): void {
    this._logger.info(`Registering ${variantHandlers.length} variant handlers`);
    variantHandlers.forEach((VariantHandler) => {
      this._registerOne(VariantHandler);
    });
  }

  public async registerFromConfig(): Promise<void> {
    const variantHandlersToRegister = [
      ...this._coreVariantHandlers,
      ...this._registerOption.value,
    ];
    this.register(variantHandlersToRegister);
    this._logger.verbose(
      `Registered ${variantHandlersToRegister.length} variant handlers without errors`
    );

    return Promise.resolve();
  }

  public get handlers(): VariantHandlerConstructor[] {
    return this._registeredVariantHandlers;
  }
};
