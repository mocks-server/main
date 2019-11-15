/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

"use strict";

const Boom = require("boom");

const Core = require("./core/Core");
const AdminApi = require("./api/Api");
const InquirerCli = require("./cli/Cli");

const handleError = error => {
  if (Boom.isBoom(error)) {
    console.error(error.message);
  } else {
    console.error(error);
  }
  process.exitCode = 1;
};

const start = () => {
  try {
    const mocksServer = new Core();

    // plugins add their own options to core;
    const adminApi = new AdminApi(mocksServer);
    const inquirerCli = new InquirerCli(mocksServer);

    return mocksServer
      .init()
      .then(options => {
        // plugins are initialized with user options.
        // These is needed to allow them register custom Routes based on user options, etc., before server starts.
        // TODO, run promises in series
        adminApi.init(options);
        inquirerCli.init(options);
        return Promise.resolve();
      })
      .then(() => {
        // mocks server is started
        return mocksServer.start();
      })
      .then(() => {
        // plugins are started (do not wait for promises to be resolved);
        inquirerCli.start();
        return Promise.resolve();
      })
      .catch(handleError);
  } catch (error) {
    return handleError(error);
  }
};

module.exports = {
  start
};
