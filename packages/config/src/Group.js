const Namespace = require("./Namespace");

class Group {
  constructor(name) {
    this._name = name;
    this._namespaces = new Set();
  }

  get name() {
    return this._name;
  }

  get namespaces() {
    return this._namespaces;
  }

  _getGroupConfig(config) {
    if (this._name) {
      return config[this._name] || {};
    }
    return config;
  }

  init(config) {
    this._namespaces.forEach((namespace) => {
      namespace.init(this._getGroupConfig(config)[namespace.name]);
    });
  }

  addNamespace(name) {
    const namespace = new Namespace(name);
    this._namespaces.add(namespace);
    return namespace;
  }
}

module.exports = Group;
