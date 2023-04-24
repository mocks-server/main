import type {
  NextFunction as ExpressNextFunction,
  Request as ExpressRequest,
  Response as ExpressResponse,
  RequestHandler as ExpressRequestHandler,
  ErrorRequestHandler as ExpressErrorRequestHandler,
} from "express";

/** Express next function */
export type NextFunction = ExpressNextFunction;

/** Express response method with custom properties */
export type Response = ExpressResponse;

/** Express request object with custom properties */
export interface Request extends ExpressRequest {
  /** Request id, added by the "express-request-id" middleware */
  id?: string;
}

export interface RequestHandler extends ExpressRequestHandler {
  (req: Request, res: Response, next: NextFunction): void;
}

export interface ErrorRequestHandler extends ExpressErrorRequestHandler {
  (error: Error, req: Request, res: Response, next: NextFunction): void;
}
