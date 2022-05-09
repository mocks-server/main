const deepMerge = require("deepmerge");

const CommandLineArguments = require("./CommandLineArguments");
const Environment = require("./Environment");
const Files = require("./Files");
const Namespace = require("./Namespace");
const { types } = require("./types");
const { validateConfig } = require("./validation");
const { checkNamespaceName, findObjectWithName } = require("./namespaces");

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
    description: "An array of places to search configuration files",
    type: types.ARRAY,
    itemsType: types.STRING,
  },
];

class Config {
  constructor({ moduleName } = {}) {
    this._initializated = false;

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
    [this._readFile, this._readArguments, this._readEnvironment, this._fileSearchPlaces] =
      this._configNamespace.addOptions(CONFIG_OPTIONS);
  }

  async _loadFromFile() {
    if (this._readFile.value !== true) {
      return {};
    }
    return this._files.read(this._programmaticConfig, {
      searchPlaces: this._fileSearchPlaces.value,
    });
  }

  async _loadFromEnv() {
    if (this._readEnvironment.value !== true) {
      return {};
    }
    return this._environment.read(this._namespaces);
  }

  async _loadFromArgs({ allowUnknownOption }) {
    if (this._readArguments.value !== true) {
      return {};
    }
    return this._args.read(this._namespaces, { allowUnknownOption });
  }

  _mergeConfig() {
    this._config = deepMerge.all([
      this._programmaticConfig,
      this._fileConfig,
      this._envConfig,
      this._argsConfig,
    ]);
  }

  _validate({ allowUnknown }) {
    validateConfig(this._config, { namespaces: this._namespaces, allowUnknown });
  }

  _setNamespaces() {
    this._namespaces.forEach((namespace) => {
      namespace.set(this._config);
    });
  }

  _startNamespacesEvents() {
    this._namespaces.forEach((namespace) => {
      namespace.startEvents();
    });
  }

  _mergeValidateAndSetNamespaces({ allowUnknown }) {
    this._mergeConfig();
    this._validate({ allowUnknown });
    this._setNamespaces();
  }

  async _load({ allowUnknown = false } = {}) {
    this._mergeValidateAndSetNamespaces({ allowUnknown });
    this._argsConfig = await this._loadFromArgs({ allowUnknownOption: allowUnknown });
    this._mergeValidateAndSetNamespaces({ allowUnknown });
    this._envConfig = await this._loadFromEnv();
    this._mergeValidateAndSetNamespaces({ allowUnknown });

    // File does not change, so we only load it the first time
    if (!this._initializated) {
      this._fileConfig = await this._loadFromFile();
      // TODO, expose option for customizing this
      this._mergeValidateAndSetNamespaces({ allowUnknown });
      this._initializated = true;
    }
  }

  async init(programmaticConfig = {}) {
    this._programmaticConfig = deepMerge(this._programmaticConfig, programmaticConfig);
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
      }) || new Namespace(name, { brothers: this._namespaces });
    this._namespaces.push(namespace);
    return namespace;
  }

  namespace(name) {
    return findObjectWithName(this._namespaces, name);
  }

  option(name) {
    return findObjectWithName(this._rootNamespace.options, name);
  }
}

module.exports = Config;
