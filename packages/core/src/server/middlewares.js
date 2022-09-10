/*
Copyright 2019-2022 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

"use strict";

const bodyParser = require("body-parser");
const Boom = require("@hapi/boom");

const expressRequestId = require("express-request-id");

const addRequestId = () => expressRequestId();

const jsonBodyParser = (options) => bodyParser.json(options);
const urlEncodedBodyParser = (options) => bodyParser.urlencoded(options);

const logRequest =
  ({ logger }) =>
  (req, _res, next) => {
    logger.debug(`Request received | ${req.method} => ${req.url} | Assigned id: ${req.id}`);
    next();
  };

const notFound =
  ({ logger }) =>
  (req, _res, next) => {
    logger.debug(`Sending Not found response | ${req.method} => ${req.url} | ${req.id}`);
    next(Boom.notFound());
  };

const errorHandler =
  ({ logger }) =>
  (err, req, res, next) => {
    const isBoom = Boom.isBoom(err);
    const stack = isBoom ? null : err && err.stack;
    const error = isBoom ? err : err && Boom.badImplementation(err);
    if (error) {
      logger.error(`Sending Error '${error.message}' | ${req.id}`);
      if (stack) {
        logger.silly(stack.toString());
      }
      res.status(error.output.statusCode);
      res.send(error.output.payload);
    } else {
      next();
    }
  };

module.exports = {
  addRequestId,
  jsonBodyParser,
  urlEncodedBodyParser,
  logRequest,
  notFound,
  errorHandler,
};
