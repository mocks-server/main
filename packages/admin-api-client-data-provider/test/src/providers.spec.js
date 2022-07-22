import { alert } from "../../src/providers";

describe("alert findById custom query", () => {
  it("should return name urlParam", () => {
    expect(alert.queryMethods.byId("foo")).toEqual({
      urlParams: {
        id: "foo",
      },
    });
  });
});
