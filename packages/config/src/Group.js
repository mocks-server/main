const Namespace = require("./Namespace");

class Group {
  constructor(name) {
    this._name = name;
    this._namespaces = new Set();
    this._rootNamespace = this.addNamespace();
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
      if (namespace.name) {
        namespace.init(this._getGroupConfig(config)[namespace.name]);
      } else {
        namespace.init(this._getGroupConfig(config));
      }
    });
  }

  addNamespace(name) {
    if (this._rootNamespace && !name) {
      return this._rootNamespace;
    }
    const namespace = new Namespace(name);
    this._namespaces.add(namespace);
    return namespace;
  }
}

module.exports = Group;
