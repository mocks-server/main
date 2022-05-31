/*
Copyright 2020 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const tracer = require("./tracer");
const NestedCollections = require("@mocks-server/nested-collections").default;

class Alerts {
  constructor({ onChange }) {
    this._nestedCollections = new NestedCollections("alerts");
    this._nestedCollections.onChange(onChange);
    this._alerts = new Set();
    this.add = this.add.bind(this);
    this.remove = this.remove.bind(this);
    this.rename = this.rename.bind(this);
  }

  add(context, message, error) {
    tracer.silly(`Adding alert with context "${context}" and message "${message}"`);
    const alert = {
      context,
      message,
      error,
    };
    const collectionIds = context.split(":");
    const alertId = collectionIds.pop();
    const alertCollection = collectionIds.reduce((currentCollection, collectionId) => {
      return currentCollection.collection(collectionId);
    }, this._nestedCollections);
    alertCollection.set(alertId, alert);
    if (error) {
      tracer.error(`${message}: ${error.message}`);
      tracer.debug(error.stack);
    } else {
      tracer.warn(message);
    }
  }

  remove(context) {
    tracer.silly(`Removing alerts with context "${context}"`);
    // Clean collection with whole context
    const collectionIds = context.split(":");
    const contextCollection = collectionIds.reduce((currentCollection, collectionId) => {
      return currentCollection.collection(collectionId);
    }, this._nestedCollections);
    contextCollection.clean();

    // Last context may be an item id instead of a collection. Remove it
    const alertId = collectionIds.pop();
    const alertCollection = collectionIds.reduce((currentCollection, collectionId) => {
      return currentCollection.collection(collectionId);
    }, this._nestedCollections);
    alertCollection.remove(alertId);
  }

  rename(oldContext, newContext) {
    tracer.silly(`Renaming alerts with context "${oldContext}" to context "${newContext}"`);
    const collectionIds = oldContext.split(":");
    const newCollectionsIds = newContext.split(":");

    collectionIds.reduce((currentCollection, collectionId, currentIndex) => {
      const collection = currentCollection.collection(collectionId);
      collection.id = newCollectionsIds[currentIndex];
      return collection;
    }, this._nestedCollections);

    // Rename item
    const lastCollectionId = collectionIds.pop();
    const newLastCollectionId = newCollectionsIds.pop();
    const lastCollection = newCollectionsIds.reduce((currentCollection, collectionId) => {
      return currentCollection.collection(collectionId);
    }, this._nestedCollections);

    const value = lastCollection.get(lastCollectionId);
    if (value) {
      lastCollection.remove(lastCollectionId);
      lastCollection.set(newLastCollectionId, value);
    }
  }

  get values() {
    return this._nestedCollections.flat.map((item) => {
      let context = item.collection;
      let sep = ":";
      if (context.startsWith("alerts:")) {
        context = context.replace("alerts:", "");
      } else {
        context = "";
        sep = "";
      }
      return {
        ...item.value,
        context: `${context}${sep}${item.id}`,
      };
    });
  }
}

module.exports = Alerts;
