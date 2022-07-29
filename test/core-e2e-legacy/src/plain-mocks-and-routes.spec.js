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
    it("should have three mocks", async () => {
      expect(core.mocks.plainMocks.length).toEqual(3);
    });

    it("should have two routes", async () => {
      expect(core.mocks.plainRoutes.length).toEqual(2);
    });

    it("should have five route variants", async () => {
      expect(core.mocks.plainRoutesVariants.length).toEqual(5);
    });
  });

  describe("plainMocks", () => {
    it("should return plain mocks", async () => {
      expect(core.mocks.plainMocks).toEqual([
        {
          id: "base",
          from: null,
          routesVariants: ["get-users:success", "get-user:1"],
          appliedRoutesVariants: ["get-users:success", "get-user:1"],
        },
        {
          id: "user-2",
          from: "base",
          routesVariants: ["get-user:2"],
          appliedRoutesVariants: ["get-users:success", "get-user:2"],
        },
        {
          id: "user-real",
          from: "base",
          routesVariants: ["get-user:real"],
          appliedRoutesVariants: ["get-users:success", "get-user:real"],
        },
      ]);
    });

    it("should return plain routes", async () => {
      expect(core.mocks.plainRoutes).toEqual([
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
          method: "get",
          delay: null,
          variants: ["get-users:success", "get-users:error"],
        },
      ]);
    });

    it("should return plain routesVariants", async () => {
      expect(core.mocks.plainRoutesVariants).toEqual([
        {
          id: "get-user:1",
          routeId: "get-user",
          handler: "default",
          response: {
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
          routeId: "get-user",
          handler: "default",
          response: {
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
          routeId: "get-user",
          handler: "default",
          response: null,
          delay: null,
        },
        {
          id: "get-users:success",
          routeId: "get-users",
          handler: "default",
          response: {
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
          routeId: "get-users",
          handler: "default",
          response: {
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
