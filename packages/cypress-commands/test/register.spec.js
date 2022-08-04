import CypressMock from "./Cypress.mock";

import { register } from "../src/register";

describe("register", () => {
  let cypressMock;

  beforeEach(() => {
    cypressMock = new CypressMock();
    register(cypressMock.stubs.Cypress, cypressMock.stubs.cy);
  });

  afterEach(() => {
    cypressMock.restore();
  });

  describe("commands", () => {
    it("should register mocksConfigAdminApiClient command", () => {
      expect(cypressMock.stubs.Cypress.Commands.add.calledWith("mocksConfigAdminApiClient")).toBe(
        true
      );
    });

    it("should register mocksSetCollection command", () => {
      expect(cypressMock.stubs.Cypress.Commands.add.calledWith("mocksSetCollection")).toBe(true);
    });

    it("should register mocksSetDelay command", () => {
      expect(cypressMock.stubs.Cypress.Commands.add.calledWith("mocksSetDelay")).toBe(true);
    });

    it("should register mocksSetConfig command", () => {
      expect(cypressMock.stubs.Cypress.Commands.add.calledWith("mocksSetConfig")).toBe(true);
    });

    it("should register mocksUseRouteVariant command", () => {
      expect(cypressMock.stubs.Cypress.Commands.add.calledWith("mocksUseRouteVariant")).toBe(true);
    });

    it("should register mocksRestoreRouteVariants command", () => {
      expect(cypressMock.stubs.Cypress.Commands.add.calledWith("mocksRestoreRouteVariants")).toBe(
        true
      );
    });
  });
});
