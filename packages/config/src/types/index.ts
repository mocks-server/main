/* eslint-disable @typescript-eslint/no-namespace */
import type { JSONSchema7 } from "json-schema";

import type {
  ConfigInterface as _ConfigInterface,
  ConfigConstructor as _ConfigConstructor,
  NamespaceInterface as _NamespaceInterface,
  NamespaceConstructor as _NamespaceConstructor,
  ConfigOptions as _ConfigOptions,
  ValidationOptions as _ValidationOptions,
  NamespaceProperties as _NamespaceProperties,
} from './Config';

import type {
  OptionConstructor as _OptionConstructor,
  OptionInterface as _OptionInterface,
  OptionProperties as _OptionProperties,
  OptionType as _OptionType,
  SetMethodOptions as _SetMethodOptions,
  OptionValue as _OptionValue,
  ExtraData as _ExtraData,
  ItemsType as _ItemsType,
} from './Option';

import type { SchemaValidationResult as _SchemaValidationResult } from "./Validation";
import type { ConfigObject as _ConfigObject } from "./Common";
import type { EventListener as _EventListener, EventListenerRemover as _EventListenerRemover } from "./Events";

export type ConfigurationObject = _ConfigObject;

export namespace Config {
  export type Interface = _ConfigInterface;
  export type Constructor = _ConfigConstructor;
  export type Options = _ConfigOptions;

  export namespace Validation {
    export type Options = _ValidationOptions
    export type Result = _SchemaValidationResult
    export type Schema = JSONSchema7
  }

  export namespace Set {
    export type Options = _SetMethodOptions
  }
}

export namespace Namespace {
  export type Interface = _NamespaceInterface;
  export type Constructor = _NamespaceConstructor;
  export type Options = _NamespaceProperties;
  export namespace Set {
    export type Options = _SetMethodOptions
  }
}

export namespace Option {
  export type Interface = _OptionInterface;
  export type Constructor = _OptionConstructor;
  export type Options = _OptionProperties;
  export type Type = _OptionType;
  export type Value = _OptionValue;
  export type ExtraData = _ExtraData;
  export type ItemsType = _ItemsType;

  export namespace Set {
    export type Options = _SetMethodOptions
  }

  export namespace Events {
    export type Listener = _EventListener
    export type ListenerRemover = _EventListenerRemover
  }
}
