import { createSandbox } from "sinon";
import Collection from "../src/Collection.ts";

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

describe("Collection Decorator", () => {
  let sandbox;
  let CollectionDecorator;

  beforeEach(() => {
    sandbox = createSandbox();
    class Decorator extends Collection {
      constructor(id, options = {}) {
        super(id, { ...options, Decorator: CollectionDecorator });
      }

      set(value, id) {
        super.set(id, value);
      }
    }
    CollectionDecorator = Decorator;
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("id", () => {
    it("getter should return null if no collection id is provided", () => {
      const collection = new CollectionDecorator();
      expect(collection.id).toEqual(null);
    });

    it("getter should return collection id if provided", () => {
      const collection = new CollectionDecorator(COLLECTION_ID);
      expect(collection.id).toEqual(COLLECTION_ID);
    });

    it("setter should change collection id", () => {
      const collection = new CollectionDecorator(COLLECTION_ID);
      expect(collection.id).toEqual(COLLECTION_ID);
      collection.id = "new-id";
      expect(collection.id).toEqual("new-id");
    });

    it("should return always same collection if no id is provided when creating children", () => {
      const collection = new CollectionDecorator();
      expect(collection.collection().collection()).toBe(collection.collection().collection());
    });

    it("should return different collections if ids are different", () => {
      const collection = new CollectionDecorator();
      expect(collection.collection(COLLECTION_ID)).not.toBe(collection.collection());
    });
  });

  describe("set method", () => {
    it("should set the item value when it is an object", () => {
      const collection = new CollectionDecorator();
      const value = { foo: "foo" };
      collection.set(value, "foo");
      expect(collection.get("foo")).toBe(value);
    });

    it("should set the item value when it is a string", () => {
      const collection = new CollectionDecorator();
      collection.set(FOO_VALUE, "foo");
      expect(collection.get("foo")).toEqual(FOO_VALUE);
    });

    it("should set item with value undefined when no value is provided", () => {
      const collection = new CollectionDecorator();
      collection.set(undefined, ITEM_ID);
      expect(collection.get(ITEM_ID)).toBe(undefined);
    });

    it("should update item value when item id already exists", () => {
      const NEW_VALUE = "foo-2";
      const collection = new CollectionDecorator();
      collection.set(FOO_VALUE, ITEM_ID);
      expect(collection.get(ITEM_ID)).toEqual(FOO_VALUE);
      collection.set(NEW_VALUE, ITEM_ID);
      expect(collection.get(ITEM_ID)).toEqual(NEW_VALUE);
    });
  });

  describe("get method", () => {
    it("should return undefined when item was set to undefined", () => {
      const collection = new CollectionDecorator();
      collection.set(undefined, ITEM_ID);
      expect(collection.get(ITEM_ID)).toBe(undefined);
    });

    it("should return null when item does not exists", () => {
      const collection = new CollectionDecorator();
      expect(collection.get(ITEM_ID)).toEqual(null);
    });

    it("should return null when neither item nor collection exist", () => {
      const collection = new CollectionDecorator();
      expect(collection.collection().collection().get(ITEM_ID)).toEqual(null);
    });
  });

  describe("remove method", () => {
    it("should remove the item from collection", () => {
      const collection = new CollectionDecorator();
      collection.set(FOO_VALUE, ITEM_ID);
      expect(collection.items).toEqual([{ id: ITEM_ID, value: FOO_VALUE }]);
      collection.remove(ITEM_ID);
      expect(collection.items).toEqual([]);
    });

    it("should do nothing if the item is not found", () => {
      const collection = new CollectionDecorator();
      collection.set(FOO_VALUE, ITEM_ID);
      expect(collection.items).toEqual([{ id: ITEM_ID, value: FOO_VALUE }]);
      collection.remove("foo");
      expect(collection.items).toEqual([{ id: ITEM_ID, value: FOO_VALUE }]);
    });

    it("should keep the other elements in the collection in the same order", () => {
      const collection = new CollectionDecorator();
      collection.set(FOO_VALUE, "foo-item-0");
      collection.set(FOO_VALUE, ITEM_ID);
      collection.set(FOO_VALUE, "foo-item-2");
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
      const collection = new CollectionDecorator();
      collection.set(FOO_VALUE, "foo-item-0");
      collection.set(FOO_VALUE, ITEM_ID);
      collection.set(FOO_VALUE, "foo-item-2");
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
      const collection = new CollectionDecorator();
      const collection2 = collection.collection("new-collection");
      const collection3 = collection2.collection("new-collection-2");

      collection.set(FOO_VALUE, "foo-item-0");
      collection.set(FOO_VALUE, ITEM_ID);
      collection.set(FOO_VALUE, "foo-item-2");
      collection2.set(FOO_VALUE, ITEM_ID);
      collection3.set(FOO_VALUE, "foo-item-3");

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
      const collection = new CollectionDecorator();
      collection.onChange(() => {
        expect(collection.items).toEqual([{ id: ITEM_ID, value: FOO_VALUE }]);
        done();
      });
      collection.set(FOO_VALUE, ITEM_ID);
    });

    it("should remove event listener when returned function is executed", async () => {
      const collection = new CollectionDecorator();
      const spy = sandbox.spy();
      const removeListener = collection.onChange(spy);
      removeListener();
      collection.set(FOO_VALUE, ITEM_ID);
      await wait();
      expect(spy.callCount).toEqual(0);
    });

    it("should run eventListener whenever a new item is added to any children collection", (done) => {
      const collection = new CollectionDecorator();
      const childCollection = collection.collection("foo").collection("foo");
      collection.onChange(() => {
        expect(childCollection.items).toEqual([{ id: ITEM_ID, value: FOO_VALUE }]);
        done();
      });
      childCollection.set(FOO_VALUE, ITEM_ID);
    });

    it("should run eventListener whenever an item value is changed", (done) => {
      const collection = new CollectionDecorator();
      collection.set(FOO_VALUE, ITEM_ID);
      collection.onChange(() => {
        expect(collection.items).toEqual([{ id: ITEM_ID, value: "foo-new-value" }]);
        done();
      });
      collection.set("foo-new-value", ITEM_ID);
    });

    it("should run eventListener whenever an item value is changed in any children collection", (done) => {
      const collection = new CollectionDecorator();
      const childCollection = collection.collection("foo").collection("foo");
      childCollection.collection().set(ITEM_ID, FOO_VALUE);
      collection.onChange(() => {
        expect(childCollection.items).toEqual([{ id: ITEM_ID, value: "foo-new-value" }]);
        done();
      });
      childCollection.set("foo-new-value", ITEM_ID);
    });

    it("should run eventListener whenever an item is removed", (done) => {
      const collection = new CollectionDecorator();
      collection.set(FOO_VALUE, ITEM_ID);
      collection.onChange(() => {
        expect(collection.items).toEqual([]);
        done();
      });
      collection.remove(ITEM_ID);
    });

    it("should run eventListener whenever an item is removed in any children collection", (done) => {
      const collection = new CollectionDecorator();
      const childCollection = collection.collection("foo").collection("foo");
      childCollection.set(FOO_VALUE, ITEM_ID);
      collection.onChange(() => {
        expect(childCollection.items).toEqual([]);
        done();
      });
      childCollection.remove(ITEM_ID);
    });

    it("should run eventListener whenever the collection is cleaned", (done) => {
      const collection = new CollectionDecorator();
      collection.set(FOO_VALUE, ITEM_ID);
      collection.onChange(() => {
        expect(collection.items).toEqual([]);
        done();
      });
      collection.clean();
    });

    it("should run eventListener whenever any children collection is cleaned", (done) => {
      const collection = new CollectionDecorator();
      const childCollection = collection.collection("foo").collection("foo");
      childCollection.set(FOO_VALUE, ITEM_ID);
      collection.onChange(() => {
        expect(childCollection.items).toEqual([]);
        done();
      });
      childCollection.clean();
    });

    it("should run eventListener whenever the collection items are cleaned", (done) => {
      const collection = new CollectionDecorator();
      collection.set(FOO_VALUE, ITEM_ID);
      collection.onChange(() => {
        expect(collection.items).toEqual([]);
        done();
      });
      collection.cleanItems();
    });

    it("should run eventListener whenever any children collection items are cleaned", (done) => {
      const collection = new CollectionDecorator();
      const childCollection = collection.collection("foo").collection("foo");
      childCollection.set(FOO_VALUE, ITEM_ID);
      collection.onChange(() => {
        expect(childCollection.items).toEqual([]);
        done();
      });
      childCollection.cleanItems();
    });

    it("should run eventListener whenever the collection id changes", (done) => {
      const collection = new CollectionDecorator();
      collection.onChange(() => {
        expect(collection.id).toEqual("foo-new-id");
        done();
      });
      collection.id = "foo-new-id";
    });

    it("should run eventListener whenever any children collection id changes", (done) => {
      const collection = new CollectionDecorator();
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
      const collection = new CollectionDecorator("foo");
      const childCollection1 = collection.collection("foo1");
      const childCollection2 = childCollection1.collection("foo2");

      collection.set(FOO_VALUE, ITEM_ID);
      childCollection1.set(FOO_VALUE, ITEM_ID);
      childCollection1.set("foo-value-2", "foo-item-2");
      childCollection2.set(FOO_VALUE, ITEM_ID);
      childCollection2.set("foo-value-3", "foo-item-3");

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
      const collection = new CollectionDecorator("a");
      collection.set("foo-1-value", "foo-1");
      collection.set("foo-2-value", "foo-2");
      collection.collection("child-1").set("child-1-foo-1-value", "child-1-foo-1");
      collection.collection("child-1").set("child-1-foo-2-value", "child-1-foo-2");
      collection
        .collection("child-1")
        .collection("child-2")
        .set("child-2-foo-1-value", "child-2-foo-1");

      const collection2 = new CollectionDecorator("b");
      collection2.set("b-foo-2-value", "foo-2");
      collection2.collection("child-1").set("b-child-1-foo-1-value", "child-1-foo-1");
      collection2
        .collection("child-1")
        .collection("child-2")
        .set("b-child-2-foo-2-value", "child-2-foo-2");
      collection2.collection("child-3").set("b-child-3-foo-1-value", "child-3-foo-1");

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
});
