import {
  BASE_PATH,
  ABOUT,
  CONFIG,
  ALERTS,
  COLLECTIONS,
  ROUTES,
  VARIANTS,
  CUSTOM_ROUTE_VARIANTS,
} from "../src/index";

describe("Exported paths", () => {
  describe("paths", () => {
    it("should contain the base path", () => {
      expect(BASE_PATH).toBeDefined();
    });

    it("should contain the about path", () => {
      expect(ABOUT).toBeDefined();
    });

    it("should contain the config path", () => {
      expect(CONFIG).toBeDefined();
    });

    it("should contain the alerts path", () => {
      expect(ALERTS).toBeDefined();
    });

    it("should contain the collections path", () => {
      expect(COLLECTIONS).toBeDefined();
    });

    it("should contain the routes path", () => {
      expect(ROUTES).toBeDefined();
    });

    it("should contain the variants path", () => {
      expect(VARIANTS).toBeDefined();
    });

    it("should contain the custom route variants path", () => {
      expect(CUSTOM_ROUTE_VARIANTS).toBeDefined();
    });
  });
});
