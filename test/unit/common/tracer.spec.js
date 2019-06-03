const sinon = require("sinon");

const tracer = require("../../../lib/common/tracer");

describe("tracer", () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    sandbox.stub(tracer, "debug");
    sandbox.spy(console, "log");
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("set method", () => {
    it("should call to set log level", () => {
      tracer.set("console", "error");
      tracer.debug("foo debug");
      expect(console.log.callCount).toEqual(0);
    });

    it("should deactivate logs if called with level silent", () => {
      tracer.set("console", "silent");
      tracer.error("foo error");
      expect(console.log.callCount).toEqual(0);
    });
  });
});
