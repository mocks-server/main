import { compact } from "lodash";

import type { AnyObject, ObjectWithName } from "./types/Common";
import type { Namespaces, Namespace } from "./types/Namespace";
import type { Options } from "./types/Option";

export function namespaceAndParentNames(namespace: Namespace): string[] {
  const namespaceName = namespace.name;
  const parentNames = namespace.parents.map((parentNamespace) => parentNamespace.name);
  return compact([...parentNames, namespaceName]);
}

export function findObjectWithName(objects: ObjectWithName[], name: string): ObjectWithName | undefined {
  return objects.find((object: ObjectWithName) => object.name === name);
}

function throwItemAlreadyExists(item: string, name: string): never {
  throw new Error(`${item} with name ${name} already exists`);
}

function throwOptionAlreadyExists(name: string): never {
  throwItemAlreadyExists("Option", name);
}

function throwNamespaceAlreadyExists(name: string): never {
  throwItemAlreadyExists("Namespace", name);
}

export function checkNamespaceName(name: string, { allowNoName, options, namespaces }: { allowNoName: boolean, options: Options, namespaces: Namespaces }): Namespace | undefined | never {
  if (!name && !allowNoName) {
    throw new Error("Please provide a name for the namespace");
  }
  if (options && findObjectWithName(options, name)) {
    throwOptionAlreadyExists(name);
  }
  return findObjectWithName(namespaces as ObjectWithName[], name) as Namespace | undefined;
}

export function checkOptionName(name: string, { options, namespaces }: { options: Options, namespaces: Namespaces }): void | never {
  if (options && findObjectWithName(options, name)) {
    throwOptionAlreadyExists(name);
  }
  if (namespaces && findObjectWithName(namespaces, name)) {
    throwNamespaceAlreadyExists(name);
  }
}

export function getOptionsValues(options: Options) {
  return options.reduce((values, option) => {
    values[option.name] = option.value;
    return values;
  }, {} as AnyObject);
}

export function getNamespacesValues(namespaces: Namespaces): AnyObject {
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
  }, {} as AnyObject);
}
