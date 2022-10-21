import { createSandbox } from "sinon";
import { NestedCollections } from "../src/Collection.ts";

const COLLECTION_ID = "foo-collection";
const ITEM_ID = "foo-item";
const FOO_VALUE = "foo-value";

function wait(time = 200) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
}

describe("Collection", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = createSandbox();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("id", () => {
    it("getter should return null if no collection id is provided", () => {
      const collection = new NestedCollections();
      expect(collection.id).toEqual(null);
    });

    it("getter should return collection id if provided", () => {
      const collection = new NestedCollections(COLLECTION_ID);
      expect(collection.id).toEqual(COLLECTION_ID);
    });

    it("setter should change collection id", () => {
      const collection = new NestedCollections(COLLECTION_ID);
      expect(collection.id).toEqual(COLLECTION_ID);
      collection.id = "new-id";
      expect(collection.id).toEqual("new-id");
    });

    it("should return always same collection if no id is provided when creating children", () => {
      const collection = new NestedCollections();
      expect(collection.collection().collection()).toBe(collection.collection().collection());
    });

    it("should return different collections if ids are different", () => {
      const collection = new NestedCollections();
      expect(collection.collection(COLLECTION_ID)).not.toBe(collection.collection());
    });
  });

  describe("path", () => {
    it("getter should return collection id if collection is root", () => {
      const collection = new NestedCollections("foo");
      expect(collection.path).toEqual("foo");
    });

    it("getter should return parent collections ids joined with collection id", () => {
      const collection = new NestedCollections("foo");
      expect(collection.collection("foo-2").collection("foo-3").path).toEqual("foo:foo-2:foo-3");
    });
  });

  describe("root", () => {
    it("should return same collection if it is root", () => {
      const collection = new NestedCollections("foo");
      expect(collection.root).toBe(collection);
    });

    it("should return root collection if it is a namespace", () => {
      const collection = new NestedCollections("foo");
      expect(collection.collection("foo-2").collection("foo-3").root).toBe(collection);
    });
  });

  describe("set method", () => {
    it("should set the item value when it is an object", () => {
      const collection = new NestedCollections();
      const value = { foo: "foo" };
      collection.set("foo", value);
      expect(collection.get("foo")).toBe(value);
    });

    it("should set the item value when it is a string", () => {
      const collection = new NestedCollections();
      collection.set("foo", FOO_VALUE);
      expect(collection.get("foo")).toEqual(FOO_VALUE);
    });

    it("should set item with value undefined when no value is provided", () => {
      const collection = new NestedCollections();
      collection.set(ITEM_ID);
      expect(collection.get(ITEM_ID)).toBe(undefined);
    });

    it("should update item value when item id already exists", () => {
      const NEW_VALUE = "foo-2";
      const collection = new NestedCollections();
      collection.set(ITEM_ID, FOO_VALUE);
      expect(collection.get(ITEM_ID)).toEqual(FOO_VALUE);
      collection.set(ITEM_ID, NEW_VALUE);
      expect(collection.get(ITEM_ID)).toEqual(NEW_VALUE);
    });
  });

  describe("get method", () => {
    it("should return undefined when item was set to undefined", () => {
      const collection = new NestedCollections();
      collection.set(ITEM_ID, undefined);
      expect(collection.get(ITEM_ID)).toBe(undefined);
    });

    it("should return null when item does not exists", () => {
      const collection = new NestedCollections();
      expect(collection.get(ITEM_ID)).toEqual(null);
    });

    it("should return null when neither item nor collection exist", () => {
      const collection = new NestedCollections();
      expect(collection.collection().collection().get(ITEM_ID)).toEqual(null);
    });
  });

  describe("remove method", () => {
    it("should remove the item from collection", () => {
      const collection = new NestedCollections();
      collection.set(ITEM_ID, FOO_VALUE);
      expect(collection.items).toEqual([{ id: ITEM_ID, value: FOO_VALUE }]);
      collection.remove(ITEM_ID);
      expect(collection.items).toEqual([]);
    });

    it("should do nothing if the item is not found", () => {
      const collection = new NestedCollections();
      collection.set(ITEM_ID, FOO_VALUE);
      expect(collection.items).toEqual([{ id: ITEM_ID, value: FOO_VALUE }]);
      collection.remove("foo");
      expect(collection.items).toEqual([{ id: ITEM_ID, value: FOO_VALUE }]);
    });

    it("should keep the other elements in the collection in the same order", () => {
      const collection = new NestedCollections();
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
      const collection = new NestedCollections();
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
      const collection = new NestedCollections();
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
      expect(collection2.collection("new-collection-2")).toEqual(collection3);
    });
  });

  describe("onChange method", () => {
    it("should run eventListener whenever a new item is added", (done) => {
      const collection = new NestedCollections();
      collection.onChange(() => {
        expect(collection.items).toEqual([{ id: ITEM_ID, value: FOO_VALUE }]);
        done();
      });
      collection.set(ITEM_ID, FOO_VALUE);
    });

    it("should remove event listener when returned function is executed", async () => {
      const collection = new NestedCollections();
      const spy = sandbox.spy();
      const removeListener = collection.onChange(spy);
      removeListener();
      collection.set(ITEM_ID, FOO_VALUE);
      await wait();
      expect(spy.callCount).toEqual(0);
    });

    it("should run eventListener whenever a new item is added to any children collection", (done) => {
      const collection = new NestedCollections();
      const childCollection = collection.collection("foo").collection("foo");
      collection.onChange(() => {
        expect(childCollection.items).toEqual([{ id: ITEM_ID, value: FOO_VALUE }]);
        done();
      });
      childCollection.set(ITEM_ID, FOO_VALUE);
    });

    it("should run eventListener whenever an item value is changed", (done) => {
      const collection = new NestedCollections();
      collection.set(ITEM_ID, FOO_VALUE);
      collection.onChange(() => {
        expect(collection.items).toEqual([{ id: ITEM_ID, value: "foo-new-value" }]);
        done();
      });
      collection.set(ITEM_ID, "foo-new-value");
    });

    it("should run eventListener whenever an item value is changed in any children collection", (done) => {
      const collection = new NestedCollections();
      const childCollection = collection.collection("foo").collection("foo");
      childCollection.collection().set(ITEM_ID, FOO_VALUE);
      collection.onChange(() => {
        expect(childCollection.items).toEqual([{ id: ITEM_ID, value: "foo-new-value" }]);
        done();
      });
      childCollection.set(ITEM_ID, "foo-new-value");
    });

    it("should run eventListener whenever an item is removed", (done) => {
      const collection = new NestedCollections();
      collection.set(ITEM_ID, FOO_VALUE);
      collection.onChange(() => {
        expect(collection.items).toEqual([]);
        done();
      });
      collection.remove(ITEM_ID);
    });

    it("should run eventListener whenever an item is removed in any children collection", (done) => {
      const collection = new NestedCollections();
      const childCollection = collection.collection("foo").collection("foo");
      childCollection.set(ITEM_ID, FOO_VALUE);
      collection.onChange(() => {
        expect(childCollection.items).toEqual([]);
        done();
      });
      childCollection.remove(ITEM_ID);
    });

    it("should run eventListener whenever the collection is cleaned", (done) => {
      const collection = new NestedCollections();
      collection.set(ITEM_ID, FOO_VALUE);
      collection.onChange(() => {
        expect(collection.items).toEqual([]);
        done();
      });
      collection.clean();
    });

    it("should run eventListener whenever any children collection is cleaned", (done) => {
      const collection = new NestedCollections();
      const childCollection = collection.collection("foo").collection("foo");
      childCollection.set(ITEM_ID, FOO_VALUE);
      collection.onChange(() => {
        expect(childCollection.items).toEqual([]);
        done();
      });
      childCollection.clean();
    });

    it("should run eventListener whenever the collection items are cleaned", (done) => {
      const collection = new NestedCollections();
      collection.set(ITEM_ID, FOO_VALUE);
      collection.onChange(() => {
        expect(collection.items).toEqual([]);
        done();
      });
      collection.cleanItems();
    });

    it("should run eventListener whenever any children collection items are cleaned", (done) => {
      const collection = new NestedCollections();
      const childCollection = collection.collection("foo").collection("foo");
      childCollection.set(ITEM_ID, FOO_VALUE);
      collection.onChange(() => {
        expect(childCollection.items).toEqual([]);
        done();
      });
      childCollection.cleanItems();
    });

    it("should run eventListener whenever the collection id changes", (done) => {
      const collection = new NestedCollections();
      collection.onChange(() => {
        expect(collection.id).toEqual("foo-new-id");
        done();
      });
      collection.id = "foo-new-id";
    });

    it("should run eventListener whenever any children collection id changes", (done) => {
      const collection = new NestedCollections();
      const childCollection = collection.collection("foo").collection("foo");
      collection.onChange(() => {
        expect(childCollection.id).toEqual("foo-new-id");
        done();
      });
      childCollection.id = "foo-new-id";
    });
  });

  describe("flat getter", () => {
    it("should return flat items of collection and children collections", () => {
      const collection = new NestedCollections("foo");
      const childCollection1 = collection.collection("foo1");
      const childCollection2 = childCollection1.collection("foo2");

      collection.set(ITEM_ID, FOO_VALUE);
      childCollection1.set(ITEM_ID, FOO_VALUE);
      childCollection1.set("foo-item-2", "foo-value-2");
      childCollection2.set(ITEM_ID, FOO_VALUE);
      childCollection2.set("foo-item-3", "foo-value-3");

      expect(collection.flat).toEqual([
        {
          collection: `foo`,
          id: ITEM_ID,
          value: FOO_VALUE,
        },
        {
          collection: `foo:foo1`,
          id: ITEM_ID,
          value: FOO_VALUE,
        },
        {
          collection: `foo:foo1`,
          id: "foo-item-2",
          value: "foo-value-2",
        },
        {
          collection: `foo:foo1:foo2`,
          id: ITEM_ID,
          value: FOO_VALUE,
        },
        {
          collection: `foo:foo1:foo2`,
          id: "foo-item-3",
          value: "foo-value-3",
        },
      ]);
    });
  });

  describe("merge method", () => {
    it("should move items and collections from origin collection to current collection recursively", () => {
      const collection = new NestedCollections("a");
      collection.set("foo-1", "foo-1-value");
      collection.set("foo-2", "foo-2-value");
      collection.collection("child-1").set("child-1-foo-1", "child-1-foo-1-value");
      collection.collection("child-1").set("child-1-foo-2", "child-1-foo-2-value");
      collection
        .collection("child-1")
        .collection("child-2")
        .set("child-2-foo-1", "child-2-foo-1-value");

      const collection2 = new NestedCollections("b");
      collection2.set("foo-2", "b-foo-2-value");
      collection2.collection("child-1").set("child-1-foo-1", "b-child-1-foo-1-value");
      collection2
        .collection("child-1")
        .collection("child-2")
        .set("child-2-foo-2", "b-child-2-foo-2-value");
      collection2.collection("child-3").set("child-3-foo-1", "b-child-3-foo-1-value");

      collection.merge(collection2);

      expect(collection.flat).toEqual([
        { id: "foo-1", value: "foo-1-value", collection: "a" },
        { id: "foo-2", value: "b-foo-2-value", collection: "a" },
        {
          id: "child-1-foo-1",
          value: "b-child-1-foo-1-value",
          collection: "a:child-1",
        },
        {
          id: "child-1-foo-2",
          value: "child-1-foo-2-value",
          collection: "a:child-1",
        },
        {
          id: "child-2-foo-1",
          value: "child-2-foo-1-value",
          collection: "a:child-1:child-2",
        },
        {
          id: "child-2-foo-2",
          value: "b-child-2-foo-2-value",
          collection: "a:child-1:child-2",
        },
        {
          id: "child-3-foo-1",
          value: "b-child-3-foo-1-value",
          collection: "a:child-3",
        },
      ]);

      expect(collection2.flat).toEqual([]);
    });
  });

  describe("renameCollection method", () => {
    it("should merge the collection if there is another with the same id", () => {
      const collection = new NestedCollections("a");
      collection.set("foo-1", "foo-1-value");
      collection.set("foo-2", "foo-2-value");
      collection.collection("child-1").set("child-1-foo-1", "child-1-foo-1-value");
      collection.collection("child-1").set("child-1-foo-2", "child-1-foo-2-value");
      collection
        .collection("child-1")
        .collection("child-2")
        .set("child-2-foo-1", "child-2-foo-1-value");

      collection.collection("b-child-1").set("child-1-foo-1", "b-child-1-foo-1-value");
      collection.collection("b-child-1").set("b-child-1-foo-2", "b-child-1-foo-2-value");
      collection
        .collection("b-child-1")
        .collection("child-2")
        .set("child-2-foo-2", "b-child-2-foo-2-value");
      collection.collection("child-3").set("child-3-foo-1", "b-child-3-foo-1-value");

      collection.renameCollection("child-1", "b-child-1");

      expect(collection.flat).toEqual([
        { id: "foo-1", value: "foo-1-value", collection: "a" },
        { id: "foo-2", value: "foo-2-value", collection: "a" },
        {
          id: "child-1-foo-1",
          value: "child-1-foo-1-value",
          collection: "a:b-child-1",
        },
        {
          id: "b-child-1-foo-2",
          value: "b-child-1-foo-2-value",
          collection: "a:b-child-1",
        },
        {
          id: "child-1-foo-2",
          value: "child-1-foo-2-value",
          collection: "a:b-child-1",
        },
        {
          id: "child-2-foo-2",
          value: "b-child-2-foo-2-value",
          collection: "a:b-child-1:child-2",
        },
        {
          id: "child-2-foo-1",
          value: "child-2-foo-1-value",
          collection: "a:b-child-1:child-2",
        },
        {
          id: "child-3-foo-1",
          value: "b-child-3-foo-1-value",
          collection: "a:child-3",
        },
      ]);
    });

    it("should change collection id if there is no other collection with same id", () => {
      const collection = new NestedCollections("a");
      collection.collection("child-1").set("child-1-foo-1", "child-1-foo-1-value");
      collection.collection("child-2").set("child-2-foo-1", "child-2-foo-1-value");

      collection.renameCollection("child-1", "b-child-1");

      expect(collection.flat).toEqual([
        {
          id: "child-1-foo-1",
          value: "child-1-foo-1-value",
          collection: "a:b-child-1",
        },
        {
          id: "child-2-foo-1",
          value: "child-2-foo-1-value",
          collection: "a:child-2",
        },
      ]);
    });

    it("should do nothing if collection id does not exist", async () => {
      const collection = new NestedCollections("a");
      collection.collection("child-1").set("child-1-foo-1", "child-1-foo-1-value");
      collection.collection("child-2").set("child-2-foo-1", "child-2-foo-1-value");

      const spy = sandbox.spy();
      collection.onChange(spy);

      collection.renameCollection("child-foo", "b-child-1");

      expect(collection.flat).toEqual([
        {
          id: "child-1-foo-1",
          value: "child-1-foo-1-value",
          collection: "a:child-1",
        },
        {
          id: "child-2-foo-1",
          value: "child-2-foo-1-value",
          collection: "a:child-2",
        },
      ]);

      await wait();
      expect(spy.callCount).toEqual(0);
    });

    it("should do nothing if collection new id is the same", async () => {
      const collection = new NestedCollections("a");
      collection.collection("child-1").set("child-1-foo-1", "child-1-foo-1-value");
      collection.collection("child-2").set("child-2-foo-1", "child-2-foo-1-value");

      const spy = sandbox.spy();
      collection.onChange(spy);

      collection.renameCollection("child-1", "child-1");

      expect(collection.flat).toEqual([
        {
          id: "child-1-foo-1",
          value: "child-1-foo-1-value",
          collection: "a:child-1",
        },
        {
          id: "child-2-foo-1",
          value: "child-2-foo-1-value",
          collection: "a:child-2",
        },
      ]);

      await wait();
      expect(spy.callCount).toEqual(0);
    });
  });

  describe("removeCollection method", () => {
    it("should remove collection and items recursively", () => {
      const collection = new NestedCollections("a");
      collection.set("foo-1", "foo-1-value");
      collection.collection("child-1").set("child-1-foo-1", "child-1-foo-1-value");
      collection
        .collection("child-1")
        .collection("child-2")
        .set("child-2-foo-1", "child-2-foo-1-value");
      collection.collection("child-2").set("child-2-foo-1", "child-2-foo-1-value");

      expect(collection.flat).toEqual([
        { id: "foo-1", value: "foo-1-value", collection: "a" },
        {
          id: "child-1-foo-1",
          value: "child-1-foo-1-value",
          collection: "a:child-1",
        },
        {
          id: "child-2-foo-1",
          value: "child-2-foo-1-value",
          collection: "a:child-1:child-2",
        },
        {
          id: "child-2-foo-1",
          value: "child-2-foo-1-value",
          collection: "a:child-2",
        },
      ]);

      collection.removeCollection("child-1");

      expect(collection.flat).toEqual([
        { id: "foo-1", value: "foo-1-value", collection: "a" },
        {
          id: "child-2-foo-1",
          value: "child-2-foo-1-value",
          collection: "a:child-2",
        },
      ]);
    });

    it("should do nothing if collection does not exist", async () => {
      const collection = new NestedCollections("a");
      collection.set("foo-1", "foo-1-value");
      collection.collection("child-1").set("child-1-foo-1", "child-1-foo-1-value");

      const spy = sandbox.spy();
      collection.onChange(spy);

      expect(collection.flat).toEqual([
        { id: "foo-1", value: "foo-1-value", collection: "a" },
        {
          id: "child-1-foo-1",
          value: "child-1-foo-1-value",
          collection: "a:child-1",
        },
      ]);

      collection.removeCollection("child-2");

      expect(collection.flat).toEqual([
        { id: "foo-1", value: "foo-1-value", collection: "a" },
        {
          id: "child-1-foo-1",
          value: "child-1-foo-1-value",
          collection: "a:child-1",
        },
      ]);

      await wait();
      expect(spy.callCount).toEqual(0);
    });
  });
});
