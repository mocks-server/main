/*
Copyright 2021-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

function arrayMerge(_destinationArray, sourceArray) {
  return sourceArray;
}

function docsUrl(url) {
  return `https://www.mocks-server.org/docs/${url}`;
}

function deprecatedMessage(type, oldName, newName, url) {
  return `Usage of '${oldName}' ${type} is deprecated. Use '${newName}' instead: ${docsUrl(url)}`;
}

module.exports = {
  arrayMerge,
  deprecatedMessage,
  docsUrl,
};
