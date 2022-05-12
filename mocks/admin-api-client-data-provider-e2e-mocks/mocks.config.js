// For a detailed explanation regarding each configuration property, visit:
// https://mocks-server.org/docs/configuration-options
// https://mocks-server.org/docs/configuration-file

module.exports = {
  // options
  server: {
    port: 3100,
  },
  plugins: {
    inquirerCli: {
      enabled: false,
    },
  },
};
