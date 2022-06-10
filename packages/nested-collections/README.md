<p align="center">
  <a href="https://github.com/mocks-server/main/actions?query=workflow%3Abuild+branch%3Amaster"><img src="https://github.com/mocks-server/main/workflows/build/badge.svg?branch=master" alt="Build Status"></a>
  <a href="https://codecov.io/gh/mocks-server/main"><img src="https://codecov.io/gh/mocks-server/main/branch/master/graph/badge.svg?token=2S8ZR55AJV" alt="Coverage"></a>
  <a href="https://sonarcloud.io/project/overview?id=mocks-server_main_nested-collections"><img src="https://sonarcloud.io/api/project_badges/measure?project=mocks-server_main_nested-collections&metric=alert_status" alt="Quality Gate"></a>
  <a href="https://www.npmjs.com/package/@mocks-server/nested-collections"><img src="https://img.shields.io/npm/dm/@mocks-server/nested-collections.svg" alt="Downloads"></a>
  <a href="https://renovatebot.com"><img src="https://img.shields.io/badge/renovate-enabled-brightgreen.svg" alt="Renovate"></a>
  <a href="https://github.com/mocks-server/main/blob/master/packages/nested-collections/LICENSE"><img src="https://img.shields.io/npm/l/@mocks-server/nested-collections.svg" alt="License"></a>
</p>

---

# Nested collections

A collections manager that allows to store items with an `id` and a `value`. Other descendant collections can be created recursively. Each collection has a method allowing to get items from all descendent collections in a flat way, adding a collection `id` to each one of them.

It also provides methods for merging the collections, removing items or collections, etc. Events are emitted whenever any descendant collection or item changes.

## Usage

A brief example:

```js
const { NestedCollections } = require("@mocks-server/nested-collections");

const alerts = new NestedCollections("alerts");
alerts.set("root", "This alert is stored in the root collection");

const pluginsAlerts = alerts.collection("plugins");
pluginsAlerts.set("foo-alert-id", "This alert is stored in the plugins collection");

const pluginAlertsA = pluginsAlerts.collection("a");
const pluginAlertsB = pluginsAlerts.collection("b");

pluginAlertsA.set("foo-1", "Alert from plugin A");
pluginAlertsB.set("foo-2", "Alert from plugin B");

console.log(alerts.collection("plugins").collection("b").get("foo-2"));
// Alert from plugin B

console.log(alerts.flat);
/*
[
  {
    id: 'root',
    value: 'This alert is stored in the root collection',
    collection: 'alerts'
  },
  {
    id: 'foo-alert-id',
    value: 'This alert is stored in the plugins collection',
    collection: 'alerts:plugins'
  },
  {
    id: 'foo-1',
    value: 'Alert from plugin A',
    collection: 'alerts:plugins:a'
  },
  {
    id: 'foo-2',
    value: 'Alert from plugin B',
    collection: 'alerts:plugins:b'
  }
]
*/
```

## API

### NestedCollections

```js
const collection = new NestedCollections("id");
``` 

* __`NestedCollections(id, options)`__. Returns a `collection` instance.
  * __`id`__ _(String)_: Id for the root collection
  * __`options`__ _(Object)_:
    * __`Decorator`__ - Custom constructor to be used when creating children collections. Useful to extend the `NestedCollections` class (read ["extending NestedCollections"](#extending-collection) for further info).

### collection instance

* __get `id`__: Returns the collection id. Used as setter, sets collection id. Do not use it for changing a child collection id. Use `renameCollection` instead.
* __set `id`__: Sets collection id. Do not use it for changing a child collection id. Use `renameCollection` instead.
* __get `path`__: Returns the collection id joined with all parent collections ids using `:` (`parentCollectionId:parentCollectionId:collectionId`).
* __`removeCollection(collectionId)`__: Removes children collection, including all of its items and possible children collections.
  * `collectionId` _(String)_: Id of the collection to be removed.
* __`collection(collectionId)`__: Returns child collection with provided id or creates a new one if it does not exists.
  * `collectionId` _(String)_: Id of the collection to be returned.
* __`renameCollection(collectionId, newCollectionId)`__: Changes a collection id. Id id already exists in other collection, then it merges them.
  * `collectionId` _(String)_: Id of the collection to be changed.
  * `newCollectionId` _(String)_: New id for the collection
* __`clean()`__: Clean items and items in children collections recursively.
* __`set(id, value)`__: Sets the value for the collection item with the provided id or creates a new one if it does not exists.
  * `id` _(String)_: Id of the item to set the value.
  * `value` _(Any)_: Value to be stored in the item.
* __`get(id)`__: Returns the value of the collection item having the provided id.
  * `id` _(String)_: Id of the item to get the value.
* __`remove(id)`__: Removes a collection item.
  * `id` _(String)_: Id of the item to be removed.
* __`cleanItems()`__: Removes all collection items.
* __get `items`__: Returns all collection items as an array.
* __get `flat`__: Returns all collection items and descendent collection items in a flat array. It adds a `collection` id to each item. For nested collections, the `id` is built with all parents ids and self id concated by `:`.
* __`onChange(callback)`__: Allows to add a listener that will be executed whenever any descendant collection or item changes. __It returns a function that removes the listener once executed__.
  * `callback(value)` _(Function)_: Callback to be executed.

## Extending NestedCollections

In order to be able to decorate the `NestedCollections` methods easily, a `Decorator` option can be passed as second argument to it. When present, it will be used to create children collections, so you can extend the `NestedCollections` methods, while nested collections will be still created with your class. For example:

```js
class Alerts extends NestedCollections {
  constructor(id, options) {
    // Nested collections will be created always using this class
    super(id, { ...options, Decorator: Alerts });
  }

  // Set method now accepts three arguments, and it always stores an object
  set(id, message, error) {
    return super.set(id, { message, error });
  }
}
```
