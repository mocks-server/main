const index = require("../index");

describe("Exported paths", () => {
  it("should contain the default api base path", () => {
    expect(index.DEFAULT_BASE_PATH).toBeDefined();
  });

  it("should contain the settings path", () => {
    expect(index.SETTINGS).toBeDefined();
  });

  it("should contain the behaviors path", () => {
    expect(index.BEHAVIORS).toBeDefined();
  });

  it("should contain the fixtures path", () => {
    expect(index.FIXTURES).toBeDefined();
  });

  it("should contain the about path", () => {
    expect(index.ABOUT).toBeDefined();
  });
});
