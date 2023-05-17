import { compact } from "lodash";

import type { UnknownObject, ObjectWithName } from "./Common.types";
import type { ConfigNamespaceInterface } from "./Config.types";
import type { OptionInterfaceGeneric } from "./Option.types";

export function namespaceAndParentNames(namespace: ConfigNamespaceInterface): string[] {
  const namespaceName = namespace.name;
  const isRoot = namespace.isRoot;
  const parentNames = namespace.parents.map((parentNamespace) => parentNamespace.name);
  return compact([...parentNames, isRoot ? undefined : namespaceName]);
}

export function findObjectWithName(
  objects: ConfigNamespaceInterface[],
  name: string
): ConfigNamespaceInterface | undefined;
export function findObjectWithName(
  objects: OptionInterfaceGeneric[],
  name: string
): OptionInterfaceGeneric | undefined;
export function findObjectWithName(
  objects: OptionInterfaceGeneric[] | ConfigNamespaceInterface[],
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
  {
    options,
    namespaces,
  }: { options: OptionInterfaceGeneric[]; namespaces: ConfigNamespaceInterface[] }
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
  {
    options,
    namespaces,
  }: { options: OptionInterfaceGeneric[]; namespaces: ConfigNamespaceInterface[] }
): void | never {
  if (options && findObjectWithName(options, name)) {
    throwOptionAlreadyExists(name);
  }
  if (namespaces && findObjectWithName(namespaces, name)) {
    throwNamespaceAlreadyExists(name);
  }
}

export function getOptionsValues(options: OptionInterfaceGeneric[]) {
  return options.reduce((values, option) => {
    values[option.name] = option.value;
    return values;
  }, {} as UnknownObject);
}

export function getNamespacesValues(namespaces: ConfigNamespaceInterface[]): UnknownObject {
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
  }, {} as UnknownObject);
}
