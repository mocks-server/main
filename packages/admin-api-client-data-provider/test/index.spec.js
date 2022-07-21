import { configClient, about, config, alerts, alert } from "../index";

describe("Exported methods", () => {
  it("should include configClient", () => {
    expect(configClient).toBeDefined();
  });

  it("should include about", () => {
    expect(about).toBeDefined();
  });

  it("should include config", () => {
    expect(config).toBeDefined();
  });

  it("should include alerts", () => {
    expect(alerts).toBeDefined();
  });

  it("should include alert", () => {
    expect(alert).toBeDefined();
  });
});
