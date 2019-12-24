import { config, about, settings, behaviorsCollection, behaviorsModel } from "../index";

describe("Exported methods", () => {
  it("should include config", () => {
    expect(config).toBeDefined();
  });

  it("should include about", () => {
    expect(about).toBeDefined();
  });

  it("should include settings", () => {
    expect(settings).toBeDefined();
  });

  it("should include behaviorsCollection", () => {
    expect(behaviorsCollection).toBeDefined();
  });

  it("should include behaviorsModel", () => {
    expect(behaviorsModel).toBeDefined();
  });
});
