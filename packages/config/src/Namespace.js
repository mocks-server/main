const EventEmitter = require("events");

const Option = require("./Option");
const {
  checkNamespaceName,
  checkOptionName,
  findObjectWithName,
  getNamespacesValues,
  getOptionsValues,
} = require("./namespaces");

class Namespace {
  constructor(name, { parents = [], brothers, root }) {
    this._brothers = brothers;
    this._parents = parents;
    this._root = root;
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

  _setOptions(configuration, options) {
    this._options.forEach((option) => {
      option.set(configuration[option.name], options);
    });
  }

  set(configuration = {}, options = {}) {
    this._setOptions(configuration, options);
    this._namespaces.forEach((namespace) => {
      namespace.set(configuration[namespace.name] || {}, options);
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
      new Namespace(name, { parents: [...this._parents, this], root: this._root });
    this._namespaces.push(namespace);
    return namespace;
  }

  get name() {
    return this._name;
  }

  get parents() {
    return [...this._parents];
  }

  get root() {
    return this._root;
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

  set value(configuration) {
    this.set(configuration);
  }

  namespace(name) {
    return findObjectWithName(this._namespaces, name);
  }

  option(name) {
    return findObjectWithName(this._options, name);
  }
}

module.exports = Namespace;
