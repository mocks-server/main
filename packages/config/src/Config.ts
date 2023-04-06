import deepMerge from "deepmerge";
import type deepmerge from "deepmerge";
import type { JSONSchema7 } from "json-schema";

import type { CommandLineArgumentsInterface } from "./CommandLineArgumentTypes";
import type { ConfigurationObject } from "./CommonTypes";
import type {
  ConfigConstructor,
  ConfigInterface,
  ConfigOptions,
  ConfigValidationOptions,
  LoadArgumentsOptions,
  NamespaceInterface,
} from "./ConfigTypes";
import type { EnvironmentInterface } from "./EnvironmentTypes";
import type { FilesInterface } from "./FilesTypes";
import type { OptionInterface, SetMethodOptions } from "./OptionTypes";
import type { GetValidationSchemaOptions, ConfigValidationResult } from "./ValidationTypes";

import { CommandLineArguments } from "./CommandLineArguments";
import { Environment } from "./Environment";
import { Files } from "./Files";
import { Namespace } from "./Namespace";
import { checkNamespaceName, findObjectWithName, getNamespacesValues } from "./namespaces";
import {
  CONFIG_NAMESPACE,
  READ_FILE_OPTION,
  READ_ARGUMENTS_OPTION,
  READ_ENVIRONMENT_OPTION,
  FILE_SEARCH_PLACES_OPTION,
  FILE_SEARCH_FROM_OPTION,
  FILE_SEARCH_STOP_OPTION,
  ALLOW_UNKNOWN_ARGUMENTS_OPTION,
} from "./Options";
import { avoidArraysMerge, STRING_TYPE, BOOLEAN_TYPE, ARRAY_TYPE } from "./typing";
import { validateConfigAndThrow, validateConfig, getValidationSchema } from "./validation";

const ROOT_NAMESPACE = "_rootOptions";

