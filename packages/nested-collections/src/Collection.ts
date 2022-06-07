import EventEmitter from "events";

import { CHANGE_EVENT, EventListener, addEventListener } from "./events";

export { EventListener } from "./events";

export type elementId = string | null;

export interface ElementBasics {
  id: elementId;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type itemValue = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface CollectionOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  Decorator?: any;
  parent?: Collection,
  [x: string | number | symbol]: unknown;
}

export interface Item extends ElementBasics {
  value: itemValue;
}

export interface FlatItem extends Item {
  collection: elementId,
}

export type items = Item[];
export type flatItems = FlatItem[];
export type collections = Collection[];
export type element = Item | Collection;
export type elements = element[];
export interface IdComparer {
  (element: element): boolean
}

function elementIdIsEqualTo(element: element, id: elementId): boolean {
  return element.id === id;
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private _Decorator: any;
  private _options: CollectionOptions;
  private _parent?: Collection;

  /**
   * Creates a root collection
   * @example const collection = new Collection("id")
   * @returns Root collection
  */
  constructor(id: elementId = null, options: CollectionOptions = {}) {
    this._options = options;
    this._Decorator = options.Decorator || Collection;
    this._parent = options.parent;
    this._eventEmitter = new EventEmitter();
    this._id = id;
    this._collections = [];
    this._items = [];
    this._emitChange = this._emitChange.bind(this);
  }

  private _findCollection(id: elementId = null) {
    return findById(this._collections, id);
  }

  private _createCollection(id: elementId): Collection {
    const collection = new this._Decorator(id, {...this._options, parent: this});
    collection.onChange(this._emitChange);
    this._collections.push(collection);
    return collection;
  }

  private _findItem(id: elementId) {
    return findById(this._items, id);
  }

  private _findElementIndex(id: elementId, elements: elements) {
    return findIndexById(elements, id);
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

  private _setItem(id: elementId, value: itemValue): Item {
    let item = this._findItem(id);
    if (item) {
      item.value = value;
    } else {
      item = this._createItem(id, value);
    }
    this._emitChange();
    return item;
  }

  private _changeId(id: elementId) {
    this._id = id;
    this._emitChange();
  }

  private _removeElement(id: elementId, elements: elements) {
    const elementIndex = this._findElementIndex(id, elements);
    if (elementIndex > -1) {
      elements.splice(elementIndex, 1);
      this._emitChange();
    }
  }

  private _removeCollection(id: elementId) {
    this._removeElement(id, this._collections);
  }

  private _remove(id: elementId): void {
    this._removeElement(id, this._items);
  }

  private get _path(): elementId {
    if(this._parent) {
      return `${this._parent._path}:${this._id}`;
    }
    return this._id;
  }

  private get _flat(): flatItems {
    const items = this._items.map((item: Item): FlatItem => {
      return {
        ...item,
        collection: this._path,
      };
    });
    const collections = this._collections.reduce((allItems: flatItems, collection: Collection): flatItems => {
      const collectionItems = collection._flat.map((collectionFlatItem: FlatItem): FlatItem => {
        return collectionFlatItem;
      });
      return [...allItems, ...collectionItems];
    }, []);

    return [...items, ...collections];
  }

  private _merge(collection: Collection) {
    [...collection._items].forEach((item: Item) => {
      this._setItem(item.id, item.value);
      collection._remove(item.id);
    });
    [...collection._collections].forEach((childCollection: Collection) => {
      const sameCollection = this._findCollection(childCollection.id);
      if (sameCollection) {
        sameCollection._merge(childCollection);
      } else {
        this._collections.push(childCollection);
        childCollection._parent = this;
        collection._removeCollection(childCollection.id);
        this._emitChange();
      }
    });
  }

  private _cleanCollections(): void {
    this._collections.forEach(cleanCollection);
  }

  private _cleanItems(): void {
    this._items = [];
    this._emitChange();
  }

  /**
   * @returns collection id
  */
  public get id(): elementId {
    return this._id;
  }

  /**
   * Sets collection id. Do not use it for changing a child collection id. Use renameCollection instead
  */
  public set id(id: elementId) {
    this._changeId(id);
  }

  /**
   * @returns collection id joined with parent collections ids
  */
   public get path(): elementId {
    return this._path;
  }

  /**
   * Removes a collection
   * @example myCollection.removeCollection("id");
  */
  public removeCollection(id: elementId) {
    this._removeCollection(id);
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
   * Merges current collection with the received one recursively
  */
  public merge(collection: Collection) {
    this._merge(collection);
  }

  /**
   * Changes a collection id. Id id already exists in other collection, then it merges them
  */
  public renameCollection(id: elementId, newId: elementId) {
    if( id !== newId ){
      const collection = this._findCollection(id);
      const newCollection = this._findCollection(newId);
      if (collection) {
        if(newCollection) {
          newCollection._merge(collection);
          this._removeCollection(id);
        } else {
          collection._changeId(newId);
        }
      }
    }
  }

  /**
   * Clean items and items in children collections recursively
   * @example myCollection.clean();
  */
  public clean(): void {
    this._cleanCollections();
    this._cleanItems();
  }

  /**
   * Sets the value for the collection item with the provided id or creates a new one
   * @example myCollection.set("id", "value");
   * @returns item
  */
  public set(id: elementId, value: itemValue): Item {
    return this._setItem(id, value);
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
    this._remove(id);
  }

  /**
   * Removes all collection items
   * @example myCollection.cleanItems();
  */
  public cleanItems(): void {
    this._cleanItems();
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
    return this._flat;
  }

  /**
   * Executes the provided function whenever a change is made in items, children collections or their items
   * @returns function to remove event listener
  */
  public onChange(listener: EventListener) {
    return addEventListener(listener, CHANGE_EVENT, this._eventEmitter);
  }
}
