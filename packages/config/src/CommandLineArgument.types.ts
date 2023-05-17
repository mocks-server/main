import type { Option as CommanderOption } from "commander";

import type { UnknownObject, ConfigurationObject } from "./Common.types";
import type { ConfigNamespaceInterface } from "./Config.types";
import type { OptionArrayValueContent, OptionInterfaceGeneric } from "./Option.types";

export interface ReadOptions {
  allowUnknownOption: boolean;
}

export interface BaseCommanderOptionProperties {
  default:
    | string
    | number
    | boolean
    | UnknownObject
    | OptionArrayValueContent[]
    | null
    | undefined;
  isBoolean: boolean;
  isObject: boolean;
  Option: CommanderOption;
}

export interface CommanderOptionProperties extends BaseCommanderOptionProperties {
  namespace: ConfigNamespaceInterface;
  option: OptionInterfaceGeneric;
}

export interface CommanderOptionsData {
  [optionName: string]: CommanderOptionProperties;
}

export interface CommandLineArgumentsConstructor {
  new (): CommandLineArgumentsInterface;
}

export interface CommandLineArgumentsInterface {
  read(namespaces: ConfigNamespaceInterface[], options: ReadOptions): ConfigurationObject;
}
