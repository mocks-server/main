// For a detailed explanation regarding each configuration property, visit:
// https://mocks-server.org/docs/configuration/how-to-change-settings
// https://mocks-server.org/docs/configuration/options

module.exports = {
  // It contains a string
  log: "info",
  // It contains undefined
  //secondValue: undefined,
  namespace1: {
    // It contains a string
    selected: "base",
    // It contains a boolean
    //option12: true,
    namespace1B: {
      // It contains an array
      //"option1B-1": [1,2,3,4,5,"6",null,{"foo":"foo"}],
    },
    namespace1C: {
      // It contains a string
      //"option1C-1": "foo",
    },
  },
  namespace2: {
    // It contains an array
    //"option2-1": [{"foo":"foo"}],
    // It contains an string
    //"option2-1": "\"\"",
  },
  config: {
    // This one is no omitted
    //allowUnknownArguments: true,
  },
};
