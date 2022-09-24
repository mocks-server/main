/* eslint-disable @typescript-eslint/no-namespace */

import type {
  ConfigInterface as _ConfigInterface,
  ConfigConstructor as _ConfigConstructor,
  NamespaceInterface as _NamespaceInterface,
  NamespaceConstructor as _NamespaceConstructor,
  ConfigOptions as _ConfigOptions,
  ValidationOptions as _ValidationOptions,
  NamespaceProperties as _NamespaceProperties,
} from './Config';

export namespace Config {
  export type ConfigInterface = _ConfigInterface;
  export type ConfigConstructor = _ConfigConstructor;
  export type Options = _ConfigOptions;

  export namespace Validation {
    export type Options = _ValidationOptions
  }
}

export namespace Namespace {
  export type ConfigInterface = _NamespaceInterface;
  export type ConfigConstructor = _NamespaceConstructor;
  export type Options = _NamespaceProperties;
}
