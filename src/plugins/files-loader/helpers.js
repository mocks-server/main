/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const fsExtra = require("fs-extra");
const path = require("path");

// **/*
const MOCKS_FILE_NAME = "mocks";
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

function babelRegisterOnlyFilter(mocksFolder) {
  return (filePath) => {
    return filePath.indexOf(mocksFolder) === 0;
  };
}

function babelRegisterDefaultOptions(mocksFolder, babelRegisterOptions) {
  return {
    only: [babelRegisterOnlyFilter(mocksFolder)],
    cache: false,
    extensions: BABEL_DEFAULT_EXTENSIONS,
    ...babelRegisterOptions,
  };
}

function mocksFilePath(mocksFolder, extension) {
  return path.resolve(mocksFolder, `${MOCKS_FILE_NAME}${extension}`);
}

function mocksFileToUse(mocksFolder, babelRegister, babelRegisterOptions) {
  const extensions = getFilesExtensions(babelRegister, babelRegisterOptions);

  const existentExtension = extensions.find((extension) => {
    return fsExtra.existsSync(mocksFilePath(mocksFolder, extension));
  });

  if (existentExtension) {
    return mocksFilePath(mocksFolder, existentExtension);
  }
  return null;
}

function validateFileContent(fileContent) {
  if (!Array.isArray(fileContent)) {
    return "File does not export an array";
  }
  return null;
}

module.exports = {
  mocksFileToUse,
  babelRegisterDefaultOptions,
  getFilesGlobule,
  validateFileContent,
};
