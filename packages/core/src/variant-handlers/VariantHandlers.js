/*
Copyright 2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const Json = require("./handlers/Json");
const Text = require("./handlers/Text");
const Middleware = require("./handlers/Middleware");
const Static = require("./handlers/Static");
const Status = require("./handlers/Status");
const File = require("./handlers/File");

const OPTIONS = [
  {
    description: "Variant Handlers to be registered",
    name: "register",
    type: "array",
    default: [],
  },
];

class VariantHandlers {
  static get id() {
    return "variantHandlers";
  }

  constructor({ logger, config }) {
    this._logger = logger;
    this._registeredVariantHandlers = [];
    this._coreVariantHandlers = [Json, Text, Status, Middleware, Static, File];
    this._config = config;

    [this._registerOption] = this._config.addOptions(OPTIONS);
  }

  _registerOne(VariantHandler) {
    // TODO, check id, etc..
    this._logger.debug(`Registering '${VariantHandler.id}' variant handler`);
    this._registeredVariantHandlers.push(VariantHandler);
  }

  register(variantHandlers) {
    variantHandlers.forEach((VariantHandler) => {
      this._registerOne(VariantHandler);
    });
  }

  registerConfig() {
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

  get handlers() {
    return this._registeredVariantHandlers;
  }
}

module.exports = VariantHandlers;
