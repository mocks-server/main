describe("Settings section", () => {
  const SELECTORS = {
    PATH: "settings-path",
    DELAY: "settings-delay",
  };

  before(() => {
    cy.visit("/");
  });

  it("should display current path", () => {
    cy.findByTestId(SELECTORS.PATH).should("have.text", "mocks");
  });

  it("should display current delay", () => {
    cy.findByTestId(SELECTORS.DELAY).should("have.text", "0");
  });
});
