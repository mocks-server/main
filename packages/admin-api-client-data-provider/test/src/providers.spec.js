import { alertsModel, alert } from "../../src/providers";

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
