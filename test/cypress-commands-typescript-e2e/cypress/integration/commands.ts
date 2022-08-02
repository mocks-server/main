import { AdminApiClient } from "@mocks-server/cypress-commands";

const SECOND_SERVER_URL = `http://localhost:3300/api/response`;

describe("Mocks server responses", () => {
  let secondServer;

  const SELECTORS = {
    RESPONSE: "#response",
    RESPONSE_TIME: "#response-time",
    LEGACY_RESPONSE: "#legacy-response",
    LEGACY_RESPONSE_TIME: "#legacy-response-time",
  };

  describe("when started", () => {
    before(() => {
      secondServer = new AdminApiClient({
        port: 3310,
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

    it("should send standard-response in second server", () => {
      cy.request("GET", SECOND_SERVER_URL).then((response) => {
        expect(response.body).to.have.property("display", "standard-response");
      });
    });
  });

  describe("when collection is changed to custom", () => {
    before(() => {
      cy.mocksSetCollection("custom");
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

    it("should send standard-response in second server", () => {
      cy.request("GET", SECOND_SERVER_URL).then((response) => {
        expect(response.body).to.have.property("display", "standard-response");
      });
    });
  });

  describe("when second server collection is changed to custom", () => {
    before(() => {
      cy.mocksSetCollection("custom", secondServer);
      cy.visit("/");
    });

    it("should display custom response", () => {
      cy.get(SELECTORS.RESPONSE).should("have.text", "custom-response");
    });

    it("should send custom-response in second server", () => {
      cy.request("GET", SECOND_SERVER_URL).then((response) => {
        expect(response.body).to.have.property("display", "custom-response");
      });
    });
  });

  describe("when second server collection is changed to standard", () => {
    before(() => {
      cy.mocksSetCollection("standard", secondServer);
      cy.visit("/");
    });

    it("should display custom response", () => {
      cy.get(SELECTORS.RESPONSE).should("have.text", "custom-response");
    });

    it("should send custom-response in second server", () => {
      cy.request("GET", SECOND_SERVER_URL).then((response) => {
        expect(response.body).to.have.property("display", "standard-response");
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

  describe("when config is changed", () => {
    before(() => {
      cy.mocksSetConfig({
        mock: {
          collections: {
            selected: "standard",
          },
          routes: {
            delay: 0,
          },
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

  describe("when custom route variant is used in second server", () => {
    before(() => {
      cy.mocksUseRouteVariant("response:custom", secondServer);
      cy.visit("/");
    });

    it("should display standard response", () => {
      cy.get(SELECTORS.RESPONSE).should("have.text", "standard-response");
    });

    it("should send custom-response in second server", () => {
      cy.request("GET", SECOND_SERVER_URL).then((response) => {
        expect(response.body).to.have.property("display", "custom-response");
      });
    });
  });

  describe("when custom route variant is used", () => {
    before(() => {
      cy.mocksUseRouteVariant("response:custom");
      cy.mocksRestoreRouteVariants(secondServer);
      cy.visit("/");
    });

    it("should display custom response", () => {
      cy.get(SELECTORS.RESPONSE).should("have.text", "custom-response");
    });

    it("should send standard-response in second server", () => {
      cy.request("GET", SECOND_SERVER_URL).then((response) => {
        expect(response.body).to.have.property("display", "standard-response");
      });
    });
  });

  describe("when route variants are restored", () => {
    before(() => {
      cy.mocksRestoreRouteVariants();
      cy.visit("/");
    });

    it("should display standard response", () => {
      cy.get(SELECTORS.RESPONSE).should("have.text", "standard-response");
    });
  });
});
