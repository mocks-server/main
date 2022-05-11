describe("Settings section", () => {
  const SELECTORS = {
    CONFIG: "settings-config",
    PLUGINS: "settings-plugins",
    SERVER: "settings-server",
    MOCKS: "settings-mocks",
  };

  before(() => {
    cy.visit("/");
  });

  it("should display current path", () => {
    cy.findByTestId(SELECTORS.PLUGINS).should("contain.text", '"path":"mocks"');
  });

  it("should display current delay", () => {
    cy.findByTestId(SELECTORS.MOCKS).should("contain.text", '"delay":0');
  });
});
