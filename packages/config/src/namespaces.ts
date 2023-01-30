import { compact } from "lodash";

import type { AnyObject, ObjectWithName } from "./CommonTypes";
import type { NamespaceInterface } from "./ConfigTypes";
import type { OptionInterface } from "./OptionTypes";

export function namespaceAndParentNames(namespace: NamespaceInterface): string[] {
  const namespaceName = namespace.name;
  const isRoot = namespace.isRoot;
  const parentNames = namespace.parents.map((parentNamespace) => parentNamespace.name);
  return compact([...parentNames, isRoot ? undefined : namespaceName]);
}

export function findObjectWithName(
  objects: NamespaceInterface[],
  name: string
): NamespaceInterface | undefined;
export function findObjectWithName(
  objects: OptionInterface[],
  name: string
): OptionInterface | undefined;
export function findObjectWithName(
  objects: OptionInterface[] | NamespaceInterface[],
  name: string
) {
  const objectsToSearch = objects as ObjectWithName[];
  return objectsToSearch.find((object) => object.name === name);
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

export function checkNamespaceName(
  name: string,
  { options, namespaces }: { options: OptionInterface[]; namespaces: NamespaceInterface[] }
): void | never {
  if (!name) {
    throw new Error("Please provide a name for the namespace");
  }
  if (options && findObjectWithName(options, name)) {
    throwOptionAlreadyExists(name);
  }
  if (findObjectWithName(namespaces, name)) {
    throwNamespaceAlreadyExists(name);
  }
}

export function checkOptionName(
  name: string,
  { options, namespaces }: { options: OptionInterface[]; namespaces: NamespaceInterface[] }
): void | never {
  if (options && findObjectWithName(options, name)) {
    throwOptionAlreadyExists(name);
  }
  if (namespaces && findObjectWithName(namespaces, name)) {
    throwNamespaceAlreadyExists(name);
  }
}

export function getOptionsValues(options: OptionInterface[]) {
  return options.reduce((values, option) => {
    values[option.name] = option.value;
    return values;
  }, {} as AnyObject);
}

export function getNamespacesValues(namespaces: NamespaceInterface[]): AnyObject {
  return namespaces.reduce((values, namespace) => {
    const namespaceValues = namespace.value;
    if (!namespace.isRoot) {
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
