const deepMerge = require("deepmerge");

const CommandLineArguments = require("./CommandLineArguments");
const Environment = require("./Environment");
const Files = require("./Files");
const Namespace = require("./Namespace");
const { types } = require("./types");
const { validateConfig } = require("./validation");
const { checkNamespaceName } = require("./namespaces");

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

    this._namespaces = new Set();
    this._rootNamespace = this.addNamespace();
    this.addOption = this._rootNamespace.addOption.bind(this._rootNamespace);
    this.addOptions = this._rootNamespace.addOptions.bind(this._rootNamespace);
    // TODO, remove?
    this.onChange = this._rootNamespace.onChange.bind(this._rootNamespace);

    this._configNamespace = this.addNamespace(CONFIG_NAMESPACE);
    [this._readFile, this._readArguments, this._readEnvironment] =
      this._configNamespace.addOptions(CONFIG_OPTIONS);
  }

  async _loadFromFile() {
    if (this._readFile.value !== true) {
      return {};
    }
    return this._files.read(this._programmaticConfig);
  }

  async _loadFromEnv() {
    if (this._readEnvironment.value !== true) {
      return {};
    }
    return this._environment.read(this._namespaces);
  }

  async _loadFromArgs() {
    if (this._readArguments.value !== true) {
      return {};
    }
    return this._args.read(this._namespaces);
  }

  _mergeConfig() {
    this._config = deepMerge.all([
      this._programmaticConfig,
      this._fileConfig,
      this._envConfig,
      this._argsConfig,
    ]);
  }

  _validate({ allowAdditionalNamespaces }) {
    validateConfig(this._config, { namespaces: this._namespaces, allowAdditionalNamespaces });
  }

  _initNamespaces() {
    this._namespaces.forEach((namespace) => {
      namespace.init(this._config);
    });
  }

  _startNamespaces() {
    this._namespaces.forEach((namespace) => {
      namespace.start();
    });
  }

  _mergeValidateAndInitNamespaces({ allowAdditionalNamespaces }) {
    this._mergeConfig();
    this._validate({ allowAdditionalNamespaces });
    this._initNamespaces();
  }

  async _load({ allowAdditionalNamespaces = false } = {}) {
    this._mergeValidateAndInitNamespaces({ allowAdditionalNamespaces });
    this._argsConfig = await this._loadFromArgs();
    this._mergeValidateAndInitNamespaces({ allowAdditionalNamespaces });
    this._envConfig = await this._loadFromEnv();
    this._mergeValidateAndInitNamespaces({ allowAdditionalNamespaces });

    // File does not change, so we only load it the first time
    if (!this._initializated) {
      this._fileConfig = await this._loadFromFile();
      this._mergeValidateAndInitNamespaces({ allowAdditionalNamespaces });
      this._initializated = true;
    }
  }

  async init(programmaticConfig = {}) {
    this._programmaticConfig = deepMerge(this._programmaticConfig, programmaticConfig);
    await this._load({ allowAdditionalNamespaces: true });
  }

  async start(programmaticConfig) {
    if (!this._initializated) {
      await this.init(programmaticConfig);
    }
    await this._load();
    this._startNamespaces();
  }

  addNamespace(name) {
    const namespace =
      checkNamespaceName(name, {
        namespaces: this._namespaces,
        options: this._rootNamespace && this._rootNamespace.options,
        allowNoName: !this._rootNamespace,
      }) || new Namespace(name, { brothers: this._namespaces });
    this._namespaces.add(namespace);
    return namespace;
  }
}

module.exports = Config;
