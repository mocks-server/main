/*
Copyright 2021-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const express = require("express");

const { HTTP_METHODS, ALL_HTTP_METHODS_ALIAS } = require("./validations");

function getExpressHttpMethod(method) {
  return HTTP_METHODS[method.toUpperCase()];
}

function getRouteMethods(routeVariant) {
  const method = routeVariant.method;
  if (!method || method === ALL_HTTP_METHODS_ALIAS) {
    return ["all"];
  }
  if (Array.isArray(method)) {
    return method.map(getExpressHttpMethod);
  }
  return [getExpressHttpMethod(method)];
}

class Collection {
  constructor({ id, routeVariants, getDelay, logger }) {
    this._logger = logger;
    this._id = id;
    this._routeVariants = routeVariants;
    this._getDelay = getDelay;
    this._initRouter();
  }

  _initRouter() {
    this._router = express.Router();
    this._routeVariants.forEach((routeVariant) => {
      const logAndApplyDelay = (req, _res, next) => {
        routeVariant.logger.info(`Request ${req.method} => ${req.url} | req: ${req.id}`);
        const delay = routeVariant.delay !== null ? routeVariant.delay : this._getDelay();
        if (delay > 0) {
          this._logger.verbose(`Applying delay of ${delay}ms to route variant '${this._id}'`);
          setTimeout(() => {
            next();
          }, delay);
        } else {
          next();
        }
      };
      if (!routeVariant.disabled) {
        if (routeVariant.router) {
          this._router.use(routeVariant.url, logAndApplyDelay);
          this._router.use(routeVariant.url, routeVariant.router.bind(routeVariant));
        } else {
          const methods = getRouteMethods(routeVariant);
          methods.forEach((method) => {
            this._router[method](routeVariant.url, logAndApplyDelay);
            this._router[method](routeVariant.url, routeVariant.middleware.bind(routeVariant));
          });
        }
      }
    });
  }

  get routeVariants() {
    return this._routeVariants;
  }

  get id() {
    return this._id;
  }

  get router() {
    return this._router;
  }
}

module.exports = Collection;
