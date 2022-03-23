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
    it("should register mocksConfig command", () => {
      expect(cypressMock.stubs.Commands.add.calledWith("mocksConfig")).toBe(true);
    });

    it("should register mocksSetMock command", () => {
      expect(cypressMock.stubs.Commands.add.calledWith("mocksSetMock")).toBe(true);
    });

    it("should register mocksSetDelay command", () => {
      expect(cypressMock.stubs.Commands.add.calledWith("mocksSetDelay")).toBe(true);
    });

    it("should register mocksSetSettings command", () => {
      expect(cypressMock.stubs.Commands.add.calledWith("mocksSetSettings")).toBe(true);
    });

    it("should register mocksUseRouteVariant command", () => {
      expect(cypressMock.stubs.Commands.add.calledWith("mocksUseRouteVariant")).toBe(true);
    });

    it("should register mocksRestoreRoutesVariants command", () => {
      expect(cypressMock.stubs.Commands.add.calledWith("mocksRestoreRoutesVariants")).toBe(true);
    });

    it("should register mocksSetBehavior command", () => {
      expect(cypressMock.stubs.Commands.add.calledWith("mocksSetBehavior")).toBe(true);
    });
  });
});
