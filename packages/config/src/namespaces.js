const { compact } = require("lodash");

function namespaceAndParentNames(namespace) {
  const namespaceName = namespace.name;
  const parentNames = namespace.parents.map((parentNamespace) => parentNamespace.name);
  return compact([...parentNames, namespaceName]);
}

function findObjectWithName(objects, name) {
  return objects.find((object) => object.name === name);
}

function throwItemAlreadyExists(item, name) {
  throw new Error(`${item} with name ${name} already exists`);
}

function throwOptionAlreadyExists(name) {
  throwItemAlreadyExists("Option", name);
}

function throwNamespaceAlreadyExists(name) {
  throwItemAlreadyExists("Namespace", name);
}

function checkNamespaceName(name, { allowNoName, options, namespaces }) {
  if (!name && !allowNoName) {
    throw new Error("Please provide a name for the namespace");
  }
  if (options && findObjectWithName(options, name)) {
    throwOptionAlreadyExists(name);
  }
  return findObjectWithName(namespaces, name);
}

function checkOptionName(name, { options, namespaces }) {
  if (options && findObjectWithName(options, name)) {
    throwOptionAlreadyExists(name);
  }
  if (namespaces && findObjectWithName(namespaces, name)) {
    throwNamespaceAlreadyExists(name);
  }
}

function getOptionsValues(options) {
  return options.reduce((values, option) => {
    values[option.name] = option.value;
    return values;
  }, {});
}

function getNamespacesValues(namespaces) {
  return namespaces.reduce((values, namespace) => {
    const namespaceValues = namespace.value;
    if (namespace.name) {
      values[namespace.name] = namespaceValues;
    } else {
      values = {
        ...values,
        ...namespaceValues,
      };
    }
    return values;
  }, {});
}

module.exports = {
  namespaceAndParentNames,
  checkNamespaceName,
  checkOptionName,
  findObjectWithName,
  getNamespacesValues,
  getOptionsValues,
};
