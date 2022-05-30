type elementId = string;

interface ElementBasics {
  id: elementId;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type itemValue = any;

interface Item extends ElementBasics {
  value: itemValue;
}

type items = Item[];

type collectionId = elementId | null;
type collections = Collection[];

function findById(elements: items, elementId: elementId): Item | null;
function findById(elements: collections, elementId: elementId): Collection | null;
function findById(elements: ElementBasics[], elementId: elementId) {
  return elements.find((element: Item | Collection) => {
    return element.id === elementId;
  }) || null;
}

export default class Collection implements ElementBasics {
  private _id: elementId;
  private _collections: collections
  private _items: items

  /**
   * Creates a root collection
   * @example const collection = new Collection("id")
   * @returns Root collection
  */
  constructor(id: collectionId) {
    this._id = id;
    this._collections = [];
    this._items = [];
  }

  private _findCollection(id: elementId) {
    return findById(this._collections, id);
  }

  private _createCollection(id: elementId): Collection {
    const collection = new Collection(id);
    this._collections.push(collection);
    return collection;
  }

  private _findItem(id: elementId) {
    return findById(this._items, id);
  }

  private _createItem(id: elementId, value: itemValue): Item {
    const item = {
      id,
      value,
    };
    this._items.push(item);
    return item;
  }

  /**
   * @returns collection id
  */
  public get id(): collectionId {
    return this._id;
  }

  /**
   * Returns child collection with provided id or creates a new one
   * @example myCollection.collection("id");
   * @returns Child collection
  */
  public collection(id: collectionId): Collection {
    return this._findCollection(id) || this._createCollection(id);
  }

  /**
   * Sets the value for the collection item with the provided id or creates a new one
   * @example myCollection.set("id", "value");
   * @returns item
  */
  public setItem(id: elementId, value: itemValue): Item {
    let item = this._findItem(id);
    if (item) {
      item.value = value;
    } else {
      item = this._createItem(id, value);
    }
    return item;
  }
}
