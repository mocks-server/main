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
  findAlert,
  removeConfigFile,
} = require("./support/helpers");

describe("mock setting", () => {
  let core, changeMock;

  beforeAll(async () => {
    core = await startCore("web-tutorial");
    await waitForServer();
    changeMock = (name) => {
      core.config.namespace("mocks").option("selected").value = name;
    };
  });

  afterAll(async () => {
    removeConfigFile();
    await core.stop();
  });

  describe("mock by default", () => {
    it("should have added an alert about mock was not defined", () => {
      expect(findAlert("mocks:settings", core.alerts).message).toEqual(
        expect.stringContaining("Option 'mock' was not defined")
      );
    });

    it("should serve users under the /api/users path", async () => {
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

    it("should serve user 1 under the /api/users/2 path", async () => {
      const users = await doFetch("/api/users/2");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });
  });

  describe('when changing mock to "user-2"', () => {
    beforeAll(() => {
      changeMock("user-2");
    });

    it("should have removed alert", () => {
      expect(findAlert("mocks:settings", core.alerts)).toEqual(undefined);
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

  describe('when changing mock to "user-real"', () => {
    beforeAll(() => {
      changeMock("user-real");
    });

    it("should serve users collection mock under the /api/users path", async () => {
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

    it("should return not found for /api/users/3 path", async () => {
      const users = await doFetch("/api/users/3");
      expect(users.status).toEqual(404);
    });
  });

  describe('when changing mock to "foo"', () => {
    beforeAll(() => {
      changeMock("foo");
    });

    it("should have added an alert", () => {
      expect(findAlert("mocks:settings", core.alerts).message).toEqual(
        expect.stringContaining("Mock 'foo' was not found")
      );
    });

    // if mock not exists, it uses the first one found
    it("should serve users under the /api/users path", async () => {
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

    it("should serve user 1 under the /api/users/2 path", async () => {
      const users = await doFetch("/api/users/2");
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });
  });

  describe('when changing mock again to "user-real"', () => {
    beforeAll(() => {
      changeMock("user-real");
    });

    it("should have removed alert", () => {
      expect(findAlert("mocks:settings", core.alerts)).toEqual(undefined);
    });
  });
});
