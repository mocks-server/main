import { behaviorsModel, fixturesModel } from "../../src/providers";

describe("behaviorsModel findByName custom query", () => {
  it("should return name urlParam", () => {
    expect(behaviorsModel.test.customQueries.findByName("foo")).toEqual({
      urlParams: {
        name: "foo"
      }
    });
  });
});

describe("fixturesModel findById custom query", () => {
  it("should return name urlParam", () => {
    expect(fixturesModel.test.customQueries.findById("foo")).toEqual({
      urlParams: {
        id: "foo"
      }
    });
  });
});
