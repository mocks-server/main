const deepMerge = require("deepmerge");

const CommandLineArguments = require("./CommandLineArguments");
const Environment = require("./Environment");
const Files = require("./Files");
const Namespace = require("./Namespace");
const { types, avoidArraysMerge } = require("./types");
const { validateConfigAndThrow, validateConfig, getValidationSchema } = require("./validation");
const { checkNamespaceName, findObjectWithName, getNamespacesValues } = require("./namespaces");

const CONFIG_NAMESPACE = "config";

const CONFIG_OPTIONS = [
  {
    name: "readFile",
    description: "Read configuration file or not",
    type: types.BOOLEAN,
    default: true,
  },
  {
    name: "readArguments",
    description: "Read command line arguments or not",
    type: types.BOOLEAN,
    default: true,
  },
  {
    name: "readEnvironment",
    description: "Read environment or not",
    type: types.BOOLEAN,
    default: true,
  },
  {
    name: "fileSearchPlaces",
    description: "An array of places to search for the configuration file",
    type: types.ARRAY,
    itemsType: types.STRING,
  },
  {
    name: "fileSearchFrom",
    description: "Start searching for the configuration file from this folder",
    type: types.STRING,
  },
  {
    name: "fileSearchStop",
    description: "Directory where the search for the configuration file will stop",
    type: types.STRING,
  },
  {
    name: "allowUnknownArguments",
    description: "Allow unknown arguments",
    type: types.BOOLEAN,
    default: false,
  },
];

class Config {
  constructor({ moduleName, mergeArrays = true } = {}) {
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

    this._files = new Files(moduleName);
    this._args = new CommandLineArguments();
    this._environment = new Environment(moduleName);

    this._namespaces = [];
    this._rootNamespace = this.addNamespace();
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
    ] = this._configNamespace.addOptions(CONFIG_OPTIONS);
  }

  async _loadFromFile() {
    if (this._readFile.value !== true) {
      return {};
    }
    return this._files.read(this._programmaticConfig, {
      searchPlaces: this._fileSearchPlaces.value,
      searchFrom: this._fileSearchFrom.value,
      searchStop: this._fileSearchStop.value,
    });
  }

  async _loadFromEnv() {
    if (this._readEnvironment.value !== true) {
      return {};
    }
    return this._environment.read(this._namespaces);
  }

  async _loadFromArgs({ allowUnknown }) {
    if (this._readArguments.value !== true) {
      return {};
    }
    return this._args.read(this._namespaces, {
      allowUnknownOption: this._allowUnknownArguments.value || allowUnknown,
    });
  }

  _mergeConfig() {
    this._config = deepMerge.all(
      [this._programmaticConfig, this._fileConfig, this._envConfig, this._argsConfig],
      this._deepMergeOptions
    );
  }

  validate(config, { allowAdditionalProperties = false } = {}) {
    return validateConfig(config, {
      namespaces: this._namespaces,
      allowAdditionalProperties,
    });
  }

  getValidationSchema({ allowAdditionalProperties = false } = {}) {
    return getValidationSchema({
      namespaces: this._namespaces,
      allowAdditionalProperties,
    });
  }

  _validateAndThrow({ allowAdditionalProperties }) {
    validateConfigAndThrow(this._config, {
      namespaces: this._namespaces,
      allowAdditionalProperties,
    });
  }

  _startNamespacesEvents() {
    this._namespaces.forEach((namespace) => {
      namespace.startEvents();
    });
  }

  _mergeValidateAndSetNamespaces({ allowUnknown }) {
    this._mergeConfig();
    this._validateAndThrow({ allowAdditionalProperties: allowUnknown });
    this.set(this._config, { merge: true });
  }

  async _load({ allowUnknown = false } = {}) {
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

  async init(programmaticConfig = {}) {
    this._programmaticConfig = programmaticConfig;
    await this._load({ allowUnknown: true });
  }

  async load(programmaticConfig) {
    if (!this._initializated) {
      await this.init(programmaticConfig);
    }
    await this._load();
    this._startNamespacesEvents();
  }

  addNamespace(name) {
    const namespace =
      checkNamespaceName(name, {
        namespaces: this._namespaces,
        options: this._rootNamespace && this._rootNamespace.options,
        allowNoName: !this._rootNamespace,
      }) || new Namespace(name, { brothers: this._namespaces, root: this });
    this._namespaces.push(namespace);
    return namespace;
  }

  namespace(name) {
    return findObjectWithName(this._namespaces, name);
  }

  option(name) {
    return findObjectWithName(this._rootNamespace.options, name);
  }

  get value() {
    return getNamespacesValues(this._namespaces);
  }

  get programmaticLoadedValues() {
    return { ...this._programmaticConfig };
  }

  get fileLoadedValues() {
    return { ...this._fileConfig };
  }

  get envLoadedValues() {
    return { ...this._envConfig };
  }

  get argsLoadedValues() {
    return { ...this._argsConfig };
  }

  get loadedFile() {
    return this._files.loadedFile;
  }

  set value(configuration) {
    this.set(configuration);
  }

  get namespaces() {
    return this._namespaces;
  }

  get options() {
    return this._rootNamespace.options;
  }

  get root() {
    return this;
  }

  set(configuration = {}, options = {}) {
    this._namespaces.forEach((namespace) => {
      if (namespace.name) {
        namespace.set(configuration[namespace.name] || {}, options);
      } else {
        namespace.set(configuration, options);
      }
    });
  }
}

module.exports = Config;
