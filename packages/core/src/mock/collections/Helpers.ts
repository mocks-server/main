import type { RouteInterface } from "../routes/types";

function findBrotherRoute(
  routes: RouteInterface[],
  route: RouteInterface
): RouteInterface | undefined {
  return routes.find((candidateRoute) => {
    return candidateRoute.routeId === route.routeId;
  });
}

export function addRoutesToCollectionRoutes(
  collectionRoutes: RouteInterface[],
  routesToAdd: RouteInterface[]
): RouteInterface[] {
  const allRoutes: RouteInterface[] = [];

  const replacedCollectionRoutes = collectionRoutes.reduce((routes, collectionRoute) => {
    const routesToReplace = findBrotherRoute(routesToAdd, collectionRoute);
    routes.push(routesToReplace || collectionRoute);
    return routes;
  }, allRoutes);

  routesToAdd.forEach((routeToAdd) => {
    const hasBeenReplaced = !!findBrotherRoute(replacedCollectionRoutes, routeToAdd);
    if (!hasBeenReplaced) {
      replacedCollectionRoutes.push(routeToAdd);
    }
  });
  return replacedCollectionRoutes;
}
