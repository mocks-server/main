/*
Copyright 2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const NestedCollections = require("@mocks-server/nested-collections");

const tracer = require("./tracer");

class Alerts extends NestedCollections {
  constructor(id, options) {
    super(id, { ...options, Decorator: Alerts });
  }

  set(id, message, error) {
    tracer.silly(
      `Setting alert with id '${id}' and message '${message}' in collection '${this._path}'`
    );
    if (error) {
      tracer.error(`${message}: ${error.message}`);
      tracer.debug(error.stack);
    } else {
      tracer.warn(message);
    }
    return super.set(id, { message, error });
  }

  remove(id) {
    tracer.silly(`Removing alert with id '${id}' in collection '${this._path}'`);
    return super.remove(id);
  }
}

module.exports = Alerts;
