/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { startServer, stopServer, request } = require("./utils");

describe("behaviors api", () => {
  let server;
  beforeAll(async () => {
    server = await startServer("web-tutorial");
  });

  afterAll(() => {
    stopServer(server);
  });

  describe("get /", () => {
    it("should return current behaviors", async () => {
      const response = await request("/admin/behaviors");
      expect(response).toEqual([
        {
          extendedFrom: null,
          fixtures: ["12e5f429b92f67d4ec2bf90940ec1135", "0dbc954f9d9c9f3f7996c60e63384c9e"],
          name: "standard",
          id: "standard"
        },
        {
          extendedFrom: "standard",
          fixtures: [
            "bd5292849ee3fda9fa8383837bb908e7",
            "12e5f429b92f67d4ec2bf90940ec1135",
            "0dbc954f9d9c9f3f7996c60e63384c9e"
          ],
          name: "user2",
          id: "user2"
        },
        {
          extendedFrom: "standard",
          fixtures: [
            "e82af88532da929b0592925899eb056e",
            "12e5f429b92f67d4ec2bf90940ec1135",
            "0dbc954f9d9c9f3f7996c60e63384c9e"
          ],
          name: "dynamic",
          id: "dynamic"
        }
      ]);
    });
  });

  describe("get /standard", () => {
    it("should return standard behavior", async () => {
      const response = await request("/admin/behaviors/standard");
      expect(response).toEqual({
        extendedFrom: null,
        fixtures: ["12e5f429b92f67d4ec2bf90940ec1135", "0dbc954f9d9c9f3f7996c60e63384c9e"],
        name: "standard",
        id: "standard"
      });
    });
  });

  describe("get /dynamic", () => {
    it("should return standard behavior", async () => {
      const response = await request("/admin/behaviors/dynamic");
      expect(response).toEqual({
        extendedFrom: "standard",
        fixtures: [
          "e82af88532da929b0592925899eb056e",
          "12e5f429b92f67d4ec2bf90940ec1135",
          "0dbc954f9d9c9f3f7996c60e63384c9e"
        ],
        name: "dynamic",
        id: "dynamic"
      });
    });
  });

  describe("get unexistant behavior", () => {
    it("should return a not found error", async () => {
      const response = await request("/admin/behaviors/foo", {
        resolveWithFullResponse: true,
        simple: false
      });
      expect(response.statusCode).toEqual(404);
      expect(response.body.message).toEqual('Behavior with id "foo" was not found');
    });
  });
});
