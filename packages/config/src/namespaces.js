const { compact } = require("lodash");

function namespaceAndParentNames(namespace) {
  const namespaceName = namespace.name;
  const parentNames = namespace.parents.map((parentNamespace) => parentNamespace.name);
  return compact([...parentNames, namespaceName]);
}

function checkNamespaceName(name, omitValidation) {
  if (!name && !omitValidation) {
    throw new Error("Please provide a name for the namespace");
  }
}

module.exports = {
  namespaceAndParentNames,
  checkNamespaceName,
};
