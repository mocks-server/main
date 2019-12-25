import { DEFAULT_BASE_PATH, SETTINGS, BEHAVIORS, FIXTURES, ABOUT } from "../index";

describe("Exported paths", () => {
  it("should contain the default api base path", () => {
    expect(DEFAULT_BASE_PATH).toBeDefined();
  });

  it("should contain the settings path", () => {
    expect(SETTINGS).toBeDefined();
  });

  it("should contain the behaviors path", () => {
    expect(BEHAVIORS).toBeDefined();
  });

  it("should contain the fixtures path", () => {
    expect(FIXTURES).toBeDefined();
  });

  it("should contain the about path", () => {
    expect(ABOUT).toBeDefined();
  });
});
