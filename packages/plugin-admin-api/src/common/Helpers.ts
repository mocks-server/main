/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import { readFileSync as fsReadFileSync } from "fs";
import path from "path";

import { ROOT_PATH } from "./Paths";

export const ALL_HOSTS = "0.0.0.0";
export const LOCALHOST = "localhost";
export const HTTPS_PROTOCOL = "https";
export const HTTP_PROTOCOL = "http";

let packageVersion: string;

export function serverUrl({
  host,
  port,
  protocol,
}: {
  host: string;
  port: number;
  protocol: string;
}) {
  const hostName = host === ALL_HOSTS ? LOCALHOST : host;
  return `${protocol}://${hostName}:${port}`;
}

export function readFileSync(filePath: string): string {
  return fsReadFileSync(filePath, "utf-8");
}

export function readPackageJson(): Record<string, unknown> {
  return JSON.parse(readFileSync(path.resolve(ROOT_PATH, "package.json")));
}

export function readPackageVersion(): string {
  if (packageVersion) {
    return packageVersion;
  }
  const version = readPackageJson().version as string;
  packageVersion = version;
  return version;
}
