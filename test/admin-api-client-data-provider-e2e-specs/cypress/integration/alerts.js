describe("alerts", () => {
  const SELECTORS = {
    ALERTS_COLLECTION_ITEM: ".alerts-collection-item",
  };

  before(() => {
    cy.visit("/");
  });

  it("should display alerts collection", () => {
    cy.get(SELECTORS.ALERTS_COLLECTION_ITEM).should("have.length", 1);
  });
});
