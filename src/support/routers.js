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
