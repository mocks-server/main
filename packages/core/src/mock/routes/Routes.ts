/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { OptionProperties, NamespaceInterface, OptionInterface } from "@mocks-server/config";
import type { LoggerInterface } from "@mocks-server/logger";
import { flatten, compact, isUndefined } from "lodash";

import type { AlertsInterface } from "../../alerts/Alerts.types";
import { ScopedCore } from "../../common/ScopedCore";
import type { ScopedCoreInterface } from "../../common/ScopedCore.types";
import type { CoreInterface } from "../../Core.types";
import { getHandlerId, getOptionsFromVariant } from "../../variant-handlers/helpers";
import type {
  VariantHandlerConstructor,
  VariantHandlerId,
  VariantHandlerInterface,
} from "../../variant-handlers/VariantHandlers.types";
import { routeValidationErrors, variantValidationErrors } from "../validations";

import { Route } from "./Route";
import type { RouteDefinition, RouteDefinitionId, RouteId, RouteInterface } from "./Route.types";
import type { RoutesConstructor, RoutesInterface, RoutesOptions } from "./Routes.types";

const LOAD_NAMESPACE = "load";

const OPTIONS: OptionProperties[] = [
  {
    description: "Global delay to apply to routes",
    name: "delay",
    type: "number",
    default: 0,
  },
];

function getRouteId(
  routeDefinitionId: RouteDefinitionId,
  variantDefinitionId: MocksServer.VariantDefinitionId
): RouteId {
  return `${routeDefinitionId}:${variantDefinitionId}`;
}

function findVariantHandler(
  variantHandlers: VariantHandlerConstructor[],
  handlerId: VariantHandlerId
): VariantHandlerConstructor | undefined {
  return variantHandlers.find(
    (variantHandlerCandidate) => variantHandlerCandidate.id === handlerId
  );
}

function hasDelayProperty(
  routeOrVariantDefinition: RouteDefinition | MocksServer.VariantDefinition
): boolean {
  return routeOrVariantDefinition.hasOwnProperty("delay"); // eslint-disable-line no-prototype-builtins
}

function getRouteDelay(
  variantDefinition: MocksServer.VariantDefinition,
  routeDefinition: RouteDefinition
): number | null {
  if (hasDelayProperty(variantDefinition) && !isUndefined(variantDefinition.delay)) {
    return variantDefinition.delay;
  }
  if (hasDelayProperty(routeDefinition) && !isUndefined(routeDefinition.delay)) {
    return routeDefinition.delay;
  }
  return null;
}

// TODO, add to data model, migrate routes logic here

