/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

/** Method to execute when definitions are loaded */
export interface OnLoadDefinitions {
  (): void;
}

export interface DefinitionsLoaderOptions {
  /** Method to execute when definitions are loaded */
  onLoad: OnLoadDefinitions;
}

/**  DefinitionsLoader constructor */
export interface DefinitionsLoaderConstructor<Type> {
  /**
   * Creates a definitions loader interface
   * @param options - Options {@link DefinitionsLoadersOptions}
   * @returns Definitions loaders interface {@link DefinitionsLoaderInterface}.
   * @example const loader = new DefinitionsLoader({ onLoad: () => console.log("Definitions loaded")});
   */
  new (options: DefinitionsLoaderOptions): DefinitionsLoaderInterface<Type>;
}

/** Allows to load and array of definitions. It notifies about it, and allows to get them by using a getter */
export interface DefinitionsLoaderInterface<Type> {
  /** Return definitions */
  get definitions(): Type[];

  /** Add definitions to the loader, and notify about it
   * @param definitions - Definitions to be added
   * @example loader.load([{foo: "bar"}, {foo: "baz"}]);
   */
  load(definitions: Type[]): void;
}

export interface DefinitionsManagerOptions {
  /** Method to execute when definitions are loaded */
  onLoad: OnLoadDefinitions;
}

/**  Definitions Manager constructor */
export interface DefinitionsManagerConstructor<Type> {
  /**
   * Creates a definitions manager interface
   * @param options - Options {@link DefinitionsManagerOptions}
   * @returns Resources manager interface {@link DefinitionsManagerInterface}.
   * @example const definitionsManager = new DefinitionsManager({ onLoad: () => console.log("Definitions loaded")});
   */
  new (options: DefinitionsManagerOptions): DefinitionsManagerInterface<Type>;
}

/** Allows to create many definitions loaders and getting all their definitions at a time */
export interface DefinitionsManagerInterface<Type> {
  /** Return an array of definitions by concatenating the definitions of all loaders */
  get definitions(): Type[];

  /** Creates a new definitions loader and return it. Each loader can load its own definitions separately
   * @example const loader = definitionLoaders.createLoader(); loader.load([{foo: "bar"}, {foo: "baz"}]); const definitions = definitionLoaders.definitions;
   */
  createLoader(): DefinitionsLoaderInterface<Type>["load"];
}
