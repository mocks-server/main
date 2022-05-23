describe("mocks and routeVariants", () => {
  const SELECTORS = {
    MOCKS_COLLECTION_ITEM: ".mocks-collection-item",
    ROUTES_COLLECTION_ITEM: ".routes-collection-item",
    CURRENT_MOCK: "current-mock-id",
    CURRENT_ROUTE_VARIANT: "current-route-variant-id",
    SET_MOCK_BASE: "set-mock-base",
    SET_MOCK_USER_2: "set-mock-user2",
  };

  before(() => {
    cy.visit("/");
  });

  it("should display mocks collection", () => {
    cy.get(SELECTORS.MOCKS_COLLECTION_ITEM).should("have.length", 2);
  });

  it("should display routes collection", () => {
    cy.get(SELECTORS.ROUTES_COLLECTION_ITEM).should("have.length", 1);
  });

  describe("when mock is base", () => {
    before(() => {
      cy.findByTestId(SELECTORS.SET_MOCK_BASE).click();
    });

    it("should display current mock", () => {
      cy.findByTestId(SELECTORS.CURRENT_MOCK).should("have.text", "base");
    });

    it("should display current route variant", () => {
      cy.findByTestId(SELECTORS.CURRENT_ROUTE_VARIANT).should("have.text", "get-user:1");
    });
  });

  describe("when mock is user2", () => {
    before(() => {
      cy.findByTestId(SELECTORS.SET_MOCK_USER_2).click();
    });

    it("should display current mock", () => {
      cy.findByTestId(SELECTORS.CURRENT_MOCK).should("have.text", "user2");
    });

    it("should display current route variant", () => {
      cy.findByTestId(SELECTORS.CURRENT_ROUTE_VARIANT).should("have.text", "get-user:2");
    });
  });
});
