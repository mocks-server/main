import {
  BASE_PATH,
  ABOUT,
  CONFIG,
  ALERTS,
  COLLECTIONS,
  ROUTES,
  VARIANTS,
  CUSTOM_ROUTE_VARIANTS,
  // Legacy, to be removed
  LEGACY_DEFAULT_BASE_PATH,
  LEGACY_ABOUT,
  LEGACY_SETTINGS,
  LEGACY_ALERTS,
  LEGACY_MOCKS,
  LEGACY_ROUTES,
  LEGACY_ROUTES_VARIANTS,
  LEGACY_MOCK_CUSTOM_ROUTES_VARIANTS,
} from "../index";

describe("Exported paths", () => {
  describe("legacy", () => {
    it("should contain the default api base path", () => {
      expect(LEGACY_DEFAULT_BASE_PATH).toBeDefined();
    });

    it("should contain the about path", () => {
      expect(LEGACY_ABOUT).toBeDefined();
    });

    it("should contain the settings path", () => {
      expect(LEGACY_SETTINGS).toBeDefined();
    });

    it("should contain the alerts path", () => {
      expect(LEGACY_ALERTS).toBeDefined();
    });

    it("should contain the mocks path", () => {
      expect(LEGACY_MOCKS).toBeDefined();
    });

    it("should contain the routes path", () => {
      expect(LEGACY_ROUTES).toBeDefined();
    });

    it("should contain the routes-variants path", () => {
      expect(LEGACY_ROUTES_VARIANTS).toBeDefined();
    });

    it("should contain the mock-custom-routes-variants path", () => {
      expect(LEGACY_MOCK_CUSTOM_ROUTES_VARIANTS).toBeDefined();
    });
  });

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
