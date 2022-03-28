module.exports = (config) => {
  delete config.disableCommandLineArguments;
  config.plugins.push("foo2");
  delete config.options.foo;
  config.options.foo3 = "foo3";
  return config;
};
