/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { startServer, fetch, waitForServer, fixturesFolder } = require("./support/helpers");

describe("legacy fixtures api", () => {
  let server;

  beforeAll(async () => {
    server = await startServer("web-tutorial", {
      pathLegacy: fixturesFolder("legacy-web-tutorial"),
    });
    await waitForServer();
  });

  afterAll(async () => {
    await server.stop();
  });

  describe("get /", () => {
    it("should return current fixtures", async () => {
      const response = await fetch("/admin/legacy/fixtures");
      expect(response.body).toEqual([
        {
          id: "e82af88532da929b0592925899eb056e",
          requestMatchId: "9989c8c9766561cd432c625deabca48b",
          handler: "mocks-server-fixture",
          request: { url: "/api/users/:id", method: "GET" },
          response: {
            type: "dynamic",
            function:
              '(req, res) => {\n    const userId = req.params.id;\n    const user = INITIAL_USERS.find(userData => userData.id === Number(userId));\n\n    if (user) {\n      res.status(200);\n      res.send(user);\n    } else {\n      res.status(404);\n      res.send({\n        message: "User not found"\n      });\n    }\n  }',
          },
        },
        {
          id: "bd5292849ee3fda9fa8383837bb908e7",
          requestMatchId: "9989c8c9766561cd432c625deabca48b",
          handler: "mocks-server-fixture",
          request: { url: "/api/users/:id", method: "GET" },
          response: { type: "static", status: 200, body: { id: 2, name: "Jane Doe" } },
        },
        {
          id: "12e5f429b92f67d4ec2bf90940ec1135",
          requestMatchId: "9989c8c9766561cd432c625deabca48b",
          handler: "mocks-server-fixture",
          request: { url: "/api/users/:id", method: "GET" },
          response: { type: "static", status: 200, body: { id: 1, name: "John Doe" } },
        },
        {
          id: "0dbc954f9d9c9f3f7996c60e63384c9e",
          requestMatchId: "8b4d07b38f9320be1702c093fd1daa76",
          handler: "mocks-server-fixture",
          request: { url: "/api/users", method: "GET" },
          response: {
            type: "static",
            status: 200,
            body: [
              { id: 1, name: "John Doe" },
              { id: 2, name: "Jane Doe" },
            ],
          },
        },
      ]);
    });
  });

  describe("get /e82af88532da929b0592925899eb056e", () => {
    it("should return fixture with id e82af88532da929b0592925899eb056e", async () => {
      const response = await fetch("/admin/legacy/fixtures/e82af88532da929b0592925899eb056e");
      expect(response.body).toEqual({
        id: "e82af88532da929b0592925899eb056e",
        requestMatchId: "9989c8c9766561cd432c625deabca48b",
        handler: "mocks-server-fixture",
        request: { url: "/api/users/:id", method: "GET" },
        response: {
          type: "dynamic",
          function:
            '(req, res) => {\n    const userId = req.params.id;\n    const user = INITIAL_USERS.find(userData => userData.id === Number(userId));\n\n    if (user) {\n      res.status(200);\n      res.send(user);\n    } else {\n      res.status(404);\n      res.send({\n        message: "User not found"\n      });\n    }\n  }',
        },
      });
    });
  });

  describe("get /bd5292849ee3fda9fa8383837bb908e7", () => {
    it("should return fixture with id bd5292849ee3fda9fa8383837bb908e7", async () => {
      const response = await fetch("/admin/legacy/fixtures/bd5292849ee3fda9fa8383837bb908e7");
      expect(response.body).toEqual({
        id: "bd5292849ee3fda9fa8383837bb908e7",
        requestMatchId: "9989c8c9766561cd432c625deabca48b",
        handler: "mocks-server-fixture",
        request: { url: "/api/users/:id", method: "GET" },
        response: { type: "static", status: 200, body: { id: 2, name: "Jane Doe" } },
      });
    });
  });

  describe("get unexistant fixture", () => {
    it("should return a not found error", async () => {
      const response = await fetch("/admin/legacy/fixtures/foo");
      expect(response.status).toEqual(404);
      expect(response.body.message).toEqual('Fixture with id "foo" was not found');
    });
  });
});
