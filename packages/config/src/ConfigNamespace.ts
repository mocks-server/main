import EventEmitter from "events";

import {
  checkNamespaceName,
  checkOptionName,
  findObjectWithName,
  getNamespacesValues,
  getOptionsValues,
} from "./ConfigNamespaceHelpers";
import { Option } from "./Option";

import type { ConfigurationObject } from "./Common.types";
import type {
  ConfigInterface,
  ConfigNamespaceInterface,
  ConfigNamespaceProperties,
  ConfigNamespaceConstructor,
} from "./Config.types";
import type {
  OptionInterfaceGeneric,
  SetMethodOptions,
  OptionDefinitionGeneric,
  OptionInterfaceOfType,
  GetOptionValueTypeFromDefinition,
  GetOptionHasDefaultFromDefinition,
  GetOptionIsNullableFromDefinition,
} from "./Option.types";

export const ConfigNamespace: ConfigNamespaceConstructor = class ConfigNamespace
  implements ConfigNamespaceInterface
{
  private _brothers: ConfigNamespaceInterface[];
  private _parents: ConfigNamespaceInterface[];
  private _root: ConfigInterface;
  private _eventEmitter: EventEmitter;
  private _name: string;
  private _namespaces: ConfigNamespaceInterface[];
  private _options: OptionInterfaceGeneric[];
  private _started: boolean;
  private _isRoot: true | undefined;

  constructor(name: string, { parents = [], brothers, root, isRoot }: ConfigNamespaceProperties) {
    this._brothers = brothers;
    this._parents = parents;
    this._root = root;
    this._eventEmitter = new EventEmitter();
    this._name = name;
    this._namespaces = [];
    this._options = [];
    this._started = false;
    this._isRoot = isRoot;
  }

  public get isRoot(): boolean {
    return Boolean(this._isRoot);
  }

  public get name(): ConfigNamespaceInterface["name"] {
    return this._name;
  }

  public get parents(): ConfigNamespaceInterface[] {
    return [...this._parents];
  }

  public get root(): ConfigInterface {
    return this._root;
  }

  public get namespaces(): ConfigNamespaceInterface[] {
    return [...this._namespaces];
  }

  public get options(): OptionInterfaceGeneric[] {
    return [...this._options];
  }

  public get value(): ConfigurationObject {
    return {
      ...getNamespacesValues(this._namespaces),
      ...getOptionsValues(this._options),
    };
  }

  public set value(configuration: ConfigurationObject) {
    this.set(configuration);
  }

  public addOption<Type extends OptionDefinitionGeneric>(
    optionProperties: Type
  ): OptionInterfaceOfType<
    GetOptionValueTypeFromDefinition<Type>,
    {
      hasDefault: GetOptionHasDefaultFromDefinition<Type>;
      nullable: GetOptionIsNullableFromDefinition<Type>;
    }
  > {
    checkOptionName(optionProperties.name, {
      options: this._options,
      namespaces: this._isRoot ? this._brothers : this._namespaces,
    });
    const option = new Option(optionProperties);
    this._options.push(option);
    return option as OptionInterfaceOfType<
      GetOptionValueTypeFromDefinition<Type>,
      {
        hasDefault: GetOptionHasDefaultFromDefinition<Type>;
        nullable: GetOptionIsNullableFromDefinition<Type>;
      }
    >;
  }

  public addOptions<Type extends OptionDefinitionGeneric[]>(
    options: [...OptionDefinitionGeneric[]]
  ): [
    ...OptionInterfaceOfType<
      GetOptionValueTypeFromDefinition<Type[number]>,
      {
        hasDefault: GetOptionHasDefaultFromDefinition<Type[number]>;
        nullable: GetOptionIsNullableFromDefinition<Type[number]>;
      }
    >[]
  ] {
    return options.map((option) => this.addOption(option)) as [
      ...OptionInterfaceOfType<
        GetOptionValueTypeFromDefinition<Type[number]>,
        {
          hasDefault: GetOptionHasDefaultFromDefinition<Type[number]>;
          nullable: GetOptionIsNullableFromDefinition<Type[number]>;
        }
      >[]
    ];
  }

  public set(configuration: ConfigurationObject = {}, options: SetMethodOptions = {}): void {
    this._setOptions(configuration, options);
    this._namespaces.forEach((namespace) => {
      const namespaceConfig = configuration[namespace.name] as ConfigurationObject;
      namespace.set(namespaceConfig || {}, options);
    });
  }

  public startEvents(): void {
    this._options.forEach((option) => option.startEvents());
    this._namespaces.forEach((namespace) => namespace.startEvents());
    this._started = true;
  }

  public addNamespace(name: ConfigNamespaceInterface["name"]): ConfigNamespaceInterface {
    checkNamespaceName(name, { namespaces: this._namespaces, options: this._options });
    const namespace = new ConfigNamespace(name, {
      parents: [...this._parents, this],
      root: this._root,
      brothers: this._namespaces,
    });
    this._namespaces.push(namespace);
    return namespace;
  }

  public namespace(name: ConfigNamespaceInterface["name"]): ConfigNamespaceInterface | undefined {
    return findObjectWithName(this._namespaces, name);
  }

  public option(name: OptionInterfaceGeneric["name"]): OptionInterfaceGeneric | undefined {
    return findObjectWithName(this._options, name);
  }

  private _setOptions(configuration: ConfigurationObject, options: SetMethodOptions): void {
    this._options.forEach(<T extends OptionInterfaceGeneric>(option: T) => {
      const optionValue = configuration[option.name] as T["value"];
      option.set(optionValue, options);
    });
  }
};
