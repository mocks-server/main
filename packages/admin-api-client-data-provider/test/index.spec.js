import { config, about, settings, alerts, alert, alertsModel } from "../index";

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
