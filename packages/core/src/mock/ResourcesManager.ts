/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type {
  ResourcesLoaderInterface,
  ResourcesLoaderOptions,
  OnLoadResources,
  ResourcesManagerInterface,
  ResourcesManagerOptions,
} from "./ResourcesManager.types";

class ResourcesLoader<Type> implements ResourcesLoaderInterface<Type> {
  private _onLoad: OnLoadResources;
  private _resources: Type[];

  constructor({ onLoad }: ResourcesLoaderOptions) {
    this._onLoad = onLoad;
    this.load = this.load.bind(this);
    this._resources = [];
  }

  load(resources: Type[]): void {
    this._resources = resources;
    this._onLoad();
  }

  get resources(): Type[] {
    return this._resources;
  }
}

export class ResourcesManager<Type> implements ResourcesManagerInterface<Type> {
  private _onLoad: OnLoadResources;
  private _loaders: ResourcesLoaderInterface<Type>[];

  constructor({ onLoad }: ResourcesManagerOptions) {
    this._onLoad = onLoad;
    this._loaders = [];
  }

  createLoader(): ResourcesLoaderInterface<Type>["load"] {
    const loader = new ResourcesLoader<Type>({ onLoad: this._onLoad });
    this._loaders.push(loader);
    return loader.load;
  }

  get resources(): Type[] {
    let allResources: Type[] = [];
    this._loaders.forEach((loader) => {
      allResources = allResources.concat(loader.resources);
    });
    return allResources;
  }
}
