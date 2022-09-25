import EventEmitter from "events";

import type { NamespaceInterface, NamespaceProperties, ConfigInterface } from "./types/Config";
import type { OptionProperties, OptionInterface, SetMethodOptions } from "./types/Option";
import type { ConfigObject } from "./types/Common";

import Option from "./Option";
import {
  checkNamespaceName,
  checkOptionName,
  findObjectWithName,
  getNamespacesValues,
  getOptionsValues,
} from "./namespaces";

class Namespace implements NamespaceInterface {
  private _brothers: NamespaceInterface[]
  private _parents: NamespaceInterface[]
  private _root: ConfigInterface
  private _eventEmitter: EventEmitter
  private _name: string
  private _namespaces: NamespaceInterface[]
  private _options: OptionInterface[]
  private _started: boolean
  private _isRoot: true | undefined

  constructor(name: string, { parents = [], brothers, root, isRoot }: NamespaceProperties ) {
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

  public addOption(optionProperties: OptionProperties): OptionInterface {
    checkOptionName(optionProperties.name, {
      options: this._options,
      namespaces: this._isRoot ? this._brothers : this._namespaces,
    });
    const option = new Option(optionProperties);
    this._options.push(option);
    return option;
  }

  public addOptions(options: OptionProperties[]) {
    return options.map((option) => this.addOption(option));
  }

  private _setOptions(configuration: ConfigObject, options: SetMethodOptions): void {
    this._options.forEach((option) => {
      option.set(configuration[option.name], options);
    });
  }

  public set(configuration: ConfigObject = {}, options: SetMethodOptions = {}): void {
    this._setOptions(configuration, options);
    this._namespaces.forEach((namespace) => {
      const namespaceConfig = configuration[namespace.name] as ConfigObject
      namespace.set(namespaceConfig || {}, options);
    });
  }

  public startEvents(): void {
    this._options.forEach((option) => option.startEvents());
    this._namespaces.forEach((namespace) => namespace.startEvents());
    this._started = true;
  }

  public addNamespace(name: NamespaceInterface["name"]): NamespaceInterface {
    const namespace =
      checkNamespaceName(name, { namespaces: this._namespaces, options: this._options }) ||
      new Namespace(name, { parents: [...this._parents, this], root: this._root, brothers: this._namespaces });
    this._namespaces.push(namespace);
    return namespace;
  }

  public get isRoot(): boolean {
    return Boolean(this._isRoot);
  }

  public get name(): NamespaceInterface["name"] {
    return this._name;
  }

  public get parents(): NamespaceInterface[] {
    return [...this._parents];
  }

  public get root(): ConfigInterface {
    return this._root;
  }

  public get namespaces(): NamespaceInterface[] {
    return [...this._namespaces];
  }

  public get options(): OptionInterface[] {
    return [...this._options];
  }

  public get value(): ConfigObject {
    return {
      ...getNamespacesValues(this._namespaces),
      ...getOptionsValues(this._options),
    };
  }

  public set value(configuration: ConfigObject) {
    this.set(configuration);
  }

  public namespace(name: NamespaceInterface["name"]): NamespaceInterface | undefined {
    return findObjectWithName(this._namespaces, name);
  }

  public option(name: OptionInterface["name"]): OptionInterface | undefined {
    return findObjectWithName(this._options, name);
  }
}

export default Namespace;
