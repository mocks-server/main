import type { Option as CommanderOption } from "commander"

import type { Namespaces, Namespace } from "./Namespace";
import type { AnyObject } from "./Common"
import type { OptionArrayValue, Option } from "./Option"
import type { ConfigObject } from "./Common";

export interface ReadOptions {
  allowUnknownOption: boolean
}

export interface BaseCommanderOptionProperties {
  default: string | number | boolean | AnyObject | OptionArrayValue | null | undefined,
  isBoolean: boolean,
  isObject: boolean,
  Option: CommanderOption
}

export interface CommanderOptionProperties extends BaseCommanderOptionProperties {
  namespace: Namespace,
  option: Option,
}

export interface CommanderOptionsData {
  [optionName: string]: CommanderOptionProperties
}

export interface CommandLineArgumentsConstructor {
  new (): CommandLineArgumentsInterface
}

export interface CommandLineArgumentsInterface {
  read(namespaces: Namespaces, options: ReadOptions): ConfigObject
}
