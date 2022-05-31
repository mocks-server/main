import EventEmitter from "events";

import { CHANGE_EVENT, EventListener, addEventListener } from "./events";

type elementId = string | null;

interface ElementBasics {
  id: elementId;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type itemValue = any;

interface Item extends ElementBasics {
  value: itemValue;
}

interface FlatItem extends Item {
  collection: elementId,
}

type items = Item[];
type flatItems = FlatItem[];
type collections = Collection[];
type element = Item | Collection;
type elements = element[];

function elementIdIsEqualTo(element: element, id: elementId): boolean {
  return element.id === id;
}

interface IdComparer {
  (element: element): boolean
}

function ElementIdIsEqualToId(id: elementId): IdComparer {
  return function (element: element) {
    return elementIdIsEqualTo(element, id);
  };
}

function findById(elements: items, id: elementId): Item | null;
function findById(elements: collections, id: elementId): Collection | null;
function findById(elements: elements, id: elementId) {
  return elements.find(ElementIdIsEqualToId(id)) || null;
}

function findIndexById(elements: elements, id: elementId): number {
  return elements.findIndex(ElementIdIsEqualToId(id));
}

function cleanCollection(collection: Collection): void {
  collection.clean();
}

export default class Collection implements ElementBasics {
  private _id: elementId;
  private _collections: collections;
  private _items: items;
  private _eventEmitter: EventEmitter;

  /**
   * Creates a root collection
   * @example const collection = new Collection("id")
   * @returns Root collection
  */
  constructor(id?: elementId) {
    this._eventEmitter = new EventEmitter();
    this._id = id || null;
    this._collections = [];
    this._items = [];
    this._emitChange = this._emitChange.bind(this);
  }

  private _findCollection(id: elementId = null) {
    return findById(this._collections, id);
  }

  private _createCollection(id: elementId): Collection {
    const collection = new Collection(id);
    collection.onChange(this._emitChange);
    this._collections.push(collection);
    return collection;
  }

  private _findItem(id: elementId) {
    return findById(this._items, id);
  }

  private _findItemIndex(id: elementId) {
    return findIndexById(this._items, id);
  }

  private _createItem(id: elementId, value: itemValue): Item {
    const item = {
      id,
      value,
    };
    this._items.push(item);
    return item;
  }

  private _emitChange() {
    this._eventEmitter.emit(CHANGE_EVENT);
  }

  /**
   * @returns collection id
  */
  public get id(): elementId {
    return this._id;
  }

  /**
   * Sets collection id
  */
  public set id(id: elementId) {
    this._id = id;
    this._emitChange();
  }

  /**
   * Returns child collection with provided id or creates a new one
   * @example myCollection.collection("id");
   * @returns Child collection
  */
  public collection(id: elementId): Collection {
    return this._findCollection(id) || this._createCollection(id);
  }

  /**
   * Empty children collections
   * @example myCollection.cleanCollections();
  */
  public cleanCollections(): void {
    this._collections.forEach(cleanCollection);
  }

  /**
   * Clean items and items in children collections recursively
   * @example myCollection.clean();
  */
   public clean(): void {
    this.cleanCollections();
    this.cleanItems();
  }

  /**
   * Sets the value for the collection item with the provided id or creates a new one
   * @example myCollection.set("id", "value");
   * @returns item
  */
  public set(id: elementId, value: itemValue): Item {
    let item = this._findItem(id);
    if (item) {
      item.value = value;
    } else {
      item = this._createItem(id, value);
    }
    this._emitChange();
    return item;
  }

  /**
   * Returns the value of a collection item
   * @example myCollection.get("id");
   * @returns item value
  */
  public get(id: elementId): itemValue {
    const item = this._findItem(id);
    if(!item) {
      return null;
    }
    return item?.value;
  }

  /**
   * Removes a collection item
   * @example myCollection.remove("id");
  */
  public remove(id: elementId): void {
    const itemIndex = this._findItemIndex(id);
    if (itemIndex > -1) {
      this._items.splice(itemIndex, 1);
      this._emitChange();
    }
  }

  /**
   * Empty collection items
   * @example myCollection.cleanItems();
  */
  public cleanItems(): void {
    this._items = [];
    this._emitChange();
  }

  /**
   * @returns collection items
  */
  public get items(): items {
    return this._items;
  }

  /**
   * @returns collection items and children collection items in a flat array
  */
  public get flat(): flatItems {
    const items = this._items.map((item: Item): FlatItem => {
      return {
        ...item,
        collection: this._id,
      };
    });
    const collections = this._collections.reduce((allItems: flatItems, collection: Collection): flatItems => {
      const collectionItems = collection.flat.map((collectionFlatItem: FlatItem): FlatItem => {
        return {
          ...collectionFlatItem,
          collection: `${this._id}:${collectionFlatItem.collection}`,
        };
      });
      return [...allItems, ...collectionItems];
    }, []);

    return [...items, ...collections];
  }

  /**
   * Executes the provided function whenever a change is made in items, children collections or their items
   * @returns function to remove event listener
  */
  public onChange(listener: EventListener) {
    return addEventListener(listener, CHANGE_EVENT, this._eventEmitter);
  }
}
