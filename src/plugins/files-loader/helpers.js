/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const fsExtra = require("fs-extra");

// **/*

const DEFAULT_EXTENSIONS = [".js", ".json"];
const BABEL_DEFAULT_EXTENSIONS = [".es6", ".es", ".jsx", ".js", ".mjs", ".ts"];

const globuleExtensionPattern = (extension) => `**/*${extension}`;

const extensionsGlobulePatterns = (extensions) => {
  return extensions.map(globuleExtensionPattern);
};

const addDefaultExtensionsAndGetGlobulePatterns = (extensions) => {
  return extensionsGlobulePatterns(extensions.concat(DEFAULT_EXTENSIONS));
};

const getFilesGlobule = (babelRegister, babelRegisterOptions) => {
  if (!!babelRegister) {
    if (babelRegisterOptions.extensions) {
      return addDefaultExtensionsAndGetGlobulePatterns(babelRegisterOptions.extensions);
    }
    return addDefaultExtensionsAndGetGlobulePatterns(BABEL_DEFAULT_EXTENSIONS);
  }
  return extensionsGlobulePatterns(DEFAULT_EXTENSIONS);
};

const babelRegisterOnlyFilter = (resolvedFolder) => {
  return (filePath) => {
    return filePath.indexOf(resolvedFolder) === 0;
  };
};

const babelRegisterDefaultOptions = (resolvedFolder, babelRegisterOptions) => {
  return {
    only: [babelRegisterOnlyFilter(resolvedFolder)],
    cache: false,
    extensions: BABEL_DEFAULT_EXTENSIONS,
    ...babelRegisterOptions,
  };
};

function mocksFileToUse(mocksFileJs, mocksFileJson) {
  if (fsExtra.existsSync(mocksFileJs)) {
    return mocksFileJs;
  }
  if (fsExtra.existsSync(mocksFileJson)) {
    return mocksFileJson;
  }
  return null;
}

module.exports = {
  mocksFileToUse,
  babelRegisterDefaultOptions,
  getFilesGlobule,
};
