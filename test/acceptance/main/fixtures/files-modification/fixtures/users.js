/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const INITIAL_USERS = [
  {
    id: 1,
    name: "John Doe modified",
  },
  {
    id: 2,
    name: "Jane Doe modified",
  },
];

const getUsers = {
  url: "/api/users",
  method: "GET",
  response: {
    status: 200,
    body: INITIAL_USERS,
  },
};

const getUser = {
  url: "/api/users/:id",
  method: "GET",
  response: {
    status: 200,
    body: {
      id: 1,
      name: "John Doe modified",
    },
  },
};

const getUser2 = {
  url: "/api/users/:id",
  method: "GET",
  response: {
    status: 200,
    body: {
      id: 2,
      name: "Jane Doe modified",
    },
  },
};

const getRealUser = {
  url: "/api/users/:id",
  method: "GET",
  response: (req, res) => {
    const userId = req.params.id;
    const user = INITIAL_USERS.find((userData) => userData.id === Number(userId));
    if (user) {
      res.status(200);
      res.send(user);
    } else {
      res.status(404);
      res.send({
        message: "User not found",
      });
    }
  },
};

module.exports = {
  getUsers,
  getUser,
  getUser2,
  getRealUser,
};
