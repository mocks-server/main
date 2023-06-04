/*
Copyright 2019-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { startServer, doApiFetch, waitForServer } = require("./support/helpers");

describe("routes api", () => {
  let server;

  beforeAll(async () => {
    server = await startServer("web-tutorial");
    await waitForServer();
  });

  afterAll(async () => {
    await server.stop();
  });

  describe("get /", () => {
    it("should return current routes", async () => {
      const response = await doApiFetch("/mock/routes");

      expect(response.body).toEqual([
        {
          id: "get-user",
          delay: null,
          url: "/api/users/:id",
          method: ["get"],
          variants: ["get-user:1", "get-user:2", "get-user:real"],
        },
        {
          id: "get-users",
          delay: null,
          url: "/api/users",
          method: ["get"],
          variants: ["get-users:success", "get-users:error"],
        },
      ]);
    });
  });

  describe("get /get-user", () => {
    it("should return route with id get-user", async () => {
      const response = await doApiFetch("/mock/routes/get-user");

      expect(response.body).toEqual({
        id: "get-user",
        delay: null,
        url: "/api/users/:id",
        method: ["get"],
        variants: ["get-user:1", "get-user:2", "get-user:real"],
      });
    });
  });

  describe("get /get-users", () => {
    it("should return route with id get-users", async () => {
      const response = await doApiFetch("/mock/routes/get-users");

      expect(response.body).toEqual({
        id: "get-users",
        delay: null,
        url: "/api/users",
        method: ["get"],
        variants: ["get-users:success", "get-users:error"],
      });
    });
  });

  describe("get unexistant route", () => {
    it("should return a not found error", async () => {
      const response = await doApiFetch("/mock/routes/foo");

      expect(response.status).toEqual(404);
      expect(response.body.message).toEqual('Route with id "foo" was not found');
    });
  });
});
