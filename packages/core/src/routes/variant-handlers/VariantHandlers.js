/*
Copyright 2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const DefaultVariantHandler = require("./handlers/Default");
const Json = require("./handlers/Json");
const Middleware = require("./handlers/Middleware");

class VariantHandlers {
  constructor({ logger }) {
    this._logger = logger;
    this._registeredVariantHandlers = [];
    this._variantHandlers = [DefaultVariantHandler, Json, Middleware];
  }

  add(VariantHandler) {
    this._variantHandlers.push(VariantHandler);
  }

  register(variantHandlers = []) {
    this._variantHandlers = this._variantHandlers.concat(variantHandlers);
    return this._registerHandlers().then(() => {
      this._logger.verbose(
        `Registered ${this._registeredVariantHandlers.length} variant handlers without errors`
      );
      return Promise.resolve();
    });
  }

  _registerHandlers() {
    this._variantHandlers.forEach((VariantHandler) => {
      // TODO, check id, etc..
      this._registeredVariantHandlers.push(VariantHandler);
      this._logger.verbose(`Registering "${VariantHandler.id}" variant handler`);
    });
    return Promise.resolve();
  }

  get handlers() {
    return this._registeredVariantHandlers;
  }
}

module.exports = VariantHandlers;
