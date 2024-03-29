describe("About section", () => {
  const SELECTORS = {
    CORE_VERSION: "about-version-core",
    ADMINAPI_VERSION: "about-version-adminApi",
  };

  before(() => {
    cy.visit("/");
  });

  it("should display current core version", () => {
    cy.findByTestId(SELECTORS.CORE_VERSION)
      .invoke("text")
      .should("match", /^(?:\d+\.)(?:\d+\.)(?:\*|\d+)$/);
  });

  it("should display current core version", () => {
    cy.findByTestId(SELECTORS.ADMINAPI_VERSION)
      .invoke("text")
      .should("match", /^(?:\d+\.)(?:\d+\.)(?:\*|\d+)$/);
  });
});
