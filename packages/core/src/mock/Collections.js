/*
Copyright 2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const OPTIONS = [
  {
    description: "Selected collection",
    name: "selected",
    type: "string",
    // LEGACY, remove and set value from scaffold when legacy option is removed
    default: "base",
  },
];

class Collections {
  static get id() {
    return "collections";
  }

  constructor({
    logger,
    config,
    onChangeSelected,
    getIds,
    getSelectedCollection,
    getPlainCollections,
  }) {
    this._logger = logger;
    this._config = config;
    this._onChangeSelected = onChangeSelected;
    this._getSelectedCollection = getSelectedCollection;
    this._getPlainCollections = getPlainCollections;
    this._getIds = getIds;

    [this._selectedOption] = this._config.addOptions(OPTIONS);
    this._selectedOption.onChange(onChangeSelected);
  }

  get selected() {
    return this._getSelectedCollection();
  }

  get ids() {
    return this._getIds();
  }

  get plain() {
    return this._getPlainCollections();
  }

  select(collection) {
    this._selectedOption.value = collection;
  }
}

module.exports = Collections;
