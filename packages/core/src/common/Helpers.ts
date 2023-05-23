/*
Copyright 2021-2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import fs from "fs";
import path from "path";

import type { ResolveWhenConditionPassOptions } from "./Helpers.types";

export function arrayMerge(_destinationArray: unknown[], sourceArray: unknown[]) {
  return sourceArray;
}

export function docsUrl(url: string): string {
  return `https://www.mocks-server.org/docs/${url}`;
}

export function deprecatedMessage(type: string, oldName: string, newName: string, url: string) {
  return `Usage of '${oldName}' ${type} is deprecated. Use '${newName}' instead: ${docsUrl(url)}`;
}

export function resolveWhenConditionPass(
  condition: () => boolean,
  { interval = 200, timeout = 2000 }: ResolveWhenConditionPassOptions = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    const checkConditionInterval = setInterval(() => {
      if (condition() === true) {
        clearTimeout(checkConditionTimeout);
        clearInterval(checkConditionInterval);
        resolve();
      }
    }, interval);
    const checkConditionTimeout = setTimeout(() => {
      clearInterval(checkConditionInterval);
      reject(new Error());
    }, timeout);
  });
}

export function readFileSync(filePath: string): string {
  //eslint-disable-next-line import/namespace
  return fs.readFileSync(path.resolve(process.cwd(), filePath), "utf-8");
}

export function toLowerCase(str: string): string {
  return str.toLowerCase();
}

export function arrayToLowerCase(array: string[]): string[] {
  return array.map(toLowerCase);
}

export function objectKeys<Type>(obj: object): (keyof Type)[] {
  return Object.keys(obj) as (keyof Type)[];
}

export function arrayLowerAndUpper(array: string[]): string[] {
  return array.concat(arrayToLowerCase(array));
}
