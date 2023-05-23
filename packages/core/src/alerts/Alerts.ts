/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { LoggerInterface } from "@mocks-server/logger";
import { BaseNestedCollections, CollectionFlatItem } from "@mocks-server/nested-collections";

import type {
  AlertsId,
  AlertsConstructorInterface,
  AlertsInterface,
  AlertId,
  AlertMessage,
  AlertError,
  Alert,
  AlertsOptions,
  AlertsFlat,
  AlertValue,
  AlertFlat,
} from "./Alerts.types";

const ALERTS_ROOT_ID = "alerts";
const ID_SEP = ":";

export const Alerts: AlertsConstructorInterface = class Alerts
  extends BaseNestedCollections
  implements AlertsInterface
{
  private _logger: LoggerInterface;

  constructor(id: AlertsId, options?: AlertsOptions) {
    if (!options) {
      throw new Error("Alerts options are required");
    }
    super(id, options);
    this._logger = options.logger.namespace(this.path || id);
  }

  set(id: AlertId, message: AlertMessage, error: AlertError): Alert {
    this._logger.silly(`Setting alert with id '${id}'`);
    if (error) {
      this._logger.error(`${message}: ${error.message}`);
      if (error.stack) {
        this._logger.debug(error.stack);
      }
    } else {
      this._logger.warn(message);
    }
    return this._set(id, { message, error });
  }

  remove(id: AlertId): void {
    this._logger.silly(`Removing alert with id '${id}'`);
    super.remove(id);
  }

  get flat(): AlertsFlat {
    return this._flat.map((item: CollectionFlatItem): AlertFlat => {
      const collection = item.collection as string;
      const collectionPaths = collection.split(ID_SEP);
      if (collectionPaths[0] === ALERTS_ROOT_ID) {
        collectionPaths.shift();
      }
      const value = item.value as AlertValue;

      return {
        ...value,
        id: [...collectionPaths, item.id].join(ID_SEP),
      };
    });
  }
};
