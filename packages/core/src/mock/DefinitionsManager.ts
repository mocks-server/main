/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type {
  DefinitionsLoaderInterface,
  DefinitionsLoaderOptions,
  OnLoadDefinitions,
  DefinitionsManagerInterface,
  DefinitionsManagerOptions,
} from "./DefinitionsManager.types";

class DefinitionsLoader<Type> implements DefinitionsLoaderInterface<Type> {
  private _onLoad: OnLoadDefinitions;
  private _definitions: Type[];

  constructor({ onLoad }: DefinitionsLoaderOptions) {
    this._onLoad = onLoad;
    this.load = this.load.bind(this);
    this._definitions = [];
  }

  load(definitions: Type[]): void {
    this._definitions = definitions;
    this._onLoad();
  }

  get definitions(): Type[] {
    return this._definitions;
  }
}

export class DefinitionsManager<Type> implements DefinitionsManagerInterface<Type> {
  private _onLoad: OnLoadDefinitions;
  private _loaders: DefinitionsLoaderInterface<Type>[];

  constructor({ onLoad }: DefinitionsManagerOptions) {
    this._onLoad = onLoad;
    this._loaders = [];
  }

  createLoader(): DefinitionsLoaderInterface<Type>["load"] {
    const loader = new DefinitionsLoader<Type>({ onLoad: this._onLoad });
    this._loaders.push(loader);
    return loader.load;
  }

  get definitions(): Type[] {
    let allResources: Type[] = [];
    this._loaders.forEach((loader) => {
      allResources = allResources.concat(loader.definitions);
    });
    return allResources;
  }
}
