/*
Copyright 2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { startServer, doApiFetch, waitForServer } = require("./support/helpers");

describe("routes with static variants", () => {
  let server;

  beforeAll(async () => {
    server = await startServer("static");
    await waitForServer();
  });

  afterAll(async () => {
    await server.stop();
  });

  describe("get /mock/routes", () => {
    it("should return routes", async () => {
      const response = await doApiFetch("/mock/routes");
      expect(response.body).toEqual([
        {
          id: "get-users",
          url: "/api/users",
          method: "get",
          delay: null,
          variants: ["get-users:1", "get-users:2"],
        },
        {
          id: "get-web",
          url: "/web",
          method: ["get", "post", "patch", "delete", "put", "options", "head", "trace"],
          delay: null,
          variants: ["get-web:disabled", "get-web:fast", "get-web:delayed", "get-web:no-index"],
        },
        {
          id: "get-web-error",
          url: "/web/**",
          method: ["get", "post", "patch", "delete", "put", "options", "head", "trace"],
          delay: null,
          variants: ["get-web-error:disabled", "get-web-error:error"],
        },
      ]);
    });
  });

  describe("get /mock/variants", () => {
    it("should return routes variants", async () => {
      const response = await doApiFetch("/mock/variants");
      expect(response.body).toEqual([
        {
          id: "get-users:1",
          disabled: false,
          route: "get-users",
          type: "json",
          preview: { body: [{ email: "foo@foo.com" }], status: 200 },
          delay: null,
        },
        {
          id: "get-users:2",
          disabled: false,
          route: "get-users",
          type: "json",
          preview: { body: [{ email: "foo2@foo2.com" }], status: 200 },
          delay: null,
        },
        { id: "get-web:disabled", disabled: true, route: "get-web", preview: null },
        {
          id: "get-web:fast",
          disabled: false,
          route: "get-web",
          type: "static",
          preview: null,
          delay: null,
        },
        {
          id: "get-web:delayed",
          disabled: false,
          route: "get-web",
          type: "static",
          preview: null,
          delay: 500,
        },
        {
          id: "get-web:no-index",
          disabled: false,
          route: "get-web",
          type: "static",
          preview: null,
          delay: null,
        },
        { id: "get-web-error:disabled", disabled: true, route: "get-web-error", preview: null },
        {
          id: "get-web-error:error",
          disabled: false,
          route: "get-web-error",
          type: "json",
          preview: { body: { message: "Forced error" }, status: 400 },
          delay: null,
        },
      ]);
    });
  });
});
