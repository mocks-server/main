/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { startCore, stopCore, request, wait } = require("./support/helpers");

describe("plugins load method", () => {
  class Plugin {
    register(coreInstance, methods) {
      this.load = methods.loadLegacyMocks;
    }
    async init() {
      this.load([
        {
          id: "standard",
          fixtures: ["users", "user-1"],
        },
        {
          from: "standard",
          id: "user2",
          fixtures: ["user-2"],
        },
        {
          id: "users",
          url: "/api/users",
          method: "GET",
          response: {
            status: 200,
            body: [
              {
                id: 1,
                name: "John Doe",
              },
              {
                id: 2,
                name: "Jane Doe",
              },
            ],
          },
        },
        {
          id: "user-1",
          url: "/api/users/:id",
          method: "GET",
          response: {
            status: 200,
            body: {
              id: 1,
              name: "John Doe",
            },
          },
        },
        {
          id: "user-2",
          url: "/api/users/:id",
          method: "GET",
          response: {
            status: 200,
            body: {
              id: 2,
              name: "Jane Doe",
            },
          },
        },
      ]);
    }
  }
  let core;

  beforeAll(async () => {
    core = await startCore("mocks", {
      plugins: [Plugin],
    });
  });

  afterAll(async () => {
    await stopCore(core);
  });

  describe("when started", () => {
    it("should have two behaviors available", async () => {
      expect(core.behaviors.count).toEqual(2);
    });

    it("should have three fixtures available", async () => {
      expect(core.fixtures.count).toEqual(3);
    });

    it("should send responses for loaded behaviors and fixtures", async () => {
      expect.assertions(2);
      const users = await request("/api/users");
      expect(users).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
      const user = await request("/api/users/1");
      expect(user).toEqual({
        id: 1,
        name: "John Doe",
      });
    });

    it("should send new responses when behavior changes", async () => {
      expect.assertions(2);
      core.settings.set("behavior", "user2");
      await wait();
      const users = await request("/api/users");
      expect(users).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
      const user = await request("/api/users/1");
      expect(user).toEqual({
        id: 2,
        name: "Jane Doe",
      });
    });
  });
});
