/*
Copyright 2019-2023 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import * as Boom from "@hapi/boom";
import type { LoggerInterface } from "@mocks-server/logger";
import bodyParser from "body-parser";
import type { OptionsJson, OptionsUrlencoded } from "body-parser";
import expressRequestId from "express-request-id";

import type {
  RequestHandler,
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "./Server.types";

export function addRequestId(): RequestHandler {
  return expressRequestId();
}

export function jsonBodyParser(options: OptionsJson): RequestHandler {
  return bodyParser.json(options);
}

export function urlEncodedBodyParser(options: OptionsUrlencoded): RequestHandler {
  return bodyParser.urlencoded(options);
}

export function logRequest({ logger }: { logger: LoggerInterface }): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    logger.debug(`Request received | ${req.method} => ${req.url} | Assigned id: ${req.id}`);
    next();
  };
}

export function notFound({ logger }: { logger: LoggerInterface }): RequestHandler {
  return (req: Request, _res: Response, next: NextFunction) => {
    logger.debug(`Sending Not found response | ${req.method} => ${req.url} | ${req.id}`);
    next(Boom.notFound());
  };
}

export function errorHandler({ logger }: { logger: LoggerInterface }): ErrorRequestHandler {
  return (err: Error, req: Request, res: Response, next: NextFunction) => {
    const isBoom = Boom.isBoom(err);
    const stack = isBoom ? null : err && err.stack;
    const error = isBoom ? err : err && Boom.badImplementation(err.message);
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
}
