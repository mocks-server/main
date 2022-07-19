/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { USERS } = require("../db/users");

module.exports = [
  {
    id: "tracer",
    url: "/api/**",
    method: "GET",
    variants: [
      {
        id: "enabled",
        type: "middleware",
        options: {
          middleware: (req, _res, next, core) => {
            core.tracer.info(
              `Middleware in request ${req.query.req} => ${req.method} => ${req.url}`
            );
            next();
          }
        },
      },
      {
        id: "disabled",
        type: "middleware",
        options: {
          middleware:(_req, _res, next) => {
            next();
          },
        }
      },
    ],
  },
];
