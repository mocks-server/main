/*
Copyright 2023 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

import path from "path";

import { readJsonSync } from "fs-extra";
import updateNotifier from "update-notifier";
import type { Package } from "update-notifier";

import type { AlertsInterface } from "../alerts/types";

import type {
  UpdateNotifierInterface,
  UpdateNotifierConstructor,
  UpdateNotifierOptions,
} from "./types";

export const UpdateNotifier: UpdateNotifierConstructor = class UpdateNotifier
  implements UpdateNotifierInterface
{
  private _package: Package;
  private _alerts: AlertsInterface;
  private _notifier: ReturnType<typeof updateNotifier>;

  constructor({ alerts, pkg }: UpdateNotifierOptions) {
    this._alerts = alerts;
    const packageJson = readJsonSync(path.resolve(__dirname, "..", "..", "package.json"));
    this._package = pkg || packageJson;
    this._notifier = updateNotifier({
      pkg: this._package,
      shouldNotifyInNpmScript: true,
    });
  }

  public static get id() {
    return "update-notifier";
  }

  public init() {
    this._notifier.notify();
    if (this._notifier.update) {
      this._alerts.set(
        "out-of-date",
        `Update available: ${this._package.name}@${this._notifier.update.latest}`
      );
    }
  }
};
