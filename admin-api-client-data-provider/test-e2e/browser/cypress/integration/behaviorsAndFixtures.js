describe("behaviors and fixtures", () => {
  const SELECTORS = {
    BEHAVIORS_COLLECTION_ITEM: ".behaviors-collection-item",
    FIXTURES_COLLECTION_ITEM: ".fixtures-collection-item",
    CURRENT_BEHAVIOR: "current-behavior-name",
    CURRENT_FIXTURE: "current-fixture-id",
    SET_BEHAVIOR_BASE: "set-behavior-base",
    SET_BEHAVIOR_USER2: "set-behavior-user2",
  };

  before(() => {
    cy.visit("/");
  });

  it("should display behaviors collection", () => {
    cy.get(SELECTORS.BEHAVIORS_COLLECTION_ITEM).should("have.length", 2);
  });

  it("should display fixtures collection", () => {
    cy.get(SELECTORS.FIXTURES_COLLECTION_ITEM).should("have.length", 2);
  });

  describe("when behavior is base", () => {
    before(() => {
      cy.findByTestId(SELECTORS.SET_BEHAVIOR_BASE).click();
    });

    it("should display current behavior", () => {
      cy.findByTestId(SELECTORS.CURRENT_BEHAVIOR).should("have.text", "base");
    });

    it("should display current fixture", () => {
      cy.findByTestId(SELECTORS.CURRENT_FIXTURE).should(
        "have.text",
        "0afdbb7f0ac441e56eae9401501e4a4b"
      );
    });
  });

  describe("when behavior is user2", () => {
    before(() => {
      cy.findByTestId(SELECTORS.SET_BEHAVIOR_USER2).click();
    });

    it("should display current behavior", () => {
      cy.findByTestId(SELECTORS.CURRENT_BEHAVIOR).should("have.text", "user2");
    });

    it("should display current fixture", () => {
      cy.findByTestId(SELECTORS.CURRENT_FIXTURE).should(
        "have.text",
        "d765f4ee07c59692b6a517143f756ecd"
      );
    });
  });
});
