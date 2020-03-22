/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

// /mocks/behaviors.js

const { Behavior } = require("../../../../index");

const { getUsers, getUser, getUser2, getRealUser } = require("./fixtures/users");
const { getNewUsers, getNewUser } = require("./new-fixtures/users");

const standard = new Behavior([getUsers, getUser]);

// Extends the standard behavior adding "getUser2" fixture.
const user2 = standard.extend([getUser2]);

// Extends the standard behavior adding "getRealUser" dynamic fixture.
const dynamic = standard.extend([getRealUser]);

// New one created while server is running
const newOne = standard.extend([getNewUsers, getNewUser]);

module.exports = {
  standard,
  user2,
  dynamic,
  newOne,
};
