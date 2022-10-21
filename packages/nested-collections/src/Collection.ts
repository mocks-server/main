import EventEmitter from "events";

import { CHANGE_EVENT, addEventListener } from "./events";

import type { EventsTs } from "./types/Events";
import type { CollectionTs } from "./types/Collection";

function elementIdIsEqualTo(element: CollectionTs.Element, id: CollectionTs.Id): boolean {
  return element.id === id;
}

function ElementIdIsEqualToId(id: CollectionTs.Id): CollectionTs.IdComparer {
  return function (element: CollectionTs.Element) {
    return elementIdIsEqualTo(element, id);
  };
}

function findById(elements: CollectionTs.Items, id: CollectionTs.Id): CollectionTs.Item | null;
function findById(elements: CollectionTs.Collections, id: CollectionTs.Id): CollectionTs.Interface | null;
function findById(elements: CollectionTs.Elements, id: CollectionTs.Id) {
  return elements.find(ElementIdIsEqualToId(id)) || null;
}

function findIndexById(elements: CollectionTs.Elements, id: CollectionTs.Id): number {
  return elements.findIndex(ElementIdIsEqualToId(id));
}

function cleanCollection(collection: CollectionTs.Interface): void {
  collection.clean();
}

// TODO, revoew protecteds and privates
// TODO, define flat in a protected method
// TODO, rename _setItem into _set
// TODO, rename Interface into BaseInstance
// TODO, rename Interface2 into Instance
// TODO, review NestedCollections name
// TODO, review CollectionTs name
// TODO, apply these naming changes to all other packages
// TODO, review which methods have to be overridable (apart from set and flat)

export abstract class BaseNestedCollections implements CollectionTs.Interface {
  private _id: CollectionTs.Id;
  private _collections: this[];
  private _items: CollectionTs.Items;
  private _eventEmitter: EventEmitter;
  private _options: CollectionTs.Options;
  private _parent?: this;
  private _root: this;

  constructor(id: CollectionTs.Id = null, options: CollectionTs.Options = {}) {
    this._options = options;
    this._parent = options.parent ? options.parent as this : undefined;
    this._root = options.root as this || this;
    this._eventEmitter = new EventEmitter();
    this._id = id;
    this._collections = [];
    this._items = [];
    this._emitChange = this._emitChange.bind(this);
  }

  private _findCollection(id: CollectionTs.Id = null): this | undefined {
    const collectionFound = findById(this._collections, id);
    if(collectionFound) {
      return collectionFound as this;
    }
  }

  private _createCollection(id: CollectionTs.Id): this {
    const collection = new (this.constructor as new(id: CollectionTs.Id, options: CollectionTs.Options) => this)(id, {...this._options, parent: this, root: this._root })
    collection.onChange(this._emitChange);
    this._collections.push(collection);
    return collection;
  }

  private _findItem(id: CollectionTs.Id) {
    return findById(this._items, id);
  }

  private _findElementIndex(id: CollectionTs.Id, elements: CollectionTs.Elements) {
    return findIndexById(elements, id);
  }

  private _createItem(id: CollectionTs.Id, value: CollectionTs.ItemValue): CollectionTs.Item {
    const item = {
      id,
      value,
    };
    this._items.push(item);
    return item;
  }

  private _emitChange(): void {
    this._eventEmitter.emit(CHANGE_EVENT);
  }

  protected _setItem(id: CollectionTs.Id, value: CollectionTs.ItemValue): CollectionTs.Item {
    let item = this._findItem(id);
    if (item) {
      item.value = value;
    } else {
      item = this._createItem(id, value);
    }
    this._emitChange();
    return item;
  }

  private _changeId(id: CollectionTs.Id): void {
    this._id = id;
    this._emitChange();
  }

  private _removeElement(id: CollectionTs.Id, elements: CollectionTs.Elements): void {
    const elementIndex = this._findElementIndex(id, elements);
    if (elementIndex > -1) {
      elements.splice(elementIndex, 1);
      this._emitChange();
    }
  }

  private _removeCollection(id: CollectionTs.Id): void {
    this._removeElement(id, this._collections);
  }

  private _remove(id: CollectionTs.Id): void {
    this._removeElement(id, this._items);
  }

  protected get _path(): CollectionTs.Id {
    if(this.parent) {
      return `${this.parent.path}:${this._id}`;
    }
    return this._id;
  }

  protected get _flat(): CollectionTs.FlatItems {
    const items = this._items.map((item: CollectionTs.Item): CollectionTs.FlatItem => {
      return {
        ...item,
        collection: this._path,
      };
    });
    const collections = this._collections.reduce((allItems: CollectionTs.FlatItems, collection: this): CollectionTs.FlatItems => {
      const collectionItems = collection._flat.map((collectionFlatItem: CollectionTs.FlatItem): CollectionTs.FlatItem => {
        return collectionFlatItem;
      });
      return [...allItems, ...collectionItems];
    }, []);

    return [...items, ...collections];
  }

  private _merge(collection: this) {
    [...collection.items].forEach((item: CollectionTs.Item) => {
      this._setItem(item.id, item.value);
      collection.remove(item.id);
    });
    [...collection.collections].forEach((childCollection: this) => {
      const sameCollection = this._findCollection(childCollection.id);
      if (sameCollection) {
        sameCollection.merge(childCollection);
      } else {
        this._collections.push(childCollection);
        childCollection.parent = this;
        collection.removeCollection(childCollection.id);
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

  public get id(): CollectionTs.Id {
    return this._id;
  }

  // TODO, use protected

  /**
   * Sets collection id. Do not use it for changing a child collection id. Use renameCollection instead
  */
  public set id(id: CollectionTs.Id) {
    this._changeId(id);
  }

  public get path(): CollectionTs.Id {
    return this._path;
  }

  public removeCollection(id: CollectionTs.Id) {
    this._removeCollection(id);
  }

  public collection(id: CollectionTs.Id): this {
    return this._findCollection(id) || this._createCollection(id);
  }

  public merge(collection: this) {
    this._merge(collection);
  }

  public renameCollection(id: CollectionTs.Id, newId: CollectionTs.Id) {
    if( id !== newId ){
      const collection = this._findCollection(id);
      const newCollection = this._findCollection(newId);
      if (collection) {
        if(newCollection) {
          newCollection.merge(collection);
          this._removeCollection(id);
        } else {
          collection.id = newId;
        }
      }
    }
  }

  public clean(): void {
    this._cleanCollections();
    this._cleanItems();
  }

  public get(id: CollectionTs.Id): CollectionTs.ItemValue {
    const item = this._findItem(id);
    if(!item) {
      return null;
    }
    return item?.value;
  }

  public remove(id: CollectionTs.Id): void {
    this._remove(id);
  }

  public cleanItems(): void {
    this._cleanItems();
  }

  public get items(): CollectionTs.Items {
    return this._items;
  }

  public get collections(): this[] {
    return this._collections;
  }

  public get parent(): this | undefined {
    return this._parent;
  }

  protected set parent(parent: this | undefined) {
    this._parent = parent;
  }

  public get flat(): CollectionTs.FlatItems {
    return this._flat;
  }

  public onChange(listener: EventsTs.Listener): EventsTs.ListenerRemover {
    return addEventListener(listener, CHANGE_EVENT, this._eventEmitter);
  }

  public get root(): this {
    return this._root;
  }
}

export class NestedCollections extends BaseNestedCollections implements CollectionTs.Interface2 {
  public set(id: CollectionTs.Id, value: CollectionTs.ItemValue): CollectionTs.Item {
    return this._setItem(id, value);
  }
}
