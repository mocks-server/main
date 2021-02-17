/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const Boom = require("@hapi/boom");
const { PLUGIN_NAME } = require("./constants");

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function collectionMiddleware({ name, getItems, tracer }) {
  return function (req, res) {
    tracer.verbose(`${PLUGIN_NAME}: Sending ${name} | ${req.id}`);
    res.status(200);
    res.send(getItems());
  };
}

function modelMiddleware({ name, getItems, parseItem, tracer, finder }) {
  const capitalizedName = capitalize(name);
  const returnItem = parseItem ? (item) => parseItem(item) : (item) => item;
  const finderMethod = finder ? finder : (id) => (item) => item.id === id;
  return function (req, res, next) {
    const id = req.params.id;
    tracer.verbose(`${PLUGIN_NAME}: Sending ${name} ${id} | ${req.id}`);
    const foundItem = getItems().find(finderMethod(id));
    if (foundItem) {
      res.status(200);
      res.send(returnItem(foundItem));
    } else {
      next(Boom.notFound(`${capitalizedName} with id "${id}" was not found`));
    }
  };
}

function addCollectionMiddleware(router, options) {
  router.get("/", collectionMiddleware(options));
}

function addModelMiddleware(router, options) {
  router.get("/:id", modelMiddleware(options));
}

module.exports = {
  addCollectionMiddleware,
  addModelMiddleware,
};
