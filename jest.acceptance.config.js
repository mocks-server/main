// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  // Automatically clear mock calls and instances between every test
  clearMocks: true,

  testMatch: ["**/test/acceptance/**/?(*.)+(spec|test).js?(x)"],
  testMatch: [
    "**/test/acceptance/command-line-arguments.spec.js",
    "**/test/acceptance/delay-setting.spec.js",
    "**/test/acceptance/no-behaviors.spec.js"
  ],

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: false,

  // The test environment that will be used for testing
  testEnvironment: "node"
};
