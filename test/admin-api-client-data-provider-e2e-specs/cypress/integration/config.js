describe("Settings section", () => {
  const SELECTORS = {
    CONFIG: "config-config",
    PLUGINS: "config-plugins",
    FILES: "config-files",
    SERVER: "config-server",
    MOCK: "config-mock",
  };

  before(() => {
    cy.visit("/");
  });

  it("should display current path", () => {
    cy.findByTestId(SELECTORS.FILES).should("contain.text", '"path":"mocks"');
  });

  it("should display current delay", () => {
    cy.findByTestId(SELECTORS.MOCK).should("contain.text", '"delay":0');
  });
});
