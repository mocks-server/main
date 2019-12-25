const {
  about,
  behaviorsCollection,
  behaviorsModel,
  fixturesCollection,
  fixturesModel,
  settings
} = require("../../../dist/index.cjs");

const readAbout = () => {
  return about.read();
};

const readBehaviors = () => {
  return behaviorsCollection.read();
};

const readBehavior = name => {
  return behaviorsModel.findByName(name).read();
};

const readFixtures = () => {
  return fixturesCollection.read();
};

const readFixture = id => {
  return fixturesModel.findById(id).read();
};

const readSettings = () => {
  return settings.read();
};

const updateSettings = newSettings => {
  return settings.update(newSettings);
};

module.exports = {
  readAbout,
  readBehaviors,
  readBehavior,
  readFixtures,
  readFixture,
  readSettings,
  updateSettings
};
