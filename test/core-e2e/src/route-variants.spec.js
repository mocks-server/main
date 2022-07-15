/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const {
  startCore,
  doFetch,
  waitForServer,
  findTrace,
  removeConfigFile,
} = require("./support/helpers");

describe("route variants", () => {
  let core;

  beforeAll(async () => {
    core = await startCore("middleware-route", {
      mock: { collections: { selected: "base" } },
    });
    await waitForServer();
  });

  afterAll(async () => {
    removeConfigFile();
    await core.stop();
  });

  describe("base mock", () => {
    it("should serve users under the /api/users path", async () => {
      const users = await doFetch("/api/users?req=1");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });

    it("middleware should have traced request 1", async () => {
      expect(
        findTrace("Middleware in request 1 => GET => /api/users", core.tracer.store)
      ).toBeDefined();
    });

    it("should serve user 1 under the /api/users/1 path", async () => {
      const users = await doFetch("/api/users/1?req=2");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });

    it("middleware should have traced request 2", async () => {
      expect(
        findTrace("Middleware in request 2 => GET => /api/users/1", core.tracer.store)
      ).toBeDefined();
    });

    it("should serve user 1 under the /api/users/2 path", async () => {
      const users = await doFetch("/api/users/2?req=3");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });

    it("middleware should have traced request 3", async () => {
      expect(
        findTrace("Middleware in request 3 => GET => /api/users/2", core.tracer.store)
      ).toBeDefined();
    });
  });

  describe('when using route variant "get-user:2"', () => {
    it("should serve users under the /api/users path", async () => {
      core.mocks.useRouteVariant("get-user:2");
      const users = await doFetch("/api/users?req=4");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });

    it("middleware should have traced request 4", async () => {
      expect(
        findTrace("Middleware in request 4 => GET => /api/users", core.tracer.store)
      ).toBeDefined();
    });

    it("should serve user 2 under the /api/users/1 path", async () => {
      const users = await doFetch("/api/users/1?req=5");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
    });

    it("middleware should have traced request when requested user 1 again", async () => {
      expect(
        findTrace("Middleware in request 5 => GET => /api/users/1", core.tracer.store)
      ).toBeDefined();
    });

    it("should serve user 2 under the /api/users/2 path", async () => {
      const users = await doFetch("/api/users/2?req=6");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
    });

    it("middleware should have traced request when requested user 2 again", async () => {
      expect(
        findTrace("Middleware in request 6 => GET => /api/users/2", core.tracer.store)
      ).toBeDefined();
    });
  });

  describe('when using route variant "tracer:disabled"', () => {
    it("should serve users under the /api/users path", async () => {
      core.mocks.useRouteVariant("tracer:disabled");
      const users = await doFetch("/api/users?req=7");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });

    it("middleware should have not traced request", async () => {
      expect(findTrace("Middleware in request 7", core.tracer.store)).toBeUndefined();
    });

    it("should serve user 2 under the /api/users/1 path", async () => {
      core.mocks.useRouteVariant("get-user:2");
      const users = await doFetch("/api/users/1?req=8");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
    });

    it("middleware should have not traced request 8", async () => {
      expect(findTrace("Middleware in request 8", core.tracer.store)).toBeUndefined();
    });

    it("should serve user 2 under the /api/users/2 path", async () => {
      const users = await doFetch("/api/users/2?req=9");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
    });

    it("middleware should have not traced request 9", async () => {
      expect(findTrace("Middleware in request 9", core.tracer.store)).toBeUndefined();
    });
  });

  describe('when using route variant "tracer:enabled"', () => {
    it("should serve users under the /api/users path", async () => {
      core.mocks.useRouteVariant("tracer:enabled");
      const users = await doFetch("/api/users?req=10");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });

    it("middleware should have traced request", async () => {
      expect(
        findTrace("Middleware in request 10 => GET => /api/users", core.tracer.store)
      ).toBeDefined();
    });

    it("should serve user 2 under the /api/users/1 path", async () => {
      const users = await doFetch("/api/users/1?req=11");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
    });

    it("middleware should have traced request 11", async () => {
      expect(
        findTrace("Middleware in request 11 => GET => /api/users/1", core.tracer.store)
      ).toBeDefined();
    });

    it("should serve user 2 under the /api/users/2 path", async () => {
      const users = await doFetch("/api/users/2?req=12");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
    });

    it("middleware should have traced request 12", async () => {
      expect(
        findTrace("Middleware in request 12 => GET => /api/users/2", core.tracer.store)
      ).toBeDefined();
    });
  });

  describe("when restoring route variants", () => {
    it("should serve users under the /api/users path", async () => {
      core.mocks.restoreRouteVariants();
      const users = await doFetch("/api/users?req=1");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });

    it("should serve user 1 under the /api/users/1 path", async () => {
      const users = await doFetch("/api/users/1?req=2");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });

    it("should serve user 1 under the /api/users/2 path", async () => {
      const users = await doFetch("/api/users/2?req=3");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });
  });

  describe('when using route variant "get-user:real"', () => {
    it("should serve users under the /api/users path", async () => {
      core.mocks.useRouteVariant("get-user:real");
      const users = await doFetch("/api/users");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });

    it("should serve user 1 under the /api/users/1 path", async () => {
      const users = await doFetch("/api/users/1");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });

    it("should serve user 2 under the /api/users/2 path", async () => {
      const users = await doFetch("/api/users/2");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
    });
  });

  describe('when changing mock to "user-2"', () => {
    beforeEach(() => {
      core.config.namespace("mock").namespace("collections").option("selected").value = "user-2";
    });

    it("should serve users collection mock under the /api/users path", async () => {
      const users = await doFetch("/api/users");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });

    it("should serve user 2 under the /api/users/1 path", async () => {
      const users = await doFetch("/api/users/1");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
    });

    it("should serve user 2 under the /api/users/2 path", async () => {
      const users = await doFetch("/api/users/2");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
    });
  });

  describe('when using route variant "get-user:real" again', () => {
    it("should serve user 1 under the /api/users/1 path", async () => {
      core.mocks.useRouteVariant("get-user:real");
      const users = await doFetch("/api/users/1");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });

    it("should serve user 2 under the /api/users/2 path", async () => {
      const users = await doFetch("/api/users/2");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
    });
  });

  describe("when restoring route variants again", () => {
    it("should serve user 2 under the /api/users/1 path", async () => {
      core.mocks.restoreRouteVariants();
      const users = await doFetch("/api/users/1");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
    });

    it("should serve user 2 under the /api/users/2 path", async () => {
      const users = await doFetch("/api/users/2");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
    });
  });
});
