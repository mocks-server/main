/*
Copyright 2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const updateNotifier = require("update-notifier");

const packageJson = require("../../package.json");

class UpdateNotifier {
  static get id() {
    return "update-notifier";
  }

  constructor({ alerts, pkg }) {
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
}

module.exports = UpdateNotifier;
