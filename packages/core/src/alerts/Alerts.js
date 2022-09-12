/*
Copyright 2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { NestedCollections } = require("@mocks-server/nested-collections");

const ALERTS_ROOT_ID = "alerts";
const ID_SEP = ":";

class Alerts extends NestedCollections {
  constructor(id, options) {
    super(id, { ...options, Decorator: Alerts });
    this._logger = options.logger.namespace(id);
  }

  set(id, message, error) {
    this._logger.silly(`Setting alert with id '${id}'`);
    if (error) {
      this._logger.error(`${message}: ${error.message}`);
      this._logger.debug(error.stack);
    } else {
      this._logger.warn(message);
    }
    return super.set(id, { message, error });
  }

  remove(id) {
    this._logger.silly(`Removing alert with id '${id}'`);
    return super.remove(id);
  }

  get flat() {
    return this._flat.map((item) => {
      let collectionPaths = item.collection.split(ID_SEP);
      if (collectionPaths[0] === ALERTS_ROOT_ID) {
        collectionPaths.shift();
      }

      return {
        ...item.value,
        id: [...collectionPaths, item.id].join(ID_SEP),
      };
    });
  }
}

module.exports = Alerts;
