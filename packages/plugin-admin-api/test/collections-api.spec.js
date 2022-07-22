/*
Copyright 2019-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { startServer, doApiFetch, waitForServer } = require("./support/helpers");

describe("mocks api", () => {
  let server;

  beforeAll(async () => {
    server = await startServer("web-tutorial");
    await waitForServer();
  });

  afterAll(async () => {
    await server.stop();
  });

  describe("get /", () => {
    it("should return current mocks", async () => {
      const response = await doApiFetch("/mock/collections");
      expect(response.body).toEqual([
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
  });

  describe("get /base", () => {
    it("should return base mock", async () => {
      const response = await doApiFetch("/mock/collections/base");
      expect(response.body).toEqual({
        id: "base",
        from: null,
        definedRoutes: ["get-users:success", "get-user:1"],
        routes: ["get-users:success", "get-user:1"],
      });
    });
  });

  describe("get /user-2", () => {
    it("should return user-2 mock", async () => {
      const response = await doApiFetch("/mock/collections/user-2");
      expect(response.body).toEqual({
        id: "user-2",
        from: "base",
        definedRoutes: ["get-user:2"],
        routes: ["get-users:success", "get-user:2"],
      });
    });
  });

  describe("get unexistant mock", () => {
    it("should return a not found error", async () => {
      const response = await doApiFetch("/mock/collections/foo");
      expect(response.status).toEqual(404);
      expect(response.body.message).toEqual('Collection with id "foo" was not found');
    });
  });
});
