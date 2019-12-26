const CypressMock = require("./Cypress.mock");

const register = require("../src/register");

describe("register", () => {
  let cypressMock;

  beforeEach(() => {
    cypressMock = new CypressMock();
    register(cypressMock.stubs);
  });

  afterEach(() => {
    cypressMock.restore();
  });

  describe("commands", () => {
    it("should register mocksServerChangeBehavior command", () => {
      expect(cypressMock.stubs.Commands.add.calledWith("mocksServerChangeBehavior")).toBe(true);
    });

    it("should register mocksServerChangeDelay command", () => {
      expect(cypressMock.stubs.Commands.add.calledWith("mocksServerChangeDelay")).toBe(true);
    });

    it("should register mocksServerChangeSettings command", () => {
      expect(cypressMock.stubs.Commands.add.calledWith("mocksServerChangeSettings")).toBe(true);
    });
  });
});
