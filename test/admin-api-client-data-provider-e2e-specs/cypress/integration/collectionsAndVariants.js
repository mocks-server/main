describe("collections and routeVariants", () => {
  const SELECTORS = {
    COLLECTIONS_COLLECTION_ITEM: ".collections-collection-item",
    ROUTES_COLLECTION_ITEM: ".routes-collection-item",
    CURRENT_COLLECTION: "current-collection-id",
    CURRENT_ROUTE_VARIANT: "current-variant-id",
    SET_COLLECTION_BASE: "set-collection-base",
    SET_COLLECTION_USER_2: "set-collection-user2",
  };

  before(() => {
    cy.visit("/");
  });

  it("should display collections collection", () => {
    cy.get(SELECTORS.COLLECTIONS_COLLECTION_ITEM).should("have.length", 2);
  });

  it("should display routes collection", () => {
    cy.get(SELECTORS.ROUTES_COLLECTION_ITEM).should("have.length", 1);
  });

  describe("when collection is base", () => {
    before(() => {
      cy.findByTestId(SELECTORS.SET_COLLECTION_BASE).click();
    });

    it("should display current collection", () => {
      cy.findByTestId(SELECTORS.CURRENT_COLLECTION).should("have.text", "base");
    });

    it("should display current route variant", () => {
      cy.findByTestId(SELECTORS.CURRENT_ROUTE_VARIANT).should("have.text", "get-user:1");
    });
  });

  describe("when collection is user2", () => {
    before(() => {
      cy.findByTestId(SELECTORS.SET_COLLECTION_USER_2).click();
    });

    it("should display current collection", () => {
      cy.findByTestId(SELECTORS.CURRENT_COLLECTION).should("have.text", "user2");
    });

    it("should display current route variant", () => {
      cy.findByTestId(SELECTORS.CURRENT_ROUTE_VARIANT).should("have.text", "get-user:2");
    });
  });
});
