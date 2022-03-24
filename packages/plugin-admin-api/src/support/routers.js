/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const express = require("express");

const { addCollectionMiddleware, addModelMiddleware } = require("./middlewares");

function readCollectionAndModelRouter({ collectionName, modelName, getItems, tracer }) {
  const router = express.Router();
  addCollectionMiddleware(router, {
    name: collectionName,
    getItems,
    tracer,
  });
  addModelMiddleware(router, {
    name: modelName,
    getItems,
    tracer,
  });
  return router;
}

module.exports = {
  readCollectionAndModelRouter,
};
