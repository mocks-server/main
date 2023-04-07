/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import type { CollectionInterface } from "@mocks-server/nested-collections";
import updateNotifier from "update-notifier";
import type { Package } from "update-notifier";

import type {
  UpdateNotifierInterface,
  UpdateNotifierConstructor,
  UpdateNotifierOptions,
} from "./UpdateNotifierTypes";

import packageJson from "../../package.json";

export const UpdateNotifier: UpdateNotifierConstructor = class UpdateNotifier
  implements UpdateNotifierInterface
{
  private _package: Package;
  private _alerts: CollectionInterface;
  private _notifier: ReturnType<typeof updateNotifier>;

  static get id() {
    return "update-notifier";
  }

  constructor({ alerts, pkg }: UpdateNotifierOptions) {
    this._alerts = alerts;
    this._package = pkg || packageJson;
    this._notifier = updateNotifier({
      pkg: this._package,
      shouldNotifyInNpmScript: true,
    });
  }

  init() {
    this._notifier.notify();
    if (this._notifier.update) {
      this._alerts.set(
        "out-of-date",
        `Update available: ${this._package.name}@${this._notifier.update.latest}`
      );
    }
  }
};
