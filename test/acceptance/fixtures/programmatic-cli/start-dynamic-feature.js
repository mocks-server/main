const path = require("path");
const { Cli } = require("../../../../index");

const cli = new Cli({
  path: path.resolve(__dirname, "..", "web-tutorial"),
  feature: "dynamic",
  port: 3100,
  log: "debug",
  watch: false,
});

cli.start().catch((err) => {
  console.log("Error starting CLI", err);
});
