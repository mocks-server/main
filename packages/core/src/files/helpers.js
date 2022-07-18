/*
Copyright 2021-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const fsExtra = require("fs-extra");
const path = require("path");

// **/*
const COLLECTIONS_FILE_NAME = "collections";
// Legacy, to be removed
const LEGACY_COLLECTIONS_FILE_NAME = "mocks";
const DEFAULT_EXTENSIONS = [".json", ".js"];
const BABEL_DEFAULT_EXTENSIONS = [".es6", ".es", ".jsx", ".js", ".mjs", ".ts"];

function globuleExtensionPattern(extension) {
  return `**/*${extension}`;
}

function extensionsGlobulePatterns(extensions) {
  return extensions.map(globuleExtensionPattern);
}

function getGlobulePatterns(extensions) {
  return extensionsGlobulePatterns(extensions);
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

function getFilesGlobule(babelRegister, babelRegisterOptions) {
  return getGlobulePatterns(getFilesExtensions(babelRegister, babelRegisterOptions));
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

function collectionsFilePath(collectionsFolder, extension, fileName) {
  return path.resolve(collectionsFolder, `${fileName}${extension}`);
}

function collectionsFileNameToUse(
  collectionsFolder,
  babelRegister,
  babelRegisterOptions,
  fileName
) {
  const extensions = getFilesExtensions(babelRegister, babelRegisterOptions);

  const existentExtension = extensions.find((extension) => {
    return fsExtra.existsSync(collectionsFilePath(collectionsFolder, extension, fileName));
  });

  if (existentExtension) {
    return collectionsFilePath(collectionsFolder, existentExtension, fileName);
  }
  return null;
}

function collectionsFileToUse(collectionsFolder, babelRegister, babelRegisterOptions) {
  return (
    collectionsFileNameToUse(
      collectionsFolder,
      babelRegister,
      babelRegisterOptions,
      COLLECTIONS_FILE_NAME
    ) ||
    // LEGACY, to be removed
    collectionsFileNameToUse(
      collectionsFolder,
      babelRegister,
      babelRegisterOptions,
      LEGACY_COLLECTIONS_FILE_NAME
    )
  );
}

function validateFileContent(fileContent) {
  if (!Array.isArray(fileContent)) {
    return "File does not export an array";
  }
  return null;
}

module.exports = {
  collectionsFileToUse,
  babelRegisterDefaultOptions,
  getFilesGlobule,
  validateFileContent,
};
