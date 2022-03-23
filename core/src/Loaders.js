/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

class Loader {
  constructor({ onLoad }) {
    this._onLoad = onLoad;
    this.load = this.load.bind(this);
    this._contents = [];
  }

  load(contents) {
    this._contents = contents;
    this._onLoad();
  }

  get contents() {
    return this._contents;
  }
}

class Loaders {
  constructor({ onLoad }) {
    this._onLoad = onLoad;
    this._loaders = [];
  }

  new() {
    const loader = new Loader({ onLoad: this._onLoad });
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
