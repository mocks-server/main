"use strict";

const Boom = require("boom");

const Cli = require("./Cli");
const Server = require("./Server");
const options = require("./common/options");
const tracer = require("./common/tracer");

const start = () => {
  const opts = options.get();
  if (!opts.cli) {
    return new Server(opts.features, opts).start();
  }
  return new Cli(opts).start().catch(error => {
    if (Boom.isBoom(error)) {
      tracer.error(error.message);
    } else {
      console.log(error);
    }
    return Promise.reject(error);
  });
};

module.exports = {
  start
};
