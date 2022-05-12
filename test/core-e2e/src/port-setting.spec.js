/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { startCore, fetch, waitForServer } = require("./support/helpers");

describe("port setting", () => {
  let core;

  beforeAll(async () => {
    core = await startCore();
    await waitForServer();
  });

  afterAll(async () => {
    await core.stop();
  });

  describe("When started", () => {
    it("should be listening on port 3100", async () => {
      const users = await fetch("/api/users");
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });
  });

  describe("When port setting is changed", () => {
    it("should be listening on new port", async () => {
      core.config.namespace("server").option("port").value = 3005;
      await waitForServer(3005);
      const users = await fetch("/api/users", {
        port: 3005,
      });
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });
  });
});
