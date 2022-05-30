import Collection from "../src/Collection.ts";

const COLLECTION_ID = "foo-collection";
const ITEM_ID = "foo-item";
const FOO_VALUE = "foo-value";

describe("Collection", () => {
  describe("id", () => {
    it("getter should return null if no collection id is provided", () => {
      const collection = new Collection();
      expect(collection.id).toEqual(null);
    });

    it("getter should return collection id if provided", () => {
      const collection = new Collection(COLLECTION_ID);
      expect(collection.id).toEqual(COLLECTION_ID);
    });

    it("setter should change collection id", () => {
      const collection = new Collection(COLLECTION_ID);
      expect(collection.id).toEqual(COLLECTION_ID);
      collection.id = "new-id";
      expect(collection.id).toEqual("new-id");
    });

    it("should return always same collection if no id is provided when creating children", () => {
      const collection = new Collection();
      expect(collection.collection().collection()).toBe(collection.collection().collection());
    });

    it("should return different collections if ids are different", () => {
      const collection = new Collection();
      expect(collection.collection(COLLECTION_ID)).not.toBe(collection.collection());
    });
  });

  describe("set method", () => {
    it("should set the item value when it is an object", () => {
      const collection = new Collection();
      const value = { foo: "foo" };
      collection.set("foo", value);
      expect(collection.get("foo")).toBe(value);
    });

    it("should set the item value when it is a string", () => {
      const collection = new Collection();
      collection.set("foo", FOO_VALUE);
      expect(collection.get("foo")).toEqual(FOO_VALUE);
    });

    it("should set item with value undefined when no value is provided", () => {
      const collection = new Collection();
      collection.set(ITEM_ID);
      expect(collection.get(ITEM_ID)).toBe(undefined);
    });

    it("should update item value when item id already exists", () => {
      const NEW_VALUE = "foo-2";
      const collection = new Collection();
      collection.set(ITEM_ID, FOO_VALUE);
      expect(collection.get(ITEM_ID)).toEqual(FOO_VALUE);
      collection.set(ITEM_ID, NEW_VALUE);
      expect(collection.get(ITEM_ID)).toEqual(NEW_VALUE);
    });
  });

  describe("get method", () => {
    it("should return undefined when item was set to undefined", () => {
      const collection = new Collection();
      collection.set(ITEM_ID, undefined);
      expect(collection.get(ITEM_ID)).toBe(undefined);
    });

    it("should return null when item does not exists", () => {
      const collection = new Collection();
      expect(collection.get(ITEM_ID)).toEqual(null);
    });

    it("should return null when neither item nor collection exist", () => {
      const collection = new Collection();
      expect(collection.collection().collection().get(ITEM_ID)).toEqual(null);
    });
  });

  describe("remove method", () => {
    it("should remove the item from collection", () => {
      const collection = new Collection();
      collection.set(ITEM_ID, FOO_VALUE);
      expect(collection.items).toEqual([{ id: ITEM_ID, value: FOO_VALUE }]);
      collection.remove(ITEM_ID);
      expect(collection.items).toEqual([]);
    });

    it("should do nothing if the item is not found", () => {
      const collection = new Collection();
      collection.set(ITEM_ID, FOO_VALUE);
      expect(collection.items).toEqual([{ id: ITEM_ID, value: FOO_VALUE }]);
      collection.remove("foo");
      expect(collection.items).toEqual([{ id: ITEM_ID, value: FOO_VALUE }]);
    });

    it("should keep the other elements in the collection in the same order", () => {
      const collection = new Collection();
      collection.set("foo-item-0", FOO_VALUE);
      collection.set(ITEM_ID, FOO_VALUE);
      collection.set("foo-item-2", FOO_VALUE);
      expect(collection.items).toEqual([
        { id: "foo-item-0", value: FOO_VALUE },
        { id: ITEM_ID, value: FOO_VALUE },
        { id: "foo-item-2", value: FOO_VALUE },
      ]);
      collection.remove(ITEM_ID);
      expect(collection.items).toEqual([
        { id: "foo-item-0", value: FOO_VALUE },
        { id: "foo-item-2", value: FOO_VALUE },
      ]);
    });
  });

  describe("cleanItems methods", () => {
    it("should remove all items from collection", () => {
      const collection = new Collection();
      collection.set("foo-item-0", FOO_VALUE);
      collection.set(ITEM_ID, FOO_VALUE);
      collection.set("foo-item-2", FOO_VALUE);
      expect(collection.items).toEqual([
        { id: "foo-item-0", value: FOO_VALUE },
        { id: ITEM_ID, value: FOO_VALUE },
        { id: "foo-item-2", value: FOO_VALUE },
      ]);
      collection.cleanItems();
      expect(collection.items).toEqual([]);
    });
  });

  describe("clean method", () => {
    it("should remove all items from collection and from children collections, but keeping collections references", () => {
      const collection = new Collection();
      const collection2 = collection.collection("new-collection");
      const collection3 = collection2.collection("new-collection-2");

      collection.set("foo-item-0", FOO_VALUE);
      collection.set(ITEM_ID, FOO_VALUE);
      collection.set("foo-item-2", FOO_VALUE);
      collection2.set(ITEM_ID, FOO_VALUE);
      collection3.set("foo-item-3", FOO_VALUE);

      expect(collection.items).toEqual([
        { id: "foo-item-0", value: FOO_VALUE },
        { id: ITEM_ID, value: FOO_VALUE },
        { id: "foo-item-2", value: FOO_VALUE },
      ]);
      expect(collection2.items).toEqual([{ id: ITEM_ID, value: FOO_VALUE }]);
      expect(collection3.items).toEqual([{ id: "foo-item-3", value: FOO_VALUE }]);

      collection.clean();

      expect(collection.items).toEqual([]);
      expect(collection2.items).toEqual([]);
      expect(collection3.items).toEqual([]);
      expect(collection.collection("new-collection")).toEqual(collection2);
      expect(collection.collection("new-collection-2")).toEqual(collection3);
    });
  });
});
