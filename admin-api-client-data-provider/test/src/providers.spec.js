import {
  behaviorsModel,
  behavior,
  fixturesModel,
  fixture,
  alertsModel,
  alert,
} from "../../src/providers";

describe("behaviorsModel findByName custom query", () => {
  it("should return name urlParam", () => {
    expect(behaviorsModel.queryMethods.byName("foo")).toEqual({
      urlParams: {
        name: "foo",
      },
    });
  });
});

describe("behavior alias", () => {
  it("should return queried behaviorsModel", () => {
    expect(behavior("foo")).toEqual(behaviorsModel.queries.byName("foo"));
  });
});

describe("fixturesModel findById custom query", () => {
  it("should return name urlParam", () => {
    expect(fixturesModel.queryMethods.byId("foo")).toEqual({
      urlParams: {
        id: "foo",
      },
    });
  });
});

describe("fixture alias", () => {
  it("should return queried fixturesModel", () => {
    expect(fixture("foo")).toEqual(fixturesModel.queries.byId("foo"));
  });
});

describe("alertsModel findById custom query", () => {
  it("should return name urlParam", () => {
    expect(alertsModel.queryMethods.byId("foo")).toEqual({
      urlParams: {
        id: "foo",
      },
    });
  });
});

describe("alert alias", () => {
  it("should return queried alertsModel", () => {
    expect(alert("foo")).toEqual(alertsModel.queries.byId("foo"));
  });
});
