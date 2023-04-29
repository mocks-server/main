/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/** Method to execute when resources are loaded */
export interface OnLoadResources {
  (): void;
}

export interface ResourcesLoaderOptions {
  /** Method to execute when resources are loaded */
  onLoad: OnLoadResources;
}

/**  ResourcesLoader constructor */
export interface ResourcesLoaderConstructor<Type> {
  /**
   * Creates a resources loader interface
   * @param options - Options {@link ResourceLoadersOptions}
   * @returns Resource loaders interface {@link ResourcesLoaderInterface}.
   * @example const loader = new ResourcesLoader({ onLoad: () => console.log("Resources loaded")});
   */
  new (options: ResourcesLoaderOptions): ResourcesLoaderInterface<Type>;
}

/** Allows to load and array of resources. It notifies about it, and allows to get them by using a getter */
export interface ResourcesLoaderInterface<Type> {
  /** Return resources */
  get resources(): Type[];

  /** Add resources to the loader, and notify about it
   * @param resources - Resources to be added
   * @example loader.load([{foo: "bar"}, {foo: "baz"}]);
   */
  load(resources: Type[]): void;
}

export interface ResourcesManagerOptions {
  /** Method to execute when resources are loaded */
  onLoad: OnLoadResources;
}

/**  ResourcesManager constructor */
export interface ResourcesManagerConstructor<Type> {
  /**
   * Creates a resources manager interface
   * @param options - Options {@link ResourcesManagerOptions}
   * @returns Resources manager interface {@link ResourcesManagerInterface}.
   * @example const resourcesManager = new ResourcesManager({ onLoad: () => console.log("Resources loaded")});
   */
  new (options: ResourcesManagerOptions): ResourcesManagerInterface<Type>;
}

/** Allows to create many resource loaders and getting all their resources at a time */
export interface ResourcesManagerInterface<Type> {
  /** Return an array of resources by concatenating the resources of all loaders */
  get resources(): Type[];

  /** Creates a new resources loader and return it. Each loader can load its own resources separately
   * @example const loader = resourceLoaders.createLoader(); loader.load([{foo: "bar"}, {foo: "baz"}]); const resources = resourceLoaders.resources;
   */
  createLoader(): ResourcesLoaderInterface<Type>["load"];
}
