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

function modelMiddleware({ name, getItems, parseItem, tracer }) {
  const capitalizedName = capitalize(name);
  const returnItem = parseItem ? (item) => parseItem(item) : (item) => item;
  return function (req, res, next) {
    const id = req.params.id;
    tracer.verbose(`${PLUGIN_NAME}: Sending ${name} ${id} | ${req.id}`);
    const foundItem = getItems().find((item) => item.id === id);
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
