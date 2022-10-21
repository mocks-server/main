/* eslint-disable @typescript-eslint/no-namespace */

import type { EventsTs } from "./Events";

export namespace CollectionTs {
  export type Id = string | null;

  export type PathId = Id | `${Id}:${Id}`;

  export interface ObjectWithId {
    id: Id;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export type ItemValue = any;

  export interface Item extends ObjectWithId {
    value: ItemValue;
  }

  export interface FlatItem extends Item {
    collection: Id,
  }

  export type Items = Item[];
  export type FlatItems = FlatItem[];
  export type Collections = Interface[];
  export type Element = Item | Interface;
  export type Elements = Element[];
  export interface IdComparer {
    (element: Element): boolean
  }

  export interface Options {
    parent?: Interface,
    root?: Interface,
    [x: string | number | symbol]: unknown;
  }

  /** Collection constructor */
  export interface Constructor {
    /**
    * Creates a root collection
    * @param id - Id for the collection {@link Id}
    * @param options - Collection options {@link Options}
    * @returns Root collection
    * @example const collection = new Collection("id")
    */
    new (id?: Id, options?: Options): Interface
  }

  /** Collection interface */
  export interface Interface {
    /** collection id */
    id: Id
    /** Collection id joined with parent collections ids */
    path: PathId
    /**
    * Removes a collection
    * @param id - Id of the collection to be removed {@link Id}
    * @example myCollection.removeCollection("id");
    */
    removeCollection(id: Id): void
    /**
    * Returns child collection with provided id or creates a new one
    * @param id - Id of the collection to return {@link Id}
    * @example myCollection.collection("id");
    * @returns Child collection
    */
    collection(id: Id): Interface
    /**
    * Merges current collection with the received one recursively
    */
    merge(collection: Interface): void
    /**
    * Changes a collection id. If the id already belongs to another collection, then it merges both of them
    * @param id - Id of the collection to rename {@link Id}
    * @param newId - New id for the collection {@link Id}
    * @example myCollection.renameCollection("foo", "var");
    */
    renameCollection(id: Id, newId: Id): void

    /**
    * Clean items and items in children collections recursively
    * @example myCollection.clean();
    */
    clean(): void

    /**
    * Returns the value of a collection item
    * @param id - Id of the item {@link Id}
    * @example myCollection.get("id");
    * @returns item value {@link ItemValue}
    */
    get(id: Id): ItemValue

    /**
    * Removes a collection item
    * @param id - Id of the item {@link Id}
    * @example myCollection.remove("id");
    */
    remove(id: Id): void

    /**
    * Removes all collection items
    * @example myCollection.cleanItems();
    */
    cleanItems(): void

    /** All collection items */
    items: Items

    /** All collection children collections */
    collections: Collections

    /** Parent collection */
    parent?: Interface

    /** All collection items and children collection items in a flat array. Overwrite this method in the Decorator if you need to implement your own flat method **/
    flat: FlatItems

    /**
    * Executes the provided function whenever a change is made in items, children collections or their items
    * @returns function to remove event listener
    */
   /**
    * Received function will be executed whenever a change is made in items, children collections or their items
    * @param listener - Function to execute when there is a change {@link Events.Listener}
    * @returns Function allowing to remove the event listener. Once executed, the eventListenet won't be executed any more {@link Events.ListenerRemover}
    * @example const removeOnChangeListener = collection.onChange(() => console.log("Collection items have changed"))
    */
    onChange(listener: EventsTs.Listener): EventsTs.ListenerRemover

    /** Root collection */
    root: Interface
  }

  /** Collection interface */
  export interface Interface2 extends Interface {
    /**
    * Sets the value for the collection item with the provided id or creates a new one and assign the value to it
    * @param id - Id of the item {@link Id}
    * @param value - Value for the item {@link ItemValue}
    * @example myCollection.set("id", "value");
    * @returns item {@link Item}
    */
    set(id: Id, value: ItemValue): Item
  }
}