// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: ["src/**/*.js", "src/**/*.ts", "!src/scaffold/mocks/**"],

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // An object that configures minimum threshold enforcement for coverage results
  coverageThreshold: {
    global: {
      branches: 50, // TODO, increase again to 100
      functions: 50, // TODO, increase again to 100
      lines: 50, // TODO, increase again to 100
      statements: 50, // TODO, increase again to 100
    },
  },

  // The glob patterns Jest uses to detect test files
  testMatch: ["<rootDir>/test/**/*.spec.js"],
  testMatch: ["<rootDir>/test/functional/**/*.spec.js"],

  // The test environment that will be used for testing
  testEnvironment: "node",
  setupFilesAfterEnv: ["./jest.setup.js"],
};
