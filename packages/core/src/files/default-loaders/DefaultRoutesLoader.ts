/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import path from "path";

import { flatten } from "lodash";

import type { RouteDefinitionsLoader } from "../../mock/Mock.types";
import type { RouteDefinition } from "../../mock/routes/Route.types";
import type { ErrorLoadingFile, FileLoaded, FilesLoaderCoreTools } from "../FilesLoader.types";
import { validateFileContent } from "../Helpers";

import type {
  DefaultRoutesLoaderConstructor,
  DefaultRoutesLoaderInterface,
  DefaultRoutesLoaderOptions,
} from "./DefaultRoutesLoader.types";

const ID = "routes";
const FOLDER_NAME = "routes";

export const DefaultRoutesLoader: DefaultRoutesLoaderConstructor = class DefaultRoutesLoader
  implements DefaultRoutesLoaderInterface
{
  private _getBasePath: DefaultRoutesLoaderOptions["getBasePath"];
  private _loadRoutes: RouteDefinitionsLoader;

  constructor({ loadRoutes, createLoader, getBasePath }: DefaultRoutesLoaderOptions) {
    createLoader({
      id: ID,
      src: `${FOLDER_NAME}/**/*`,
      onLoad: this._onLoad.bind(this),
    });

    this._getBasePath = getBasePath;
    this._loadRoutes = loadRoutes;
  }

  _onLoad(
    filesContents: FileLoaded[],
    _filesErrors: ErrorLoadingFile[],
    { logger, alerts }: FilesLoaderCoreTools
  ) {
    const alertsFiles = alerts.collection("file");
    alerts.clean();
    logger.verbose(`Loading routes. ${filesContents.length} route files found.`);
    const routes = flatten(
      filesContents
        .map((fileDetails) => {
          const filePath = fileDetails.path;
          const fileContent = fileDetails.content;

          const fileErrors = validateFileContent(fileContent);
          if (fileErrors) {
            alertsFiles.set(filePath, `Error loading routes from file ${filePath}: ${fileErrors}`);
            return null;
          }
          return fileContent;
        })
        .filter((fileContent) => !!fileContent)
    );
    this._loadRoutes(routes as RouteDefinition[]);
    logger.verbose(
      `Loaded routes from folder '${path.resolve(this._getBasePath(), FOLDER_NAME)}'`
    );
  }
};
