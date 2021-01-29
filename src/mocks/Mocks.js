/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const express = require("express");
const { flatten } = require("lodash");
const tracer = require("../tracer");

const Mock = require("./Mock");

const DEFAULT_ROUTES_HANDLER = "default";

function filterMockRoutes(mockRoutes, nextRoutes) {
  return mockRoutes.filter((mockRoute) => {
    return !nextRoutes.find((nextRoute) => {
      return mockRoute.routeId === nextRoute.routeId;
    });
  });
}

function getMockRoutes(mock, mocks, routes, nextRoutes = []) {
  const mockRoutes = mock.routes
    .map((routeId) => {
      const mockRoute = routes.find((route) => route.variantId === routeId);
      if (!mockRoute) {
        // TODO, add alert
      }
      return mockRoute;
    })
    .filter((route) => !!route);
  if (mock.from) {
    const from = mocks.find((mockCandidate) => mockCandidate.id === mock.from);
    return getMockRoutes(
      from,
      mocks,
      routes,
      filterMockRoutes(mockRoutes, nextRoutes).concat(nextRoutes)
    );
  }
  return filterMockRoutes(mockRoutes, nextRoutes).concat(nextRoutes);
}

class Mocks {
  constructor({ getLoadedMocks, getLoadedRoutes, getCurrentMock, getDelay, onChange }, core) {
    this._getLoadedMocks = getLoadedMocks;
    this._getLoadedRoutes = getLoadedRoutes;
    this._getCurrentMock = getCurrentMock;
    this._getDelay = getDelay;
    this._onChange = onChange;
    this._core = core;

    this._router = null;
    this._mocksDefinitions = [];
    this._mocks = [];
    this._routesDefinitions = [];
    this._routes = [];

    this.router = this.router.bind(this);
  }

  _reloadRouter() {
    if (this._currentMock) {
      this._router = this._currentMock.router;
    } else {
      this._router = express.Router();
    }
  }

  _processMocks() {
    tracer.debug("Processing loaded mocks");
    this._mocks = this._mocksDefinitions
      .map((mockDefinition) => {
        try {
          return new Mock({
            id: mockDefinition.id,
            routes: getMockRoutes(mockDefinition, this._mocksDefinitions, this._routes),
            getDelay: this._getDelay,
          });
        } catch (err) {
          tracer.error("Error processing mocks");
          return null;
        }
      })
      .filter((mock) => !!mock);
    this._onChange();
  }

  _processRoutes() {
    tracer.debug("Processing loaded routes");
    this._routes = flatten(
      this._routesDefinitions.map((route) => {
        // TODO, validate and handle errors
        return route.variants.map((variant) => {
          const variantId = `${route.id}:${variant.id}`;
          const handlerId = variant.handler || DEFAULT_ROUTES_HANDLER;
          const Handler = this._routesHandlers.find(
            (routeHandler) => routeHandler.id === handlerId
          );
          const routeHandler = new Handler(
            {
              ...variant,
              variantId: `${route.id}:${variant.id}`,
              url: route.url,
              method: route.method,
            },
            this._core
          );
          routeHandler.delay = variant.hasOwnProperty("delay")
            ? variant.delay
            : route.hasOwnProperty("delay")
            ? route.delay
            : null;
          routeHandler.variantId = variantId;
          routeHandler.routeId = route.id;
          routeHandler.url = route.url;
          routeHandler.method = route.method;
          return routeHandler;
          // TODO, check that handler exists, if not, add a warning
        });
      })
    ).filter((route) => !!route);
  }

  load() {
    // TODO, validate
    this._routesDefinitions = this._getLoadedRoutes();
    this._mocksDefinitions = this._getLoadedMocks();
    this._processRoutes();
    this._processMocks();
    this.current = this._getCurrentMock();
  }

  init(routesHandlers) {
    this._routesHandlers = routesHandlers;
  }

  router(req, res, next) {
    this._router(req, res, next);
  }

  set current(id) {
    tracer.verbose(`Trying to set current mock as "${id}"`);
    let current;
    if (!id) {
      current = this._mocks[0];
      tracer.warn(`Option "mock" was not defined`);
      if (current) {
        tracer.info(`Using first found mock: "${current.id}"`);
      }
    } else {
      current = this._mocks.find((mock) => mock.id === id);
      if (!current) {
        current = this._mocks[0];
        tracer.error(`Mock "${id}" was not found`);
        if (current) {
          tracer.info(`Using first found mock: "${current.id}"`);
        }
      }
    }
    if (!current) {
      tracer.error(`No mocks found`);
    } else {
      tracer.info(`Current mock: "${current.id}"`);
    }

    this._currentMock = current;
    this._currentId = current && current.id;
    this._reloadRouter();
  }

  get current() {
    return this._currentId;
  }

  get ids() {
    return this._mocks.map((mock) => mock.id);
  }
}

module.exports = Mocks;
