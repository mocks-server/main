/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { LOAD_LEGACY_MOCKS } = require("./eventNames");

class Loader {
  constructor(core) {
    this._core = core;
    this.load = this.load.bind(this);
    this._contents = [];
  }

  load(contents) {
    this._contents = contents;
    this._core._eventEmitter.emit(LOAD_LEGACY_MOCKS);
  }

  get contents() {
    return this._contents;
  }
}

class Loaders {
  constructor(core) {
    this._core = core;
    this._loaders = [];
  }

  new() {
    const loader = new Loader(this._core);
    this._loaders.push(loader);
    return loader.load;
  }

  get contents() {
    let allContents = [];
    this._loaders.forEach((loader) => {
      allContents = allContents.concat(loader.contents);
    });
    return allContents;
  }
}

module.exports = Loaders;
