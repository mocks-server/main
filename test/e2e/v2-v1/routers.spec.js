/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { startCore, fixturesFolder } = require("./support/helpers");
const { fetch, waitForServer, findTrace } = require("../v2/support/helpers");

describe("v2 and v1 routers coexistence", () => {
  let core;

  beforeAll(async () => {
    core = await startCore({
      path: fixturesFolder("v2"),
      pathLegacy: fixturesFolder("v1"),
    });
    await waitForServer();
  });

  afterAll(async () => {
    await core.stop();
  });

  describe("when same route is defined in v2 and v1", () => {
    it("should serve v2 users in /api/users path", async () => {
      const users = await fetch("/api/users?req=1");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });

    it("middleware should have traced request", async () => {
      expect(
        findTrace("Middleware in request 1 => GET => /api/users", core.tracer.store)
      ).toBeDefined();
    });

    it("should serve v2 user 1 in /api/users/1 path", async () => {
      const users = await fetch("/api/users/1?req=2");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });

    it("should serve v2 user 1 in /api/users/2 path", async () => {
      const users = await fetch("/api/users/2?req=3");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });
  });

  describe("when route only exists in v1", () => {
    it("should serve v1 users 1 in /api/v1/users path", async () => {
      const users = await fetch("/api/v1/users");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual([
        { id: 1, name: "John Doe v1" },
        { id: 2, name: "Jane Doe v1" },
      ]);
    });

    it("should serve v1 user 1 in /api/v1/users/1 path", async () => {
      const users = await fetch("/api/v1/users/1");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 1, name: "John Doe v1" });
    });
  });

  describe("when v2 mock is changed and route now only exists in v1", () => {
    it("should serve v1 users 1 in /api/users path", async () => {
      core.settings.set("mock", "no-users");
      const users = await fetch("/api/users?req=2");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual([
        { id: 1, name: "John Doe v1" },
        { id: 2, name: "Jane Doe v1" },
      ]);
    });

    it("middleware should have traced request", async () => {
      expect(
        findTrace("Middleware in request 2 => GET => /api/users", core.tracer.store)
      ).toBeDefined();
    });

    it("should serve v2 user 1 in /api/users/1 path", async () => {
      const users = await fetch("/api/users/1");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });
  });
});
