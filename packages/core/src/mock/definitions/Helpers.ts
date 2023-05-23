/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import {
  isFunction,
  isRegExp,
  isBuffer,
  isArrayBuffer,
  isDate,
  isError,
  isMap,
  isSet,
  isSymbol,
  isWeakMap,
  isWeakSet,
} from "lodash";

function typeOfNonSerializable(value: unknown): string {
  if (isRegExp(value)) {
    return "RegExp";
  }
  if (isDate(value)) {
    return "Date";
  }
  if (isFunction(value)) {
    return "Function";
  }
  if (isBuffer(value)) {
    return "Buffer";
  }
  if (isArrayBuffer(value)) {
    return "ArrayBuffer";
  }
  if (isMap(value)) {
    return "Map";
  }
  if (isSet(value)) {
    return "Set";
  }
  if (isSymbol(value)) {
    return "Symbol";
  }
  if (isWeakMap(value)) {
    return "WeakMap";
  }
  if (isWeakSet(value)) {
    return "WeakSet";
  }
  return typeof value;
}

function nonSerializableValue(value: unknown): string {
  if (isRegExp(value) || isDate(value) || isFunction(value)) {
    return value.toString();
  }
  if (isMap(value) || isSet(value)) {
    return JSON.stringify(replaceNonSerializableValues(Array.from(value.entries())));
  }
  return (value as string).toString();
}

function representNonSerializable(value: unknown): string {
  return `[${typeOfNonSerializable(value)}: ${nonSerializableValue(value)}]`;
}

export function replaceNonSerializableValues<Type>(object: Type): Type {
  return JSON.parse(
    JSON.stringify(object, (_key, value) => {
      if (
        isRegExp(value) ||
        isDate(value) ||
        isError(value) ||
        isFunction(value) ||
        isMap(value) ||
        isSet(value)
      ) {
        return representNonSerializable(value);
      }
      if (isError(value)) {
        return `[${value.toString()}]`;
      }
      if (
        isBuffer(value) ||
        isArrayBuffer(value) ||
        isSymbol(value) ||
        isWeakMap(value) ||
        isWeakSet(value)
      ) {
        return `[${typeOfNonSerializable(value)}]`;
      }
      return value;
    })
  );
}
