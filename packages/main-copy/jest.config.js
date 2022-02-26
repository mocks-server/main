// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: ["index.js", "lib/**"],

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // An object that configures minimum threshold enforcement for coverage results

  coverageReporters: [["lcov", { projectRoot: "../../" }], "text-summary"],

  // The glob patterns Jest uses to detect test files
  testMatch: ["**/test/**/?(*.)+(spec|test).js?(x)"],
  //testMatch: ["**/test/unit/core/Plugins.spec.js"],

  // The test environment that will be used for testing
  testEnvironment: "node",
};