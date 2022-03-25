import {
  config,
  about,
  settings,
  behaviors,
  behavior,
  behaviorsModel,
  fixtures,
  fixture,
  fixturesModel,
  alerts,
  alert,
  alertsModel,
} from "../index";

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

  it("should include behaviors", () => {
    expect(behaviors).toBeDefined();
  });

  it("should include behavior", () => {
    expect(behavior).toBeDefined();
  });

  it("should include behaviorsModel", () => {
    expect(behaviorsModel).toBeDefined();
  });

  it("should include fixtures", () => {
    expect(fixtures).toBeDefined();
  });

  it("should include fixture", () => {
    expect(fixture).toBeDefined();
  });

  it("should include fixturesModel", () => {
    expect(fixturesModel).toBeDefined();
  });

  it("should include alerts", () => {
    expect(alerts).toBeDefined();
  });

  it("should include alert", () => {
    expect(alert).toBeDefined();
  });

  it("should include alertsModel", () => {
    expect(alertsModel).toBeDefined();
  });
});
