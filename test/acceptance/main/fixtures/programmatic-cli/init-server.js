const path = require("path");
const { Cli } = require("../../../../../index");

const wait = (time = 3000) => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

const cli = new Cli({
  behaviors: path.resolve(__dirname, "..", "web-tutorial"),
  port: 3100,
  log: "debug",
  watch: false
});

cli
  .initServer()
  .catch(err => {
    console.log("Error initializing CLI", err);
  })
  .then(() => {
    console.log("Cli initialized");
    return wait().then(() => {
      return cli.start();
    });
  });
