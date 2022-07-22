function operationSelectors(operationId) {
  const container = `#${operationId}`;
  const tryButton = `${container} .try-out`;
  const responses = `${container} .responses-table .response`;
  const execute = `${container} button.execute`;
  const liveResponses = `${container} .live-responses-table`;
  const liveResponseBody = `${liveResponses} tr.response code`;
  const liveResponseStatus = `${liveResponses} tr.response td.response-col_status`;

  return {
    container,
    tryButton,
    execute,
    responses,
    liveResponses,
    liveResponseStatus,
    liveResponseBody,
  };
}

describe("About section", () => {
  const SELECTORS = {
    TITLE: "h2.title",
    GET_CONFIG: "operations-config-get_config",
    GET_ALERTS: "operations-alerts-get_alerts",
    GET_ROUTES: "operations-mock-get_mock_routes",
    GET_VARIANTS: "operations-mock-get_mock_variants",
    GET_COLLECTIONS: "operations-mock-get_mock_collections",
    GET_CUSTOM_ROUTE_VARIANTS: "operations-mock-get_mock_custom_route_variants",
  };

  function runOperationAndExpect({ operation, status: statusCode, body }) {
    const selectors = operationSelectors(operation);
    cy.get(selectors.container).should("be.visible");
    cy.get(selectors.container).click();
    cy.get(selectors.tryButton).click();
    cy.get(selectors.execute).click();
    cy.get(selectors.liveResponses).should("be.visible");
    cy.get(selectors.liveResponseStatus).should("have.text", statusCode);
    cy.get(selectors.liveResponseBody).should("contain.text", body);
  }

  before(() => {
    cy.visit("/");
  });

  it("should display current core version", () => {
    cy.get(SELECTORS.TITLE).should("contain.text", "Mocks Server admin API");
  });

  describe("get config operation", () => {
    const selectors = operationSelectors(SELECTORS.GET_CONFIG);

    it("should be visible", () => {
      cy.get(selectors.container).should("be.visible");
    });

    it("should display operation responses when clicked", () => {
      cy.get(selectors.container).click();
      cy.get(selectors.responses).should("be.visible");
    });

    it("should display operation result when try button and execute are clicked", () => {
      cy.get(selectors.tryButton).click();
      cy.get(selectors.execute).click();
      cy.get(selectors.liveResponses).should("be.visible");
      cy.get(selectors.liveResponseStatus).should("have.text", "200");
      cy.get(selectors.liveResponseBody).should("contain.text", '"port": 3110');
    });
  });

  describe("get alerts operation", () => {
    it("should display operation result when executed", () => {
      runOperationAndExpect({
        operation: SELECTORS.GET_ALERTS,
        status: 200,
        body: "Option 'mock.collections.selected' was not defined",
      });
    });
  });

  describe("get routes operation", () => {
    it("should display operation result when executed", () => {
      runOperationAndExpect({
        operation: SELECTORS.GET_ROUTES,
        status: 200,
        body: '"id": "get-user"',
      });
    });
  });

  describe("get variants operation", () => {
    it("should display operation result when executed", () => {
      runOperationAndExpect({
        operation: SELECTORS.GET_VARIANTS,
        status: 200,
        body: '"route": "get-user"',
      });
    });
  });

  describe("get collections operation", () => {
    it("should display operation result when executed", () => {
      runOperationAndExpect({
        operation: SELECTORS.GET_COLLECTIONS,
        status: 200,
        body: '"routes": [',
      });
    });
  });

  describe("get custom route variants operation", () => {
    it("should display operation result when executed", () => {
      runOperationAndExpect({
        operation: SELECTORS.GET_CUSTOM_ROUTE_VARIANTS,
        status: 200,
        body: "[]",
      });
    });
  });
});
