describe("About section", () => {
  const SELECTORS = {
    VERSION: "about-version"
  };

  before(() => {
    cy.visit("/");
  });

  it("should display current version", () => {
    cy.findByTestId(SELECTORS.VERSION).should("have.text", "1.2.0");
  });
});