export const Routes: RoutesConstructor = class Routes implements RoutesInterface {
  private _logger: LoggerInterface;
  private _loggerLoad: LoggerInterface;
  private _alerts: AlertsInterface;
  private _alertsLoad: AlertsInterface;
  private _config: NamespaceInterface;
  private _delayOption: OptionInterface;
  private _getPlainRoutes: RoutesOptions["getPlainRoutes"];
  private _getPlainVariants: RoutesOptions["getPlainVariants"];
  private _variantHandlers: VariantHandlerConstructor[];
  private _core: CoreInterface;
  private _routes: RouteInterface[];

  static get id(): string {
    return "routes";
  }

  constructor(
    { alerts, logger, config, onChange, getPlainRoutes, getPlainVariants }: RoutesOptions,
    core: CoreInterface
  ) {
    this._routes = [];

    this._core = core; // Used only to create Scoped cores for route handlers

    this._config = config;
    this._alerts = alerts;
    this._alertsLoad = this._alerts.collection(LOAD_NAMESPACE);
    this._logger = logger;
    this._loggerLoad = this._logger.namespace(LOAD_NAMESPACE);

    this._getPlainRoutes = getPlainRoutes;
    this._getPlainVariants = getPlainVariants;

    [this._delayOption] = this._config.addOptions(OPTIONS);
    this._delayOption.onChange(onChange);
  }

  public get plain(): RouteDefinition[] {
    return this._getPlainRoutes();
  }

  public get plainVariants(): MocksServer.VariantDefinition[] {
    return this._getPlainVariants();
  }

  public get delay(): number {
    return this._delayOption.value;
  }

  public get logger(): LoggerInterface {
    return this._logger;
  }

  private _createRoute({
    routeDefinition,
    variantDefinition,
    loadRouteVariantsAlerts,
  }: {
    routeDefinition: RouteDefinition;
    variantDefinition: MocksServer.VariantDefinition;
    loadRouteVariantsAlerts: AlertsInterface;
  }): RouteInterface | null {
    let route = null;
    const routeId = getRouteId(routeDefinition.id, variantDefinition.id) as RouteId; // Already validated
    const loadRouteAlerts = loadRouteVariantsAlerts.collection(variantDefinition.id);

    /** Create alerts, logger and scoped core */
    const routeLogger = this._logger.namespace(routeId);
    this._loggerLoad.debug(`Creating logger namespace for route ${routeId}`);
    const routeVariantAlerts = this._alerts.collection(routeId);
    const routeVariantScopedCore = new ScopedCore({
      core: this._core,
      logger: routeLogger,
      alerts: routeVariantAlerts,
    });

    if (variantDefinition.disabled) {
      return new Route({
        delay: getRouteDelay(variantDefinition, routeDefinition),
        id: routeId as RouteId, // Already validated
        disabled: variantDefinition.disabled,
        variantId: variantDefinition.id,
        routeId: routeDefinition.id,
        path: routeDefinition.path || routeDefinition.url,
        method: routeDefinition.method, // TODO, normalize method
        logger: routeLogger,
      });
    }

    const handlerId = getHandlerId(variantDefinition);
    const Handler = findVariantHandler(this._variantHandlers, handlerId);

    const variantErrors = variantValidationErrors(routeDefinition, variantDefinition, Handler);
    loadRouteAlerts.clean();

    if (variantErrors) {
      loadRouteAlerts.set("validation", variantErrors.message);
      routeLogger.silly(`Variant validation errors: ${JSON.stringify(variantErrors.errors)}`);
      return null;
    }
    // eslint-disable-next-line
    // @ts-ignore-next-line
    try {
      const variantOptions = getOptionsFromVariant(variantDefinition);
      const HandlerToCreate = Handler as VariantHandlerConstructor;

      const handler: VariantHandlerInterface = new (HandlerToCreate as unknown as new (
        options: MocksServer.VariantHandlerOptions,
        core: ScopedCoreInterface
      ) => VariantHandlerInterface)(
        {
          ...variantOptions,
          url: routeDefinition.url, // TODO, pass in another parameter to avoid overriding handler options
          method: routeDefinition.method, // TODO, pass in another parameter to avoid overriding handler options
        },
        routeVariantScopedCore
      );
      route = new Route({
        handler,
        delay: getRouteDelay(variantDefinition, routeDefinition),
        id: routeId as RouteId, // TODO, change to routeId
        disabled: false,
        variantId: variantDefinition.id, // TODO, change to variantDefinition.id
        routeId: routeDefinition.id,
        path: routeDefinition.url, // TODO, change to Path
        method: routeDefinition.method,
        logger: routeLogger,
        type: variantDefinition.type,
        preview: handler.preview,
      });
    } catch (error) {
      const caughtError = error as Error;
      loadRouteAlerts.set("process", caughtError.message, caughtError);
    }

    return route;
  }

  public load(
    routeDefinitions: RouteDefinition[],
    variantHandlers: VariantHandlerConstructor[]
  ): void {
    this._loggerLoad.verbose("Creating routes from route definitions");
    this._loggerLoad.debug(JSON.stringify(routeDefinitions));
    this._variantHandlers = variantHandlers;

    const routeDefinitionIds: RouteDefinitionId[] = [];
    this._alertsLoad.clean();

    this._routes = compact(
      flatten(
        routeDefinitions.map((routeDefinition, index) => {
          const routeIds: RouteId[] = [];
          const loadRouteAlerts = this._alertsLoad.collection(
            `${(routeDefinition && routeDefinition.id) || index}`
          );
          const routeErrors = routeValidationErrors(routeDefinition);
          if (routeErrors) {
            loadRouteAlerts.set("validation", routeErrors.message);
            this._loggerLoad.silly(
              `Route validation errors: ${JSON.stringify(routeErrors.errors)}`
            );
            return null;
          }
          if (routeDefinitionIds.includes(routeDefinition.id)) {
            loadRouteAlerts.set(
              "duplicated",
              `Route with duplicated id '${routeDefinition.id}' detected. It has been ignored`
            );
            return null;
          }
          routeDefinitionIds.push(routeDefinition.id);
          const loadRouteVariantsAlerts = loadRouteAlerts.collection("variants");
          return routeDefinition.variants.map((variantDefinition) => {
            const route = this._createRoute({
              routeDefinition,
              variantDefinition,
              loadRouteVariantsAlerts,
            });
            if (route) {
              if (routeIds.includes(route.id)) {
                loadRouteVariantsAlerts
                  .collection(route.variantId)
                  .set(
                    "duplicated",
                    `Route variant with duplicated id '${route.variantId}' detected in route '${routeDefinition.id}'. It has been ignored`
                  );
                return null;
              }
              routeIds.push(route.id);
            }
            return route;
          });
        })
      )
    );

    this._loggerLoad.info(`Created ${this._routes.length} routes`);
  }

  public get(): RouteInterface[] {
    return [...this._routes];
  }

  public findById(id: RouteId): RouteInterface | undefined {
    return this._routes.find((route) => route.id === id);
  }
};
