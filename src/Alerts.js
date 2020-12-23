/*
Copyright 2020 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const tracer = require("./tracer");

class Alerts {
  constructor({ onChangeValues }) {
    this._onChangeValues = onChangeValues;
    this._alerts = new Set();
    this.add = this.add.bind(this);
    this.remove = this.remove.bind(this);
  }

  add(context, message, error) {
    const alert = {
      context,
      message,
      error,
    };
    this._alerts.forEach((alert) => {
      if (alert.context === context) {
        this._alerts.delete(alert);
      }
    });
    this._alerts.add(alert);
    if (error) {
      tracer.error(`${message}: ${error.message}`);
    } else {
      tracer.warn(message);
    }
    this._onChangeValues(this.values);
  }

  remove(context) {
    let changed = false;
    this._alerts.forEach((alert) => {
      if (alert.context.indexOf(context) === 0) {
        this._alerts.delete(alert);
        changed = true;
      }
    });
    if (changed) {
      this._onChangeValues(this.values);
    }
  }

  get values() {
    return Array.from(this._alerts);
  }
}

module.exports = Alerts;
