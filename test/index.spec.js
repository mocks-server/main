import { config } from "../index";

describe("Exported methods", () => {
  it("should include config", () => {
    expect(config).toBeDefined();
  });
});
