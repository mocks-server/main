const sinon = require("sinon");
const path = require("path");

const fs = require("fs");

const { deprecatedMessage, readFileSync } = require("../../../src/common/Helpers");

describe("common helpers", () => {
  let sandbox, readFileSyncStub;

  beforeEach(() => {
    sandbox = sinon.createSandbox();
    readFileSyncStub = sandbox.stub(fs, "readFileSync");
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe("deprecatedMessage", () => {
    it("should return message based on method name and include a link to web docs", () => {
      expect(deprecatedMessage("method", "foo", "fooNew", "foo-url")).toEqual(
        "Usage of 'foo' method is deprecated. Use 'fooNew' instead: https://www.mocks-server.org/docs/foo-url"
      );
    });
  });

  describe("readFileSync", () => {
    it("should return file content", () => {
      const fileContent = "file content";
      readFileSyncStub.returns(fileContent);

      expect(readFileSync("file-path")).toEqual(fileContent);
      expect(readFileSyncStub.getCall(0).args[0]).toEqual(
        path.resolve(process.cwd(), "file-path")
      );
      expect(readFileSyncStub.getCall(0).args[1]).toEqual("utf-8");
    });
  });
});
