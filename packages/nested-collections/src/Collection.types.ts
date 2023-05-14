/* eslint-disable @typescript-eslint/no-namespace */

import type { EventsListener, EventsListenerRemover } from "./Events.types";

export type CollectionId = string | null;

export type CollectionPathId = CollectionId | `${CollectionId}:${CollectionId}`;

export interface ObjectWithId {
  id: CollectionId;
}

export type CollectionItemValue = unknown;

export interface CollectionItem extends ObjectWithId {
  value: CollectionItemValue;
}

export interface CollectionFlatItem extends CollectionItem {
  collection: CollectionId;
}

export type CollectionItems = CollectionItem[];
export type CollectionFlatItems = CollectionFlatItem[];
export type Collections = CollectionBaseInterface[];
export type CollectionElement = CollectionItem | CollectionBaseInterface;
export type CollectionElements = CollectionElement[];
export interface CollectionIdComparer {
  (element: CollectionElement): boolean;
}

export interface CollectionOptions {
  parent?: CollectionBaseInterface;
  root?: CollectionBaseInterface;
  [x: string | number | symbol]: unknown;
}

/** Collection constructor */
export interface CollectionConstructor {
  /**
   * Creates a root collection
   * @param id - Id for the collection {@link Id}
   * @param options - Collection options {@link CollectionOptions}
   * @returns Root collection
   * @example const collection = new Collection("id")
   */
  new (id?: CollectionId, options?: CollectionOptions): CollectionBaseInterface;
}

/** Collection interface */
export interface CollectionBaseInterface {
  /** collection id */
  id: CollectionId;
  /** Collection id joined with parent collections ids */
  path: CollectionPathId;
  /**
   * Removes a collection
   * @param id - Id of the collection to be removed {@link Id}
   * @example myCollection.removeCollection("id");
   */
  removeCollection(id: CollectionId): void;
  /**
   * Returns child collection with provided id or creates a new one
   * @param id - Id of the collection to return {@link Id}
   * @example myCollection.collection("id");
   * @returns Child collection
   */
  collection(id: CollectionId): CollectionBaseInterface;
  /**
   * Merges current collection with the received one recursively
   */
  merge(collection: CollectionBaseInterface): void;
  /**
   * Changes a collection id. If the id already belongs to another collection, then it merges both of them
   * @param id - Id of the collection to rename {@link Id}
   * @param newId - New id for the collection {@link Id}
   * @example myCollection.renameCollection("foo", "var");
   */
  renameCollection(id: CollectionId, newId: CollectionId): void;

  /**
   * Clean items and items in children collections recursively
   * @example myCollection.clean();
   */
  clean(): void;

  /**
   * Returns the value of a collection item
   * @param id - Id of the item {@link Id}
   * @example myCollection.get("id");
   * @returns item value {@link CollectionItemValue}
   */
  get(id: CollectionId): CollectionItemValue;

  /**
   * Removes a collection item
   * @param id - Id of the item {@link Id}
   * @example myCollection.remove("id");
   */
  remove(id: CollectionId): void;

  /**
   * Removes all collection items
   * @example myCollection.cleanItems();
   */
  cleanItems(): void;

  /** All collection items */
  items: CollectionItems;

  /** All collection children collections */
  collections: Collections;

  /** Parent collection */
  parent?: CollectionBaseInterface;

  /**
   * Executes the provided function whenever a change is made in items, children collections or their items
   * @returns function to remove event listener
   */
  /**
   * Received function will be executed whenever a change is made in items, children collections or their items
   * @param listener - Function to execute when there is a change {@link EventsListener}
   * @returns Function allowing to remove the event listener. Once executed, the eventListenet won't be executed any more {@link EventsListenerRemover}
   * @example const removeOnChangeListener = collection.onChange(() => console.log("Collection items have changed"))
   */
  onChange(listener: EventsListener): EventsListenerRemover;

  /** Root collection */
  root: CollectionBaseInterface;
}

/** Collection interface */
export interface CollectionInterface extends CollectionBaseInterface {
  /**
   * Sets the value for the collection item with the provided id or creates a new one and assign the value to it
   * @param id - Id of the item {@link Id}
   * @param value - Value for the item {@link CollectionItemValue}
   * @example myCollection.set("id", "value");
   * @returns item {@link CollectionItem}
   */
  set(id: CollectionId, value: CollectionItemValue): CollectionItem;

  /** All collection items and children collection items in a flat array. Overwrite this method if you need to implement your own flat method **/
  flat: CollectionFlatItems;
}
