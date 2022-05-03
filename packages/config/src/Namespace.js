const Option = require("./Option");
const { types } = require("./types");

class Namespace {
  constructor(name, options = {}) {
    this._schema = options.schema;
    this._name = name;
    this._options = new Set();
  }

  addOption(optionProperties) {
    const option = new Option(optionProperties);
    this._options.add(option);
    return option;
  }

  addOptions(options) {
    return options.map((option) => this.addOption(option));
  }

  _schemaBasedOnOptions() {
    // TODO, move to validations file
    return Array.from(this._options).reduce(
      (schema, option) => {
        schema.properties[option.name] = {
          type: option.type.toLowerCase(),
        };
        return schema;
      },
      {
        type: "object",
        properties: {},
        additionalProperties: false,
      }
    );
  }

  init(configuration) {
    if (configuration) {
      this._options.forEach((option) => {
        if (option.type === types.OBJECT) {
          option.merge(configuration[option.name]);
        } else {
          option.value = configuration[option.name];
        }
      });
    }
  }

  get name() {
    return this._name;
  }

  get options() {
    return this._options;
  }

  get schema() {
    return this._schema || this._schemaBasedOnOptions();
  }
}

module.exports = Namespace;
