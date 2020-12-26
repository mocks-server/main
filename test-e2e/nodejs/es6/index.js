const {
  about,
  behaviors,
  behavior,
  fixtures,
  fixture,
  settings,
  alerts,
  alert,
} = require("../../../dist/index.cjs");

const readAbout = () => {
  return about.read();
};

const readBehaviors = () => {
  return behaviors.read();
};

const readBehavior = (name) => {
  return behavior(name).read();
};

const readFixtures = () => {
  return fixtures.read();
};

const readFixture = (id) => {
  return fixture(id).read();
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

module.exports = {
  readAbout,
  readBehaviors,
  readBehavior,
  readFixtures,
  readFixture,
  readSettings,
  updateSettings,
  readAlerts,
  readAlert,
};
