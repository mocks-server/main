/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

"use strict";

const { Core } = require("@mocks-server/core");
const AdminApi = require("../../../index");

const handleError = error => {
  console.error(`Error: ${error.message}`);
  process.exitCode = 1;
};

const start = () => {
  try {
    const mocksServer = new Core({
      plugins: [AdminApi]
    });
    return mocksServer
      .init()
      .then(() => {
        console.log(mocksServer.settings.all);
        return mocksServer.start();
      })
      .catch(handleError);
  } catch (error) {
    return handleError(error);
  }
};

start();
