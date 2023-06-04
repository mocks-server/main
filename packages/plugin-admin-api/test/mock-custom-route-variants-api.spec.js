/*
Copyright 2019-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { startServer, doFetch, doApiFetch, waitForServer } = require("./support/helpers");

describe("mock custom routes variants api", () => {
  let server;

  beforeAll(async () => {
    server = await startServer("web-tutorial", {
      log: "silly",
    });
    await waitForServer();
  });

  afterAll(async () => {
    await server.stop();
  });

  describe("get /", () => {
    it("should return mock custom routes variants", async () => {
      const response = await doApiFetch("/mock/custom-route-variants");

      expect(response.body).toEqual([]);
    });
  });

  describe("post /", () => {
    it("should add mock custom route variant", async () => {
      await doApiFetch("/mock/custom-route-variants", {
        method: "POST",
        body: {
          id: "get-user:2",
        },
      });
      const response = await doApiFetch("/mock/custom-route-variants");

      expect(response.body).toEqual([{ id: "get-user:2" }]);
    });

    it("should have changed user response", async () => {
      const response = await doFetch("/api/users/1");

      expect(response.body).toEqual({ id: 2, name: "Jane Doe" });
    });
  });

  describe("delete /", () => {
    it("should restore mock routes variants", async () => {
      await doApiFetch("/mock/custom-route-variants", {
        method: "DELETE",
      });
      const response = await doApiFetch("/mock/custom-route-variants");

      expect(response.body).toEqual([]);
    });

    it("should have changed user response", async () => {
      const response = await doFetch("/api/users/1");

      expect(response.body).toEqual({ id: 1, name: "John Doe" });
    });
  });

  describe("when trying to set an unexistent route variant", () => {
    it("should not add mock custom route variant", async () => {
      await doApiFetch("/mock/custom-route-variants", {
        method: "POST",
        body: {
          id: "foo",
        },
      });
      const response = await doApiFetch("/mock/custom-route-variants");

      expect(response.body).toEqual([]);
    });

    it("should not have changed user response", async () => {
      const response = await doFetch("/api/users/1");

      expect(response.body).toEqual({ id: 1, name: "John Doe" });
    });
  });
});
