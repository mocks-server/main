import { behaviorsModel, behavior, fixturesModel, fixture } from "../../src/providers";

describe("behaviorsModel findByName custom query", () => {
  it("should return name urlParam", () => {
    expect(behaviorsModel.test.customQueries.byName("foo")).toEqual({
      urlParams: {
        name: "foo"
      }
    });
  });
});

describe("behavior alias", () => {
  it("should return queried behaviorsModel", () => {
    expect(behavior("foo")).toEqual(behaviorsModel.byName("foo"));
  });
});

describe("fixturesModel findById custom query", () => {
  it("should return name urlParam", () => {
    expect(fixturesModel.test.customQueries.byId("foo")).toEqual({
      urlParams: {
        id: "foo"
      }
    });
  });
});

describe("fixture alias", () => {
  it("should return queried fixturesModel", () => {
    expect(fixture("foo")).toEqual(fixturesModel.byId("foo"));
  });
});
