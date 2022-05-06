/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { mocksRunner, fetch, waitForServer } = require("./support/helpers");

describe("cors command line argument", () => {
  let cli;

  describe("when cors is enabled", () => {
    beforeEach(async () => {
      cli = mocksRunner(["--plugins.filesLoader.path=multi-methods"]);
      await waitForServer();
    });

    afterEach(async () => {
      await cli.kill();
    });

    it("cors middleware should handle OPTIONS requests", async () => {
      const users = await fetch(`/api/users/1`, { method: "OPTIONS" });
      expect(users.status).toEqual(204);
      expect(users.headers.get("access-control-allow-origin")).toEqual("*");
      expect(users.headers.get("access-control-allow-methods")).toEqual(
        "GET,HEAD,PUT,PATCH,POST,DELETE"
      );
      expect(users.body).toEqual(null);
    });

    it("cors middleware should handle OPTIONS requests to all paths without route", async () => {
      const users = await fetch(`/api/foo`, { method: "OPTIONS" });
      expect(users.status).toEqual(204);
      expect(users.headers.get("access-control-allow-origin")).toEqual("*");
      expect(users.headers.get("access-control-allow-methods")).toEqual(
        "GET,HEAD,PUT,PATCH,POST,DELETE"
      );
      expect(users.body).toEqual(null);
    });

    it("Response headers should include cors headers", async () => {
      const users = await fetch(`/api/users/1`);
      expect(users.headers.get("access-control-allow-origin")).toEqual("*");
    });
  });

  describe("when cors is disabled", () => {
    beforeAll(async () => {
      cli = mocksRunner(["--plugins.filesLoader.path=multi-methods", "--no-server.cors"]);
      await waitForServer();
    });

    afterAll(async () => {
      await cli.kill();
    });

    it("route middleware should handle OPTIONS request", async () => {
      const users = await fetch(`/api/users/1`, { method: "OPTIONS" });
      expect(users.status).toEqual(200);
      expect(users.headers.get("access-control-allow-origin")).toEqual(null);
      expect(users.headers.get("access-control-allow-methods")).toEqual(null);
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });

    it("cors middleware should not handle OPTIONS requests to paths without route", async () => {
      const users = await fetch(`/api/foo`, { method: "OPTIONS" });
      expect(users.status).toEqual(404);
      expect(users.headers.get("access-control-allow-origin")).toEqual(null);
      expect(users.headers.get("access-control-allow-methods")).toEqual(null);
      expect(users.body).toEqual({ error: "Not Found", message: "Not Found", statusCode: 404 });
    });

    it("Response headers should not include cors headers", async () => {
      const users = await fetch(`/api/users/1`);
      expect(users.headers.get("access-control-allow-origin")).toEqual(null);
    });
  });

  describe("when cors is enabled but corsPreflight disabled", () => {
    beforeEach(async () => {
      cli = mocksRunner(["--plugins.filesLoader.path=multi-methods", "--no-server.corsPreFlight"]);
      await waitForServer();
    });

    afterEach(async () => {
      await cli.kill();
    });

    it("route middleware should handle OPTIONS request", async () => {
      const users = await fetch(`/api/users/1`, { method: "OPTIONS" });
      expect(users.status).toEqual(200);
      expect(users.headers.get("access-control-allow-origin")).toEqual("*");
      expect(users.headers.get("access-control-allow-methods")).toEqual(
        "GET,HEAD,PUT,PATCH,POST,DELETE"
      );
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });

    it("cors middleware should not handle OPTIONS requests to paths without route", async () => {
      const users = await fetch(`/api/foo`, { method: "OPTIONS" });
      expect(users.status).toEqual(404);
      expect(users.headers.get("access-control-allow-origin")).toEqual("*");
      expect(users.headers.get("access-control-allow-methods")).toEqual(
        "GET,HEAD,PUT,PATCH,POST,DELETE"
      );
      expect(users.body).toEqual({ error: "Not Found", message: "Not Found", statusCode: 404 });
    });

    it("Response headers should include cors headers", async () => {
      const users = await fetch(`/api/users/1`);
      expect(users.headers.get("access-control-allow-origin")).toEqual("*");
    });
  });
});
