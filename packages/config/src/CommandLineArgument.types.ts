import type { Option as CommanderOption } from "commander";

import type { AnyObject, ConfigurationObject } from "./Common.types";
import type { ConfigNamespaceInterface } from "./Config.types";
import type { OptionArrayValue, OptionInterface } from "./Option.types";

export interface ReadOptions {
  allowUnknownOption: boolean;
}

export interface BaseCommanderOptionProperties {
  default: string | number | boolean | AnyObject | OptionArrayValue | null | undefined;
  isBoolean: boolean;
  isObject: boolean;
  Option: CommanderOption;
}

export interface CommanderOptionProperties extends BaseCommanderOptionProperties {
  namespace: ConfigNamespaceInterface;
  option: OptionInterface;
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
