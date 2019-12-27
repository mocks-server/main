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
    it("should register mocksServerSetBehavior command", () => {
      expect(cypressMock.stubs.Commands.add.calledWith("mocksServerSetBehavior")).toBe(true);
    });

    it("should register mocksServerSetDelay command", () => {
      expect(cypressMock.stubs.Commands.add.calledWith("mocksServerSetDelay")).toBe(true);
    });

    it("should register mocksServerSetSettings command", () => {
      expect(cypressMock.stubs.Commands.add.calledWith("mocksServerSetSettings")).toBe(true);
    });
  });
});
