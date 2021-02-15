import {
  about,
  behaviors,
  behavior,
  fixtures,
  fixture,
  settings,
  alerts,
  alert,
  mocks,
  mock,
  routes,
  route,
  routesVariants,
  routeVariant,
  mockCustomRoutesVariants,
} from "./entities";

export function readAbout() {
  return about.read();
}

export function readSettings() {
  return settings.read();
}

export function updateSettings(newSettings) {
  return settings.update(newSettings);
}

export function readAlerts() {
  return alerts.read();
}

export function readAlert(id) {
  return alert(id).read();
}

export function readMocks() {
  return mocks.read();
}

export function readMock(id) {
  return mock(id).read();
}

export function readRoutes() {
  return routes.read();
}

export function readRoute(id) {
  return route(id).read();
}

export function readRoutesVariants() {
  return routesVariants.read();
}

export function readRouteVariant(id) {
  return routeVariant(id).read();
}

export function readMockCustomRoutesVariants() {
  return mockCustomRoutesVariants.read();
}

export function addMockCustomRouteVariant(id) {
  return mockCustomRoutesVariants.create({
    id,
  });
}

export function restoreMockRoutesVariants() {
  return mockCustomRoutesVariants.delete();
}

// legacy

export function readBehaviors() {
  return behaviors.read();
}

export function readBehavior(name) {
  return behavior(name).read();
}

export function readFixtures() {
  return fixtures.read();
}

export function readFixture(id) {
  return fixture(id).read();
}
