describe("About section", () => {
  const SELECTORS = {
    VERSION: "about-version",
  };

  before(() => {
    cy.visit("/");
  });

  it("should display current version", () => {
    cy.findByTestId(SELECTORS.VERSION)
      .invoke("text")
      .should("match", /^(?:\d+\.)(?:\d+\.)(?:\*|\d+)$/);
  });
});
