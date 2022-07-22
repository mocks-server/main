const {
  about,
  collections,
  collection,
  routes,
  route,
  variant,
  config,
  alerts,
  alert,
} = require("@mocks-server/admin-api-client-data-provider/dist/index.cjs");

const readAbout = () => {
  return about.read();
};

const readCollections = () => {
  return collections.read();
};

const readCollection = (name) => {
  return collection.queries.byId(name).read();
};

const readRoutes = () => {
  return routes.read();
};

const readRoute = (id) => {
  return route.queries.byId(id).read();
};

const readConfig = () => {
  return config.read();
};

const updateConfig = (newConfig) => {
  return config.update(newConfig);
};

const readAlerts = () => {
  return alerts.read();
};

const readAlert = (id) => {
  return alert.queries.byId(id).read();
};

const readVariant = (id) => {
  return variant.queries.byId(id).read();
};

module.exports = {
  readAbout,
  readCollections,
  readCollection,
  readRoutes,
  readRoute,
  readConfig,
  updateConfig,
  readAlerts,
  readAlert,
  readVariant,
};
