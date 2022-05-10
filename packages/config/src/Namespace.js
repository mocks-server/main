const { isEqual, isUndefined } = require("lodash");
const EventEmitter = require("events");

const Option = require("./Option");
const { types } = require("./types");
const {
  checkNamespaceName,
  checkOptionName,
  findObjectWithName,
  getNamespacesValues,
  getOptionsValues,
} = require("./namespaces");

class Namespace {
  constructor(name, { parents = [], brothers }) {
    this._brothers = brothers;
    this._parents = parents;
    this._eventEmitter = new EventEmitter();
    this._name = name;
    this._namespaces = [];
    this._options = [];
    this._started = false;
  }

  addOption(optionProperties) {
    checkOptionName(optionProperties.name, {
      options: this._options,
      namespaces: this._name ? this._namespaces : this._brothers,
    });
    const option = new Option(optionProperties);
    this._options.push(option);
    return option;
  }

  addOptions(options) {
    return options.map((option) => this.addOption(option));
  }

  _setOptions(configuration) {
    const changedOptions = [];
    if (configuration) {
      this._options.forEach((option) => {
        if (!isUndefined(configuration[option.name])) {
          const previousValue = option.value;
          if (option.type === types.OBJECT) {
            option.merge(configuration[option.name]);
          } else {
            option.value = configuration[option.name];
          }
          if (!isEqual(previousValue, option.value)) {
            changedOptions.push(option);
          }
        }
      });
    }
    return changedOptions;
  }

  set(configuration) {
    this._setOptions(configuration);
    this._namespaces.forEach((namespace) => {
      namespace.set(configuration[namespace.name] || {});
    });
  }

  startEvents() {
    this._options.forEach((option) => option.startEvents());
    this._namespaces.forEach((namespace) => namespace.startEvents());
    this._started = true;
  }

  addNamespace(name) {
    const namespace =
      checkNamespaceName(name, { namespaces: this._namespaces, options: this._options }) ||
      new Namespace(name, { parents: [...this._parents, this] });
    this._namespaces.push(namespace);
    return namespace;
  }

  get name() {
    return this._name;
  }

  get parents() {
    return [...this._parents];
  }

  get namespaces() {
    return [...this._namespaces];
  }

  get options() {
    return [...this._options];
  }

  get value() {
    return {
      ...getNamespacesValues(this._namespaces),
      ...getOptionsValues(this._options),
    };
  }

  namespace(name) {
    return findObjectWithName(this._namespaces, name);
  }

  option(name) {
    return findObjectWithName(this._options, name);
  }
}

module.exports = Namespace;
