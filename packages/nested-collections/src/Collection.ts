import EventEmitter from "events";

import { CHANGE_EVENT, addEventListener } from "./Events";

import type {
  CollectionId,
  CollectionElement,
  CollectionIdComparer,
  CollectionItem,
  CollectionInterface,
  Collections,
  CollectionElements,
  CollectionItems,
  CollectionOptions,
  CollectionItemValue,
  CollectionFlatItems,
  CollectionFlatItem,
  CollectionBaseInterface,
  CollectionConstructor,
} from "./Collection.types";
import type { EventsListener, EventsListenerRemover } from "./Events.types";

function elementIdIsEqualTo(element: CollectionElement, id: CollectionId): boolean {
  return element.id === id;
}

function ElementIdIsEqualToId(id: CollectionId): CollectionIdComparer {
  return function (element: CollectionElement) {
    return elementIdIsEqualTo(element, id);
  };
}

function findById(elements: CollectionItems, id: CollectionId): CollectionItem | null;
function findById(elements: Collections, id: CollectionId): CollectionInterface | null;
function findById(elements: CollectionElements, id: CollectionId) {
  return elements.find(ElementIdIsEqualToId(id)) || null;
}

function findIndexById(elements: CollectionElements, id: CollectionId): number {
  return elements.findIndex(ElementIdIsEqualToId(id));
}

function cleanCollection(collection: CollectionBaseInterface): void {
  collection.clean();
}

export abstract class BaseNestedCollections implements CollectionBaseInterface {
  private _id: CollectionId;
  private _collections: this[];
  private _items: CollectionItems;
  private _eventEmitter: EventEmitter;
  private _options: CollectionOptions;
  private _parent?: this;
  private _root: this;
  private _previousFlatString: string;

  constructor(id: CollectionId = null, options: CollectionOptions = {}) {
    this._options = options;
    this._parent = options.parent ? (options.parent as this) : undefined;
    this._root = (options.root as this) || this;
    this._eventEmitter = new EventEmitter();
    this._id = id;
    this._collections = [];
    this._items = [];
    this._emitChange = this._emitChange.bind(this);
  }

  public get path(): CollectionId {
    return this._path;
  }

  public get root(): this {
    return this._root;
  }

  public get items(): CollectionItems {
    return this._items;
  }

  public get collections(): this[] {
    return this._collections;
  }

  protected get _path(): CollectionId {
    if (this.parent) {
      return `${this.parent.path}:${this._id}`;
    }
    return this._id;
  }

  protected get _flat(): CollectionFlatItems {
    const items = this._items.map((item: CollectionItem): CollectionFlatItem => {
      return {
        ...item,
        collection: this._path,
      };
    });
    const collections = this._collections.reduce(
      (allItems: CollectionFlatItems, collection: this): CollectionFlatItems => {
        const collectionItems = collection._flat.map(
          (collectionFlatItem: CollectionFlatItem): CollectionFlatItem => {
            return collectionFlatItem;
          }
        );
        return [...allItems, ...collectionItems];
      },
      []
    );

    return [...items, ...collections];
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public get id(): CollectionId {
    return this._id;
  }

  public set id(id: CollectionId) {
    if (this.parent) {
      this.parent.renameCollection(this.id, id);
    } else {
      this._changeId(id);
    }
  }

  // eslint-disable-next-line @typescript-eslint/member-ordering
  public get parent(): this | undefined {
    return this._parent;
  }

  protected set parent(parent: this | undefined) {
    this._parent = parent;
  }

  public removeCollection(id: CollectionId) {
    this._removeCollection(id);
  }

  public collection(id: CollectionId): this {
    return this._findCollection(id) || this._createCollection(id);
  }

  public merge(collection: this) {
    this._merge(collection);
  }

  public renameCollection(id: CollectionId, newId: CollectionId) {
    if (id !== newId) {
      const collection = this._findCollection(id);
      const newCollection = this._findCollection(newId);
      if (collection) {
        if (newCollection) {
          newCollection.merge(collection);
          this._removeCollection(id);
        } else {
          collection._changeId(newId);
        }
      }
    }
  }

  public clean(): void {
    this._cleanCollections();
    this._cleanItems();
  }

  public get(id: CollectionId): CollectionItemValue {
    const item = this._findItem(id);
    if (!item) {
      return null;
    }
    return item?.value;
  }

  public remove(id: CollectionId): void {
    this._remove(id);
  }

  public cleanItems(): void {
    this._cleanItems();
  }

  public onChange(listener: EventsListener): EventsListenerRemover {
    return addEventListener(listener, CHANGE_EVENT, this._eventEmitter);
  }

  protected _set(id: CollectionId, value: CollectionItemValue): CollectionItem {
    let item = this._findItem(id);
    if (item) {
      item.value = value;
    } else {
      item = this._createItem(id, value);
    }
    this._emitChange();
    return item;
  }

  protected _changeId(id: CollectionId): void {
    this._id = id;
    this._emitChange();
  }

  private _findCollection(id: CollectionId = null): this | undefined {
    const collectionFound = findById(this._collections, id) as unknown;
    if (collectionFound) {
      return collectionFound as this;
    }
  }

  private _createCollection(collectionId: CollectionId): this {
    const collection = new (this.constructor as new (
      id: CollectionId,
      options: CollectionOptions
    ) => this)(collectionId, { ...this._options, parent: this, root: this._root });
    collection.onChange(this._emitChange);
    this._collections.push(collection);
    return collection;
  }

  private _findItem(id: CollectionId) {
    return findById(this._items, id);
  }

  private _findElementIndex(id: CollectionId, elements: CollectionElements) {
    return findIndexById(elements, id);
  }

  private _createItem(id: CollectionId, value: CollectionItemValue): CollectionItem {
    const item = {
      id,
      value,
    };
    this._items.push(item);
    return item;
  }

  private _emitChange(): void {
    const currentFlatString = JSON.stringify(this._flat);
    if (currentFlatString !== this._previousFlatString) {
      this._previousFlatString = currentFlatString;
      this._eventEmitter.emit(CHANGE_EVENT);
    }
  }

  private _removeElement(id: CollectionId, elements: CollectionElements): void {
    const elementIndex = this._findElementIndex(id, elements);
    if (elementIndex > -1) {
      elements.splice(elementIndex, 1);
      this._emitChange();
    }
  }

  private _removeCollection(id: CollectionId): void {
    this._removeElement(id, this._collections);
  }

  private _remove(id: CollectionId): void {
    this._removeElement(id, this._items);
  }

  private _merge(collection: this) {
    [...collection.items].forEach((item: CollectionItem) => {
      this._set(item.id, item.value);
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
}

export const NestedCollections: CollectionConstructor = class NestedCollections
  extends BaseNestedCollections
  implements CollectionInterface
{
  public get flat(): CollectionFlatItems {
    return this._flat;
  }

  public set(id: CollectionId, value: CollectionItemValue): CollectionItem {
    return this._set(id, value);
  }
};
