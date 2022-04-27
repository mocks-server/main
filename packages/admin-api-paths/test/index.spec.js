import {
  DEFAULT_BASE_PATH,
  ABOUT,
  SETTINGS,
  ALERTS,
  MOCKS,
  ROUTES,
  ROUTES_VARIANTS,
  MOCK_CUSTOM_ROUTES_VARIANTS,
} from "../index";

describe("Exported paths", () => {
  it("should contain the default api base path", () => {
    expect(DEFAULT_BASE_PATH).toBeDefined();
  });

  it("should contain the about path", () => {
    expect(ABOUT).toBeDefined();
  });

  it("should contain the settings path", () => {
    expect(SETTINGS).toBeDefined();
  });

  it("should contain the alerts path", () => {
    expect(ALERTS).toBeDefined();
  });

  it("should contain the mocks path", () => {
    expect(MOCKS).toBeDefined();
  });

  it("should contain the routes path", () => {
    expect(ROUTES).toBeDefined();
  });

  it("should contain the routes-variants path", () => {
    expect(ROUTES_VARIANTS).toBeDefined();
  });

  it("should contain the mock-custom-routes-variants path", () => {
    expect(MOCK_CUSTOM_ROUTES_VARIANTS).toBeDefined();
  });
});
