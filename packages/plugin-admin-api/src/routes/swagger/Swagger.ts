import path from "path";

import type { ConfigNamespaceInterface } from "@mocks-server/config";
import express from "express";
import type { Router, Request, Response } from "express";
import type { OpenAPIV3 } from "openapi-types";
import { absolutePath } from "swagger-ui-dist";

import { serverUrl } from "../../common/Helpers";
import { ROOT_PATH } from "../../common/Paths";

import { openapiDocument } from "./Openapi";

import type { OpenApiDocument } from "./Openapi.types";
import type {
  SwaggerConstructor,
  SwaggerInterface,
  SwaggerOptions,
  SwaggerUiOptions,
} from "./Swagger.types";

export const Swagger: SwaggerConstructor = class Swagger implements SwaggerInterface {
  private _router: Router;
  private _openApi: OpenApiDocument;
  private _config: ConfigNamespaceInterface;

  constructor({ config }: SwaggerOptions) {
    this._openApiMiddleware = this._openApiMiddleware.bind(this);
    this._openApi = openapiDocument;
    this._config = config;

    this._router = express.Router();
    this._router.get("/openapi.json", this._openApiMiddleware);
    this._router.use(express.static(path.resolve(ROOT_PATH, "static", "swagger")));
    this._router.use(express.static(absolutePath()));
  }

  public get router() {
    return this._router;
  }

  public setOptions({ version, port, host, protocol }: SwaggerUiOptions): void {
    this._openApi.info.version = version;
    this._openApi.servers[0].url = `${serverUrl({ host, port, protocol })}/api`;
    this._openApi.components.schemas.Config =
      this._config.root.getValidationSchema() as OpenAPIV3.SchemaObject;
  }

  private _openApiMiddleware(_req: Request, res: Response): void {
    res.status(200).send(this._openApi);
  }
};
