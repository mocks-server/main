const {
  babelRegisterDefaultOptions,
  babelRegisterOnlyFilter,
  getFilesGlobule,
} = require("../../../src/files/Helpers");

describe("Files helpers", () => {
  describe("babelRegisterDefaultOptions", () => {
    describe("only property", () => {
      it("should return a function returning true if file belongs to provided folder", () => {
        const options = babelRegisterDefaultOptions("foo/folder", {});
        expect(options.only[0]("foo/folder/file")).toEqual(true);
        expect(options.only[0]("foo/folder/subfolder/file")).toEqual(true);
        expect(options.only[0]("folder/foo/subfolder/file")).toEqual(false);
      });
    });

    describe("cache property", () => {
      it("should be false", () => {
        const options = babelRegisterDefaultOptions("foo/folder", {});
        expect(options.cache).toEqual(false);
      });
    });

    describe("extensions property", () => {
      it("should return Babel default extensions", () => {
        const options = babelRegisterDefaultOptions("foo/folder", {});
        expect(options.extensions).toEqual([
          ".es6",
          ".es",
          ".esm",
          ".cjs",
          ".jsx",
          ".js",
          ".mjs",
          ".ts",
        ]);
      });
    });

    describe("when custom options are provided", () => {
      it("should overwrite values", () => {
        const options = babelRegisterDefaultOptions("foo/folder", {
          only: [],
          cache: true,
          extensions: ["foo"],
        });
        expect(options.only).toEqual([]);
        expect(options.cache).toEqual(true);
        expect(options.extensions).toEqual(["foo"]);
      });
    });
  });

  describe("babelRegisterOnlyFilter", () => {
    it("should return true if file belongs to provided folder", () => {
      expect(babelRegisterOnlyFilter("foo/folder")("foo/folder/file")).toEqual(true);
    });

    it("should return false if file does not belong to provided folder", () => {
      expect(babelRegisterOnlyFilter("foo/folder")("var/folder/file")).toEqual(false);
    });

    it("should return false if file is undefined", () => {
      expect(babelRegisterOnlyFilter("foo/folder")()).toEqual(false);
    });
  });

  describe("getFilesGlobule", () => {
    it("should return default plugin globules when babelRegister is disabled", () => {
      expect(getFilesGlobule("**/*", false, {})).toEqual([
        "**/*.json",
        "**/*.js",
        "**/*.cjs",
        "**/*.yaml",
        "**/*.yml",
      ]);
    });

    it("should return babel/register globules and default plugin globules when babelRegister is enabled", () => {
      expect(getFilesGlobule("**/*", true, {})).toEqual([
        "**/*.json",
        "**/*.js",
        "**/*.cjs",
        "**/*.yaml",
        "**/*.yml",
        "**/*.es6",
        "**/*.es",
        "**/*.esm",
        "**/*.jsx",
        "**/*.mjs",
        "**/*.ts",
      ]);
    });

    it("should return babel/register custom globules and default plugin globules when babelRegisterOptions has custom extensions", () => {
      expect(
        getFilesGlobule("**/*", true, {
          extensions: [".foo", ".foo2"],
        })
      ).toEqual([
        "**/*.json",
        "**/*.js",
        "**/*.cjs",
        "**/*.yaml",
        "**/*.yml",
        "**/*.foo",
        "**/*.foo2",
      ]);
    });
  });
});
