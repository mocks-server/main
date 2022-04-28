const {
  about,
  mocks,
  mock,
  routes,
  route,
  routeVariant,
  settings,
  alerts,
  alert,
} = require("@mocks-server/admin-api-client-data-provider/dist/index.cjs");

const readAbout = () => {
  return about.read();
};

const readMocks = () => {
  return mocks.read();
};

const readMock = (name) => {
  return mock(name).read();
};

const readRoutes = () => {
  return routes.read();
};

const readRoute = (id) => {
  return route(id).read();
};

const readSettings = () => {
  return settings.read();
};

const updateSettings = (newSettings) => {
  return settings.update(newSettings);
};

const readAlerts = () => {
  return alerts.read();
};

const readAlert = (id) => {
  return alert(id).read();
};

const readRouteVariant = (id) => {
  return routeVariant(id).read();
};

module.exports = {
  readAbout,
  readMocks,
  readMock,
  readRoutes,
  readRoute,
  readSettings,
  updateSettings,
  readAlerts,
  readAlert,
  readRouteVariant,
};
