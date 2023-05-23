/*
Copyright 2021-2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import path from "path";

import type { RegisterOptions } from "@babel/register";
import { readFile } from "fs-extra";
import { flatten, uniq } from "lodash";
import yaml from "yaml";

import type { FileLoaded, ErrorLoadingFile } from "./FilesLoader.types";

const YAML_EXTENSIONS = [".yaml", ".yml"];
const DEFAULT_EXTENSIONS = [".json", ".js", ".cjs"].concat(YAML_EXTENSIONS);
const BABEL_DEFAULT_EXTENSIONS = [".es6", ".es", ".esm", ".cjs", ".jsx", ".js", ".mjs", ".ts"];

function globuleExtensionPattern(srcGlob: string, extension: string): string {
  return `${srcGlob}${extension}`;
}

function extensionsGlobulePatterns(srcGlob: string, extensions: string[]): string[] {
  return extensions.map((extension) => {
    return globuleExtensionPattern(srcGlob, extension);
  });
}

function getGlobulePatterns(src: string | string[], extensions: string[]): string[] {
  const srcs = Array.isArray(src) ? src : [src];
  return uniq(
    flatten(
      srcs.map((srcGlob) => {
        return extensionsGlobulePatterns(srcGlob, extensions);
      })
    )
  );
}

function getFilesExtensions(
  babelRegister: boolean,
  babelRegisterOptions: RegisterOptions
): string[] {
  if (babelRegister) {
    if (babelRegisterOptions.extensions) {
      return DEFAULT_EXTENSIONS.concat(babelRegisterOptions.extensions);
    }
    return DEFAULT_EXTENSIONS.concat(BABEL_DEFAULT_EXTENSIONS);
  }
  return DEFAULT_EXTENSIONS;
}

export function getFilesGlobule(
  src: string | string[],
  babelRegister: boolean,
  babelRegisterOptions: RegisterOptions
) {
  return getGlobulePatterns(src, uniq(getFilesExtensions(babelRegister, babelRegisterOptions)));
}

export function babelRegisterOnlyFilter(
  collectionsFolder: string
): (filePath?: string) => boolean {
  return (filePath?: string): boolean => {
    return filePath ? filePath.indexOf(collectionsFolder) === 0 : false;
  };
}

export function babelRegisterDefaultOptions(
  collectionsFolder: string,
  babelRegisterOptions: RegisterOptions
): RegisterOptions {
  return {
    only: [babelRegisterOnlyFilter(collectionsFolder)],
    cache: false,
    extensions: BABEL_DEFAULT_EXTENSIONS,
    ...babelRegisterOptions,
  };
}

export function validateFileContent(fileContent: unknown): string | null {
  if (!Array.isArray(fileContent)) {
    return "File does not export an array";
  }
  return null;
}

export function isYamlFile(filePath: string): boolean {
  return YAML_EXTENSIONS.includes(path.extname(filePath));
}

export function readYamlFile(filePath: string): Promise<unknown> {
  return readFile(filePath, "utf8").then((fileContent) => {
    return yaml.parse(fileContent);
  });
}

export function isFileLoaded(file: FileLoaded | ErrorLoadingFile): file is FileLoaded {
  return (file as FileLoaded).content !== undefined;
}

export function isErrorLoadingFile(file: FileLoaded | ErrorLoadingFile): file is ErrorLoadingFile {
  return (file as ErrorLoadingFile).error !== undefined;
}
