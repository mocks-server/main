declare module "express-request-id" {
  import { RequestHandler } from "express";

  interface ExpressRequestID {
    /**
     * Function executed when the event is triggered
     */
    (): RequestHandler;
  }

  const _default: ExpressRequestID;
  export = _default;
}
