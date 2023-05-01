import type { RouteInterface, RouteInterfaceWithRouter } from "./Route.types";

export function routeHandlerIsRouter(route: RouteInterface): route is RouteInterfaceWithRouter {
  return (route as RouteInterfaceWithRouter).router !== undefined;
}
