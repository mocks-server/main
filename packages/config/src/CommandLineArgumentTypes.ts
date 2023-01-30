import type { Option as CommanderOption } from "commander";

import type { AnyObject, ConfigurationObject } from "./CommonTypes";
import type { NamespaceInterface } from "./ConfigTypes";
import type { OptionArrayValue, OptionInterface } from "./OptionTypes";

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
  namespace: NamespaceInterface;
  option: OptionInterface;
}

export interface CommanderOptionsData {
  [optionName: string]: CommanderOptionProperties;
}

export interface CommandLineArgumentsConstructor {
  new (): CommandLineArgumentsInterface;
}

export interface CommandLineArgumentsInterface {
  read(namespaces: NamespaceInterface[], options: ReadOptions): ConfigurationObject;
}
