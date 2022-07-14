// For a detailed explanation regarding each configuration property, visit:
// https://mocks-server.org/docs/configuration-options
// https://mocks-server.org/docs/configuration-file

module.exports = {
  // Log level. Can be one of silly, debug, verbose, info, warn or error
  //log: "info",
  // Array of RouteHandlers to be added
  //routesHandlers: [],
  config: {
    // Allow unknown arguments
    //allowUnknownArguments: false,
  },
  plugins: {
    // Plugins to be registered
    //register: [null],
    inquirerCli: {
      // Start interactive CLI plugin or not
      //enabled: true,
    },
  },
  mock: {
    // Selected mock
    collections: {
      //selected: "base",
    },
    // Global delay to apply to routes
    //delay: 0,
  },
  server: {
    // Port number for the server to be listening at
    //port: 3100,
    // Host for the server
    //host: "0.0.0.0",
    // Load built-in CORS middleware or not
    //cors: true,
    // Load built-in pre-flight CORS middleware or not
    //corsPreFlight: true,
  },
  files: {
    // Define folder from where to load mocks
    //path: "temp",
    // Enable/disable files watcher
    //watch: true,
    babelRegister: {
      // Load @babel/register
      //enabled: false,
      // Options for @babel/register
      //options: {},
    },
  },
};
