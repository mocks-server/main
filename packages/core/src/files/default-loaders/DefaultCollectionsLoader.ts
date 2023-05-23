/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import path from "path";

import type { CollectionDefinition, CollectionDefinitionsLoader } from "../../mock/types";
import type { ErrorLoadingFile, FileLoaded, FilesLoaderCoreTools } from "../FilesLoader.types";
import { validateFileContent } from "../Helpers";

import type {
  DefaultCollectionsLoaderConstructor,
  DefaultCollectionsLoaderInterface,
  DefaultCollectionsLoaderOptions,
} from "./DefaultCollectionsLoader.types";

const ID = "collections";
const FILE_NAME = "collections";
const LEGACY_FILE_NAME = "mocks";

function findFile(filesContents: FileLoaded[], fileName: string): FileLoaded | undefined {
  return filesContents.find((fileDetails) => {
    return path.basename(fileDetails.path).startsWith(fileName);
  });
}

function getFileToUse(filesContents: FileLoaded[]): FileLoaded | undefined {
  return findFile(filesContents, FILE_NAME) || findFile(filesContents, LEGACY_FILE_NAME);
}

export const DefaultCollectionsLoader: DefaultCollectionsLoaderConstructor = class DefaultCollectionsLoader
  implements DefaultCollectionsLoaderInterface
{
  private _getBasePath: DefaultCollectionsLoaderOptions["getBasePath"];
  private _loadCollections: CollectionDefinitionsLoader;

  constructor({ loadCollections, createLoader, getBasePath }: DefaultCollectionsLoaderOptions) {
    createLoader({
      id: ID,
      src: [FILE_NAME, LEGACY_FILE_NAME],
      onLoad: this._onLoad.bind(this),
    });

    this._getBasePath = getBasePath;
    this._loadCollections = loadCollections;
  }

  private _onLoad(
    filesContents: FileLoaded[],
    filesErrors: ErrorLoadingFile[],
    { logger, alerts }: FilesLoaderCoreTools
  ): void {
    const deprecationAlerts = alerts.collection("deprecated");
    alerts.clean();
    const fileToUse = getFileToUse(filesContents);

    if (!filesContents.length && !filesErrors.length) {
      alerts.set(
        "not-found",
        `No collections file was found: '${path.resolve(this._getBasePath(), FILE_NAME)}.*'`
      );
    }

    if (fileToUse) {
      const filePath = fileToUse.path;
      const fileContent = fileToUse.content;
      const fileName = path.basename(filePath);
      // LEGACY, to be removed
      if (fileName.startsWith(LEGACY_FILE_NAME)) {
        deprecationAlerts.set(
          LEGACY_FILE_NAME,
          `Defining collections in '${fileName}' file is deprecated. Please rename it to '${fileName.replace(
            LEGACY_FILE_NAME,
            FILE_NAME
          )}'`
        );
      } else {
        deprecationAlerts.remove(LEGACY_FILE_NAME);
      }

      try {
        const fileErrors = validateFileContent(fileContent);
        if (fileErrors) {
          throw new Error(fileErrors);
        }
        this._loadCollections(fileContent as CollectionDefinition[]);
        logger.verbose(`Loaded collections from file '${filePath}'`);
      } catch (error) {
        this._loadCollections([]);
        alerts.set("error", `Error loading collections from file '${filePath}'`, error as Error);
      }
    } else {
      this._loadCollections([]);
    }
  }
};
