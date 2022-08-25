import Plugin from "../src/Plugin";

describe("Plugin", () => {
  describe("id", () => {
    it("should be openapi", () => {
      expect(Plugin.id).toEqual("openapi");
    });
  });
});
