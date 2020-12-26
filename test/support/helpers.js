import {
  about,
  behaviors,
  behavior,
  fixtures,
  fixture,
  settings,
  config,
  alerts,
  alert,
} from "../../index";

config({
  baseUrl: "http://localhost:3200",
});

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

const wait = (time = 1000) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
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
  wait,
};
