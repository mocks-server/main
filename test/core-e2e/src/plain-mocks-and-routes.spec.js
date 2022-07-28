/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { startCore, waitForServer, removeConfigFile } = require("./support/helpers");

describe("mocks and routes", () => {
  let core;

  beforeAll(async () => {
    core = await startCore("web-tutorial");
    await waitForServer();
  });

  afterAll(async () => {
    removeConfigFile();
    await core.stop();
  });

  describe("amounts", () => {
    it("should have three collections", async () => {
      expect(core.mock.collections.plain.length).toEqual(3);
    });

    it("should have two routes", async () => {
      expect(core.mock.routes.plain.length).toEqual(2);
    });

    it("should have five route variants", async () => {
      expect(core.mock.routes.plainVariants.length).toEqual(5);
    });
  });

  describe("collections.plain", () => {
    it("should return plain collections", async () => {
      expect(core.mock.collections.plain).toEqual([
        {
          id: "base",
          from: null,
          definedRoutes: ["get-users:success", "get-user:1"],
          routes: ["get-users:success", "get-user:1"],
        },
        {
          id: "user-2",
          from: "base",
          definedRoutes: ["get-user:2"],
          routes: ["get-users:success", "get-user:2"],
        },
        {
          id: "user-real",
          from: "base",
          definedRoutes: ["get-user:real"],
          routes: ["get-users:success", "get-user:real"],
        },
      ]);
    });

    it("should return plain routes", async () => {
      expect(core.mock.routes.plain).toEqual([
        {
          id: "get-user",
          url: "/api/users/:id",
          method: "get",
          delay: null,
          variants: ["get-user:1", "get-user:2", "get-user:real"],
        },
        {
          id: "get-users",
          url: "/api/users",
          method: "GET",
          delay: null,
          variants: ["get-users:success", "get-users:error"],
        },
      ]);
    });

    it("should return plain routesVariants", async () => {
      expect(core.mock.routes.plainVariants).toEqual([
        {
          id: "get-user:1",
          route: "get-user",
          type: "json",
          disabled: false,
          preview: {
            body: {
              id: 1,
              name: "John Doe",
            },
            status: 200,
          },
          delay: null,
        },
        {
          id: "get-user:2",
          route: "get-user",
          type: "json",
          disabled: false,
          preview: {
            body: {
              id: 2,
              name: "Jane Doe",
            },
            status: 200,
          },
          delay: null,
        },
        {
          id: "get-user:real",
          route: "get-user",
          type: "middleware",
          disabled: false,
          preview: null,
          delay: null,
        },
        {
          id: "get-users:success",
          route: "get-users",
          type: "json",
          disabled: false,
          preview: {
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
            status: 200,
          },
          delay: null,
        },
        {
          id: "get-users:error",
          route: "get-users",
          type: "json",
          disabled: false,
          preview: {
            body: {
              message: "Bad data",
            },
            status: 403,
          },
          delay: null,
        },
      ]);
    });
  });
});
