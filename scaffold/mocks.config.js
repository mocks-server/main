// For a detailed explanation regarding each configuration property, visit:
// https://mocks-server.org/docs/configuration-options
// https://mocks-server.org/docs/configuration-file

module.exports = {
  // options
  options: {
    // mock to use on start
    mock: "base",

    // mocks and routes path
    // path: "mocks",

    // files watch enabled
    // watch: true,

    // server delay
    // delay: 0,

    // log level. One of "error", "warn", "info", "verbose", "debug", "silly"
    // log: "info",

    // Interactive CLI enabled
    // cli: true,

    // Administration REST API path
    // adminApiPath: "/admin",

    // Server port
    // port: 3100,

    // Server host
    // host: "0.0.0.0",

    // Cors middleware
    // cors: true,

    // Cors pre-flight
    // corsPreFlight: true,

    // Legacy path containing mocks in v1 format
    // pathLegacy: "mocks-legacy",

    // Legacy option for setting v1 behavior
    // behavior: "base",

    // files watch enabled in legacy path
    // watchLegacy: true,
  },

  // low level config

  // babelRegister: false,
  // babelRegisterOptions: {} // For a detailed explanation regarding each Babel register option, visit: https://babeljs.io/docs/en/babel-register
  // addPlugins: [],
  // addRoutesHandlers: [],
};
