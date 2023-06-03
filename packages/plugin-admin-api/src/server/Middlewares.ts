/*
Copyright 2019-2023 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import { isBoom, badImplementation, notFound as notFoundError } from "@hapi/boom";
import type { ScopedCoreInterface } from "@mocks-server/core";
import bodyParser from "body-parser";
import cors from "cors";
import type { NextFunction, RequestHandler, Response, ErrorRequestHandler } from "express";
import expressRequestId from "express-request-id";

import type { RequestWithId } from "./Server.types";

export const addRequestId = () => expressRequestId();

export const jsonBodyParser = () => bodyParser.json();

export function logRequest({ logger }: { logger: ScopedCoreInterface["logger"] }): RequestHandler {
  return (req: RequestWithId, _res: Response, next: NextFunction): void => {
    logger.debug(`Request received | ${req.method} => ${req.url} | Assigned id: ${req.id}`);
    next();
  };
}

export function notFound({ logger }: { logger: ScopedCoreInterface["logger"] }): RequestHandler {
  return (req: RequestWithId, _res: Response, next: NextFunction): void => {
    logger.debug(`Sending Not found response | ${req.method} => ${req.url} | ${req.id}`);
    next(notFoundError());
  };
}

export function errorHandler({
  logger,
}: {
  logger: ScopedCoreInterface["logger"];
}): ErrorRequestHandler {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  return (err: Error, req: RequestWithId, res: Response, _next: NextFunction): void => {
    const isBoomError = isBoom(err);
    const stack = isBoomError ? null : err && err.stack;
    const error = isBoomError ? err : err && badImplementation(err.message);
    logger.error(`Sending Error '${error.message}' | ${req.id}`);
    if (stack) {
      logger.silly(stack.toString());
    }
    res.status(error.output.statusCode);
    res.send(error.output.payload);
  };
}

export function enableCors(): RequestHandler {
  return cors({
    preflightContinue: false,
  });
}
