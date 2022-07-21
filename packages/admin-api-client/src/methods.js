import {
  about,
  config,
  alerts,
  alert,
  collections,
  collection,
  routes,
  route,
  variants,
  variant,
  customRouteVariants,
} from "./entities";

export function readAbout() {
  return about.read();
}

export function readConfig() {
  return config.read();
}

export function updateConfig(newConfig) {
  return config.update(newConfig);
}

export function readAlerts() {
  return alerts.read();
}

export function readAlert(id) {
  return alert(id).read();
}

export function readCollections() {
  return collections.read();
}

export function readCollection(id) {
  return collection(id).read();
}

export function readRoutes() {
  return routes.read();
}

export function readRoute(id) {
  return route(id).read();
}

export function readVariants() {
  return variants.read();
}

export function readVariant(id) {
  return variant(id).read();
}

export function readCustomRouteVariants() {
  return customRouteVariants.read();
}

export function useRouteVariant(id) {
  return customRouteVariants.create({
    id,
  });
}

export function restoreRouteVariants() {
  return customRouteVariants.delete();
}
