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
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100
    }
  },

  // The glob patterns Jest uses to detect test files
  testMatch: ["**/test/unit/**/?(*.)+(spec|test).js?(x)"],
  testMatch: [
    "**/test/unit/index.spec.js",
    "**/test/unit/start.spec.js",
    "**/test/unit/ProgrammaticCli.spec.js",
    "**/test/unit/ProgrammaticServer.spec.js",
    "**/test/unit/core/tracer.spec.js",
    "**/test/unit/core/server/middlewares.spec.js",
    "**/test/unit/cli/Inquirer.spec.js",
    "**/test/unit/api/Settings.spec.js",
    "**/test/unit/api/Behaviors.spec.js",
    "**/test/unit/api/Api.spec.js",
    "**/test/unit/cli/Cli.spec.js",
    "**/test/unit/core/mocks/Behavior.spec.js",
    "**/test/unit/core/mocks/Behaviors.spec.js",
    "**/test/unit/core/mocks/FilesHandler.spec.js",
    "**/test/unit/core/mocks/Mocks.spec.js",
    "**/test/unit/core/server/Server.spec.js"
  ],
  //testMatch: ["**/test/unit/core/server/Server.spec.js"],

  // The test environment that will be used for testing
  testEnvironment: "node"
};
