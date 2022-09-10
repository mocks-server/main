/*
Copyright 2021-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const path = require("path");

const fsExtra = require("fs-extra");
const yaml = require("yaml");
const { flatten, uniq } = require("lodash");

const YAML_EXTENSIONS = [".yaml", ".yml"];
const DEFAULT_EXTENSIONS = [".json", ".js", ".cjs"].concat(YAML_EXTENSIONS);
const BABEL_DEFAULT_EXTENSIONS = [".es6", ".es", ".esm", ".cjs", ".jsx", ".js", ".mjs", ".ts"];

function globuleExtensionPattern(srcGlob, extension) {
  return `${srcGlob}${extension}`;
}

function extensionsGlobulePatterns(srcGlob, extensions) {
  return extensions.map((extension) => {
    return globuleExtensionPattern(srcGlob, extension);
  });
}

function getGlobulePatterns(src, extensions) {
  const srcs = Array.isArray(src) ? src : [src];
  return uniq(
    flatten(
      srcs.map((srcGlob) => {
        return extensionsGlobulePatterns(srcGlob, extensions);
      })
    )
  );
}

function getFilesExtensions(babelRegister, babelRegisterOptions) {
  if (!!babelRegister) {
    if (babelRegisterOptions.extensions) {
      return DEFAULT_EXTENSIONS.concat(babelRegisterOptions.extensions);
    }
    return DEFAULT_EXTENSIONS.concat(BABEL_DEFAULT_EXTENSIONS);
  }
  return DEFAULT_EXTENSIONS;
}

function getFilesGlobule(src, babelRegister, babelRegisterOptions) {
  return getGlobulePatterns(src, uniq(getFilesExtensions(babelRegister, babelRegisterOptions)));
}

function babelRegisterOnlyFilter(collectionsFolder) {
  return (filePath) => {
    return filePath.indexOf(collectionsFolder) === 0;
  };
}

function babelRegisterDefaultOptions(collectionsFolder, babelRegisterOptions) {
  return {
    only: [babelRegisterOnlyFilter(collectionsFolder)],
    cache: false,
    extensions: BABEL_DEFAULT_EXTENSIONS,
    ...babelRegisterOptions,
  };
}

function validateFileContent(fileContent) {
  if (!Array.isArray(fileContent)) {
    return "File does not export an array";
  }
  return null;
}

function isYamlFile(filePath) {
  return YAML_EXTENSIONS.includes(path.extname(filePath));
}

function readYamlFile(filePath) {
  return fsExtra.readFile(filePath, "utf8").then((fileContent) => {
    return yaml.parse(fileContent);
  });
}

module.exports = {
  babelRegisterDefaultOptions,
  getFilesGlobule,
  validateFileContent,
  isYamlFile,
  readYamlFile,
};
