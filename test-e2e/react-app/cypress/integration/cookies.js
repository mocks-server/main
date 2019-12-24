describe("Settings", () => {
  const SELECTORS = {
    ACCEPT_BUTTON: "#accept-cookies",
    REJECT_BUTTON: "#reject-cookies"
  };

  describe("when cookies are not accepted", () => {
    before(() => {
      cy.visit("/");
    });

    it("should display accept cookies button", () => {
      cy.get(SELECTORS.ACCEPT_BUTTON).should("be.visible");
    });
  });

  describe("when user click accept cookies button", () => {
    describe("without using localStorage commands", () => {
      it("should display reject cookies button", () => {
        cy.get(SELECTORS.ACCEPT_BUTTON).click();
        cy.get(SELECTORS.REJECT_BUTTON).should("be.visible");
      });

      it("should accept cookies button after reloading page", () => {
        cy.reload();
        cy.get(SELECTORS.ACCEPT_BUTTON).should("be.visible");
      });
    });

    describe("saving and restoring local storage", () => {
      it("should display reject cookies button", () => {
        cy.get(SELECTORS.ACCEPT_BUTTON).click();
        cy.get(SELECTORS.REJECT_BUTTON).should("be.visible");
        cy.saveLocalStorage();
      });

      it("should display reject cookies button after reloading page", () => {
        cy.restoreLocalStorage();
        cy.reload();
        cy.get(SELECTORS.REJECT_BUTTON).should("be.visible");
      });
    });
  });

  describe("restoring localStorage, when user click rejects cookies button", () => {
    it("should display accept cookies button", () => {
      cy.restoreLocalStorage();
      cy.reload();
      cy.get(SELECTORS.REJECT_BUTTON).click();
      cy.get(SELECTORS.ACCEPT_BUTTON).should("be.visible");
      cy.saveLocalStorage();
    });

    it("should display accept-cookies cookies button after reloading page", () => {
      cy.restoreLocalStorage();
      cy.reload();
      cy.get(SELECTORS.ACCEPT_BUTTON).should("be.visible");
    });

    it("should display reject-cookies cookies button after clicking accept-cookies button again", () => {
      cy.restoreLocalStorage();
      cy.reload();
      cy.get(SELECTORS.ACCEPT_BUTTON).click();
      cy.get(SELECTORS.REJECT_BUTTON).should("be.visible");
      cy.saveLocalStorage();
    });
  });

  describe("after clearing localStorage snapshot", () => {
    before(() => {
      cy.clearLocalStorageSnapshot();
    });

    it("should display accept cookies button", () => {
      cy.restoreLocalStorage();
      cy.reload();
      cy.get(SELECTORS.ACCEPT_BUTTON).should("be.visible");
      cy.saveLocalStorage();
    });
  });

  describe("when using setLocalStorage command to manually set user-preferences value", () => {
    it("should display reject cookies button", () => {
      cy.setLocalStorage("user-preferences", '{"cookiesAccepted":true}');
      cy.reload();
      cy.get(SELECTORS.REJECT_BUTTON).should("be.visible");
      cy.saveLocalStorage();
    });
  });

  describe("when using getLocalStorage command to manually get localStorage items", () => {
    it("should return current localStorage values", () => {
      cy.restoreLocalStorage();
      cy.reload();
      cy.get(SELECTORS.REJECT_BUTTON).should("be.visible");
      cy.getLocalStorage("user-preferences").should("be", '{"cookiesAccepted":true}');
      cy.setLocalStorage("user-preferences", '{"cookiesAccepted":false}');
      cy.getLocalStorage("user-preferences").should("be", '{"cookiesAccepted":false}');
      cy.saveLocalStorage();
    });
  });

  describe("when using removeLocalStorage command to manually remove localStorage item", () => {
    it("should remove item from localStorage", () => {
      cy.restoreLocalStorage();
      cy.reload();
      cy.getLocalStorage("user-preferences").should("be", '{"cookiesAccepted":false}');
      cy.get(SELECTORS.ACCEPT_BUTTON).should("be.visible");
      cy.removeLocalStorage("user-preferences");
      cy.getLocalStorage("user-preferences").should("be", undefined);
    });

    it("should not remove item from localStorage snapshot", () => {
      cy.restoreLocalStorage();
      cy.reload();
      cy.getLocalStorage("user-preferences").should("be", '{"cookiesAccepted":false}');
      cy.get(SELECTORS.ACCEPT_BUTTON).should("be.visible");
      cy.removeLocalStorage("user-preferences");
      cy.saveLocalStorage();
    });

    it("should remove item from localStorage snapshot after saving it", () => {
      cy.setLocalStorage("user-preferences", '{"cookiesAccepted":true}');
      cy.reload();
      cy.get(SELECTORS.REJECT_BUTTON).should("be.visible");
      cy.restoreLocalStorage();
      cy.getLocalStorage("user-preferences").should("not.exist");
    });
  });
});
