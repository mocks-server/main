/*
Copyright 2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { resolveWhenConditionPass } = require("../common/helpers");

const OPTIONS = [
  {
    description: "Selected collection",
    name: "selected",
    type: "string",
  },
];

// TODO, add to data model

class Collections {
  static get id() {
    return "collections";
  }

  constructor({ logger, config, onChangeSelected, getIds, getPlainCollections, getSelected }) {
    this._logger = logger;
    this._config = config;
    this._onChangeSelected = onChangeSelected;
    this._getPlainCollections = getPlainCollections;
    this._getIds = getIds;
    this._getSelected = getSelected;

    [this._selectedOption] = this._config.addOptions(OPTIONS);
    this._selectedOption.onChange(onChangeSelected);
  }

  get selected() {
    return this._getSelected();
  }

  get ids() {
    return this._getIds();
  }

  get plain() {
    return this._getPlainCollections();
  }

  select(collection, { check = false } = {}) {
    this._selectedOption.value = collection;
    if (check) {
      return resolveWhenConditionPass(() => {
        return this.selected === collection;
      });
    }
  }
}

module.exports = Collections;
