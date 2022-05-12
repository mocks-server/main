describe("Settings section", () => {
  const SELECTORS = {
    CONFIG: "settings-config",
    PLUGINS: "settings-plugins",
    FILES: "settings-files",
    SERVER: "settings-server",
    MOCKS: "settings-mocks",
  };

  before(() => {
    cy.visit("/");
  });

  it("should display current path", () => {
    cy.findByTestId(SELECTORS.FILES).should("contain.text", '"path":"mocks"');
  });

  it("should display current delay", () => {
    cy.findByTestId(SELECTORS.MOCKS).should("contain.text", '"delay":0');
  });
});
