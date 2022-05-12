describe("Mocks server responses", () => {
  const SELECTORS = {
    RESPONSE: "#response",
    RESPONSE_TIME: "#response-time",
    LEGACY_RESPONSE: "#legacy-response",
    LEGACY_RESPONSE_TIME: "#legacy-response-time",
  };

  describe("when started", () => {
    before(() => {
      cy.visit("/");
    });

    it("should display standard response", () => {
      cy.get(SELECTORS.RESPONSE).should("have.text", "standard-response");
    });

    it("should load response fast", () => {
      cy.get(SELECTORS.RESPONSE_TIME).should(($div) => {
        const text = $div.text();

        expect(Number(text)).to.be.lessThan(1000);
      });
    });
  });

  describe("when mock is changed to custom", () => {
    before(() => {
      cy.mocksSetMock("custom");
      cy.visit("/");
    });

    it("should display custom response", () => {
      cy.get(SELECTORS.RESPONSE).should("have.text", "custom-response");
    });

    it("should load response fast", () => {
      cy.get(SELECTORS.RESPONSE_TIME).should(($div) => {
        const text = $div.text();

        expect(Number(text)).to.be.lessThan(1000);
      });
    });
  });

  describe("when delay is changed", () => {
    before(() => {
      cy.mocksSetDelay(1000);
      cy.visit("/");
    });

    it("should display custom response", () => {
      cy.get(SELECTORS.RESPONSE).should("have.text", "custom-response");
    });

    it("should load response with delay", () => {
      cy.get(SELECTORS.RESPONSE_TIME).should(($div) => {
        const text = $div.text();

        expect(Number(text)).to.be.greaterThan(1000);
      });
    });
  });

  describe("when settings are changed", () => {
    before(() => {
      cy.mocksSetSettings({
        mocks: {
          selected: "standard",
          delay: 0,
        },
      });
      cy.visit("/");
    });

    it("should display standard response", () => {
      cy.get(SELECTORS.RESPONSE).should("have.text", "standard-response");
    });

    it("should load response fast", () => {
      cy.get(SELECTORS.RESPONSE_TIME).should(($div) => {
        const text = $div.text();

        expect(Number(text)).to.be.lessThan(1000);
      });
    });
  });

  describe("when custom route variant is used", () => {
    before(() => {
      cy.mocksUseRouteVariant("response:custom");
      cy.visit("/");
    });

    it("should display custom response", () => {
      cy.get(SELECTORS.RESPONSE).should("have.text", "custom-response");
    });
  });

  describe("when route variants are restored", () => {
    before(() => {
      cy.mocksRestoreRoutesVariants();
      cy.visit("/");
    });

    it("should display standard response", () => {
      cy.get(SELECTORS.RESPONSE).should("have.text", "standard-response");
    });
  });
});