export const Config: ConfigConstructor = class Config implements ConfigInterface {
  private _initializated: boolean;
  private _deepMergeOptions: deepmerge.Options;
  private _programmaticConfig: ConfigurationObject;
  private _fileConfig: ConfigurationObject;
  private _argsConfig: ConfigurationObject;
  private _envConfig: ConfigurationObject;
  private _files: FilesInterface;
  private _args: CommandLineArgumentsInterface;
  private _environment: EnvironmentInterface;
  private _namespaces: NamespaceInterface[];
  private _rootNamespace: NamespaceInterface;
  private _configNamespace: NamespaceInterface;
  private _readFile: OptionInterface;
  private _readArguments: OptionInterface;
  private _readEnvironment: OptionInterface;
  private _fileSearchPlaces: OptionInterface;
  private _fileSearchFrom: OptionInterface;
  private _fileSearchStop: OptionInterface;
  private _config: ConfigurationObject;
  private _allowUnknownArguments: OptionInterface;
  public addOption: NamespaceInterface["addOption"];
  public addOptions: NamespaceInterface["addOptions"];

  constructor(
    { moduleName, mergeArrays = true }: ConfigOptions = { moduleName: "", mergeArrays: true }
  ) {
    this._initializated = false;

    this._deepMergeOptions = !mergeArrays
      ? {
          arrayMerge: avoidArraysMerge,
        }
      : {};
    this._programmaticConfig = {};
    this._fileConfig = {};
    this._envConfig = {};
    this._argsConfig = {};
    this._config = {};

    this._files = new Files(moduleName);
    this._args = new CommandLineArguments();
    this._environment = new Environment(moduleName);

    this._namespaces = [];
    this._rootNamespace = new Namespace(ROOT_NAMESPACE, {
      brothers: this._namespaces,
      root: this,
      isRoot: true,
    });
    this._namespaces.push(this._rootNamespace);
    this.addOption = this._rootNamespace.addOption.bind(this._rootNamespace);
    this.addOptions = this._rootNamespace.addOptions.bind(this._rootNamespace);

    this._configNamespace = this.addNamespace(CONFIG_NAMESPACE);
    [
      this._readFile,
      this._readArguments,
      this._readEnvironment,
      this._fileSearchPlaces,
      this._fileSearchFrom,
      this._fileSearchStop,
      this._allowUnknownArguments,
    ] = this._configNamespace.addOptions([
      {
        name: READ_FILE_OPTION,
        description: "Read configuration file or not",
        type: BOOLEAN_TYPE,
        default: true,
      },
      {
        name: READ_ARGUMENTS_OPTION,
        description: "Read command line arguments or not",
        type: BOOLEAN_TYPE,
        default: true,
      },
      {
        name: READ_ENVIRONMENT_OPTION,
        description: "Read environment or not",
        type: BOOLEAN_TYPE,
        default: true,
      },
      {
        name: FILE_SEARCH_PLACES_OPTION,
        description: "An array of places to search for the configuration file",
        type: ARRAY_TYPE,
        itemsType: STRING_TYPE,
      },
      {
        name: FILE_SEARCH_FROM_OPTION,
        description: "Start searching for the configuration file from this folder",
        type: STRING_TYPE,
      },
      {
        name: FILE_SEARCH_STOP_OPTION,
        description: "Directory where the search for the configuration file will stop",
        type: STRING_TYPE,
      },
      {
        name: ALLOW_UNKNOWN_ARGUMENTS_OPTION,
        description: "Allow unknown arguments",
        type: BOOLEAN_TYPE,
        default: false,
      },
    ]);
  }

  private async _loadFromFile(): Promise<ConfigurationObject> {
    if (this._readFile.value !== true) {
      return {};
    }
    return this._files.read(this._programmaticConfig, {
      searchPlaces: this._fileSearchPlaces.value,
      searchFrom: this._fileSearchFrom.value,
      searchStop: this._fileSearchStop.value,
    });
  }

  private async _loadFromEnv(): Promise<ConfigurationObject> {
    if (this._readEnvironment.value !== true) {
      return {};
    }
    return this._environment.read(this._namespaces);
  }

  private async _loadFromArgs({
    allowUnknown,
  }: LoadArgumentsOptions): Promise<ConfigurationObject> {
    if (this._readArguments.value !== true) {
      return {};
    }
    return this._args.read(this._namespaces, {
      allowUnknownOption: this._allowUnknownArguments.value || allowUnknown,
    });
  }

  private _mergeConfig(): void {
    this._config = deepMerge.all(
      [this._programmaticConfig, this._fileConfig, this._envConfig, this._argsConfig],
      this._deepMergeOptions
    );
  }

  public validate(
    config: ConfigurationObject,
    { allowAdditionalProperties = false }: ConfigValidationOptions = {}
  ): ConfigValidationResult {
    return validateConfig(config, {
      namespaces: this._namespaces,
      allowAdditionalProperties,
    });
  }

  public getValidationSchema({
    allowAdditionalProperties = false,
  }: ConfigValidationOptions = {}): JSONSchema7 {
    return getValidationSchema({
      namespaces: this._namespaces,
      allowAdditionalProperties,
    });
  }

  private _validateAndThrow({ allowAdditionalProperties }: Partial<GetValidationSchemaOptions>) {
    validateConfigAndThrow(this._config, {
      namespaces: this._namespaces,
      allowAdditionalProperties,
    } as GetValidationSchemaOptions);
  }

  private _startNamespacesEvents(): void {
    this._namespaces.forEach((namespace) => {
      namespace.startEvents();
    });
  }

  private _mergeValidateAndSetNamespaces({ allowUnknown }: LoadArgumentsOptions): void {
    this._mergeConfig();
    this._validateAndThrow({ allowAdditionalProperties: allowUnknown });
    this.set(this._config, { merge: true });
  }

  private async _load(
    { allowUnknown }: LoadArgumentsOptions = { allowUnknown: false }
  ): Promise<void> {
    // Programmatic does not change, so we only load it in init method
    if (!this._initializated) {
      this._mergeValidateAndSetNamespaces({ allowUnknown });
    }

    // Args and environment vars load only defined options, so they must be loaded in init and load
    this._argsConfig = await this._loadFromArgs({ allowUnknown });
    this._mergeValidateAndSetNamespaces({ allowUnknown });
    this._envConfig = await this._loadFromEnv();
    this._mergeValidateAndSetNamespaces({ allowUnknown });

    // File does not change, so we only load it in init method
    if (!this._initializated) {
      this._fileConfig = await this._loadFromFile();
      this._mergeValidateAndSetNamespaces({ allowUnknown });
      this._initializated = true;
    }
  }

  public async init(programmaticConfig: ConfigurationObject = {}): Promise<void> {
    this._programmaticConfig = programmaticConfig;
    await this._load({ allowUnknown: true });
  }

  public async load(programmaticConfig?: ConfigurationObject): Promise<void> {
    if (!this._initializated) {
      await this.init(programmaticConfig);
    }
    await this._load();
    this._startNamespacesEvents();
  }

  public addNamespace(name: NamespaceInterface["name"]): NamespaceInterface {
    checkNamespaceName(name, {
      namespaces: this._namespaces,
      options: this._rootNamespace && this._rootNamespace.options,
    });
    const namespace = new Namespace(name, { brothers: this._namespaces, root: this });
    this._namespaces.push(namespace);
    return namespace;
  }

  public namespace(name: NamespaceInterface["name"]): NamespaceInterface | undefined {
    return findObjectWithName(this._namespaces, name);
  }

  public option(name: OptionInterface["name"]): OptionInterface | undefined {
    return findObjectWithName(this._rootNamespace.options, name);
  }

  public get value(): ConfigurationObject {
    return getNamespacesValues(this._namespaces);
  }

  public set value(configuration: ConfigurationObject) {
    this.set(configuration);
  }

  public get programmaticLoadedValues(): ConfigurationObject {
    return { ...this._programmaticConfig };
  }

  public get fileLoadedValues(): ConfigurationObject {
    return { ...this._fileConfig };
  }

  public get envLoadedValues(): ConfigurationObject {
    return { ...this._envConfig };
  }

  public get argsLoadedValues(): ConfigurationObject {
    return { ...this._argsConfig };
  }

  public get loadedFile(): string | null {
    return this._files.loadedFile;
  }

  public get namespaces(): NamespaceInterface[] {
    return this._namespaces.filter((namespace) => !namespace.isRoot);
  }

  public get options(): OptionInterface[] {
    return this._rootNamespace.options;
  }

  public get root(): ConfigInterface {
    return this;
  }

  public set(configuration: ConfigurationObject = {}, options: SetMethodOptions = {}): void {
    this._namespaces.forEach((namespace) => {
      if (!namespace.isRoot) {
        namespace.set((configuration[namespace.name] as ConfigurationObject) || {}, options);
      } else {
        namespace.set(configuration, options);
      }
    });
  }
};
