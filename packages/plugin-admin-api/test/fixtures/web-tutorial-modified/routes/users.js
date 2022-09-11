/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { USERS } = require("../db/users");

module.exports = [
  {
    id: "get-users",
    url: "/api/users",
    method: "GET",
    variants: [
      {
        id: "success",
        type: "json",
        options: {
          headers: {
            "x-custom-header": "foo-header",
            "x-another-header": "another-header",
          },
          status: 200,
          body: USERS,
        },
      },
      {
        id: "error",
        type: "json",
        options: {
          status: 403,
          body: {
            message: "Bad data",
          },
        },
      },
    ],
  },
  {
    id: "get-users-new",
    url: "/api/new-users",
    method: "GET",
    variants: [
      {
        id: "success",
        type: "json",
        options: {
          status: 200,
          body: [
            ...USERS,
            {
              id: 3,
              name: "Brand new user",
            },
          ],
        },
      },
    ],
  },
];
