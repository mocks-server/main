const deepMerge = require("deepmerge");
const Ajv = require("ajv");
const betterAjvErrors = require("better-ajv-errors").default;

const Namespace = require("./Namespace");
const CommandLineArguments = require("./CommandLineArguments");
const Environment = require("./Environment");
const Files = require("./Files");
const { types } = require("./types");

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
    return this._environment.read(this._namespaces);
  }

  async _loadFromArgs() {
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

  _validate() {
    // TODO, move to validations file
    const ajv = new Ajv({ allErrors: true });
    const schema = Array.from(this._namespaces).reduce(
      (fullSchema, namespace) => {
        fullSchema.properties[namespace.name] = namespace.schema;
        return fullSchema;
      },
      {
        type: "object",
        properties: {},
        additionalProperties: false,
      }
    );
    const validateProperties = ajv.compile(schema);
    const valid = validateProperties(this._config);
    if (!valid) {
      throw new Error(betterAjvErrors(schema, this._config, validateProperties.errors));
    }
  }

  _initNamespaces() {
    this._namespaces.forEach((namespace) => {
      namespace.init(this._config[namespace.name]);
    });
  }

  _mergeValidateAndInitNamespaces() {
    this._mergeConfig();
    this._validate();
    this._initNamespaces();
  }

  async _load() {
    this._argsConfig = await this._loadFromArgs();
    this._envConfig = await this._loadFromEnv();
    // The config namespace contains options needed before reading the config files
    this._mergeValidateAndInitNamespaces();
    this._fileConfig = await this._loadFromFile();
    // Init again after reading the config files
    this._mergeValidateAndInitNamespaces();
  }

  async init(programmaticConfig = {}) {
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
