/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

"use strict";

const Boom = require("boom");

const Cli = require("./Cli");
const Server = require("./Server");
const options = require("./common/options");
const tracer = require("./common/tracer");

const handleError = error => {
  if (Boom.isBoom(error)) {
    tracer.error(error.message);
  } else {
    console.log(error);
  }
  process.exitCode = 1;
};

const start = () => {
  const opts = options.get();
  try {
    if (!opts.cli) {
      return new Server(opts.features, opts).start();
    }
    return new Cli(opts).start().catch(handleError);
  } catch (error) {
    return handleError(error);
  }
};

module.exports = {
  start
};
