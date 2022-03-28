/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

// /mocks/behaviors.js

const { Behavior } = require("@mocks-server/core");

const {
  getUsers,
  getUser,
  getUser2,
  getRealUser,
  getUsersV1,
  getUserV1,
} = require("./fixtures/users");

const behavior1 = new Behavior([getUsers, getUser, getUserV1, getUsersV1], {
  id: "standard",
});

// Extends the standard behavior adding "getUser2" fixture.
const behavior2 = behavior1.extend([getUser2], {
  id: "user2",
});

// Extends the standard behavior adding "getRealUser" dynamic fixture.
const behavior3 = behavior1.extend([getRealUser], {
  id: "dynamic",
});

module.exports = [behavior1, behavior2, behavior3];
