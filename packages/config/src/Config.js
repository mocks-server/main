const deepMerge = require("deepmerge");

const CommandLineArguments = require("./CommandLineArguments");
const Environment = require("./Environment");
const Files = require("./Files");
const Group = require("./Group");
const { types } = require("./types");
const { validateConfig } = require("./validation");

const CONFIG_NAMESPACE = "config";

const CONFIG_OPTIONS = [
  {
    name: "readFile",
    description: "Read configuration file or not",
    type: types.BOOLEAN,
    default: true,
  },
];

class Config {
  constructor({ moduleName } = {}) {
    this._programmaticConfig = {};
    this._fileConfig = {};
    this._envConfig = {};
    this._argsConfig = {};

    this._files = new Files(moduleName);
    this._args = new CommandLineArguments();
    this._environment = new Environment(moduleName);

    this._groups = new Set();
    this._rootGroup = this.addGroup();

    this._configNamespace = this.addNamespace(CONFIG_NAMESPACE);
    [this._readFile] = this._configNamespace.addOptions(CONFIG_OPTIONS);
  }

  async _loadFromFile() {
    if (this._readFile.value !== true) {
      return {};
    }
    return this._files.read(this._programmaticConfig);
  }

  async _loadFromEnv() {
    return this._environment.read(this._groups);
  }

  async _loadFromArgs() {
    return this._args.read(this._groups);
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
    validateConfig(this._config, { groups: this._groups, allowAdditionalNamespaces });
  }

  _initGroups() {
    this._groups.forEach((group) => {
      group.init(this._config);
    });
  }

  _mergeValidateAndInitGroups({ allowAdditionalNamespaces }) {
    this._mergeConfig();
    this._validate({ allowAdditionalNamespaces });
    this._initGroups();
  }

  async _load({ allowAdditionalNamespaces = false } = {}) {
    this._argsConfig = await this._loadFromArgs();
    this._envConfig = await this._loadFromEnv();
    // The config namespace contains options needed before reading the config files
    this._mergeValidateAndInitGroups({ allowAdditionalNamespaces });
    this._fileConfig = await this._loadFromFile();
    // Init again after reading the config files
    this._mergeValidateAndInitGroups({ allowAdditionalNamespaces });
  }

  async init(programmaticConfig = {}) {
    this._programmaticConfig = deepMerge(this._programmaticConfig, programmaticConfig);
    await this._load({ allowAdditionalNamespaces: true });
  }

  async start() {
    // TODO, enable events
    await this._load();
  }

  addGroup(name) {
    // TODO, return root if no name is provided
    const group = new Group(name);
    this._groups.add(group);
    return group;
  }

  addNamespace(name) {
    return this._rootGroup.addNamespace(name);
  }
}

module.exports = Config;
