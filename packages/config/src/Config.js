const deepMerge = require("deepmerge");

const Namespace = require("./Namespace");
const CommandLineArguments = require("./CommandLineArguments");
const Environment = require("./Environment");
const Files = require("./Files");

const CONFIG_NAMESPACE = "config";

const CONFIG_OPTIONS = [
  {
    name: "readFile",
    description: "Read configuration file or not",
    type: "boolean",
    default: true,
  },
];

class Config {
  constructor({ programmaticConfig = {} }) {
    this._programmaticConfig = { ...programmaticConfig };
    this._fileConfig = {};
    this._envConfig = {};
    this._argsConfig = {};

    this._files = new Files();
    this._args = new CommandLineArguments();
    this._environment = new Environment();

    this._namespaces = new Set();

    this._configNamespace = this.addNamespace(CONFIG_NAMESPACE);
    [this._readFile] = this._configNamespace.addOptions(CONFIG_OPTIONS);
  }

  async _loadFromFile() {
    if (this._readFile.value !== true) {
      return {};
    }
    return this._files.read();
  }

  async _loadFromEnv() {
    return this._environment.read();
  }

  async _loadFromArgs() {
    return this._args.read();
  }

  _mergeConfig() {
    return deepMerge(
      this._programmaticConfig,
      this._fileConfig,
      this._envConfig,
      this._argsConfig
    );
  }

  _initNamespaces() {
    this._namespaces.forEach((namespace) => {
      namespace.init(this._mergeConfig());
    });
  }

  async _load() {
    this._argsConfig = await this._loadFromArgs();
    this._envConfig = await this._loadFromEnv();
    // The config namespace contains options needed before reading the config files
    this._initNamespaces();
    this._fileConfig = await this._loadFromFile();
    // Init again after reading the config files
    this._initNamespaces();
  }

  async init(programmaticConfig) {
    this._programmaticConfig = deepMerge(this._programmaticConfig, programmaticConfig);
    await this._load();
  }

  addNamespace(name) {
    const namespace = new Namespace(name);
    this._namespaces.add(namespace);
    return namespace;
  }
}

module.exports = Config;
