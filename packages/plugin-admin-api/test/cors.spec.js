/*
Copyright 2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { startServer, doFetch, doApiFetch, waitForServer } = require("./support/helpers");

describe("cors middleware", () => {
  let server;

  afterEach(async () => {
    await server.stop();
  });

  describe("when server cors is enabled", () => {
    beforeEach(async () => {
      server = await startServer("web-tutorial");
      await waitForServer();
    });

    it("should add cors headers to admin api routes", async () => {
      const response = await doApiFetch("/about", { method: "OPTIONS" });

      expect(response.headers.get("access-control-allow-origin")).toEqual("*");
      expect(response.headers.get("access-control-allow-methods")).toEqual(
        "GET,HEAD,PUT,PATCH,POST,DELETE"
      );
    });

    it("should add cors headers to mock routes", async () => {
      const response = await doFetch("/api/users/2", { method: "OPTIONS" });

      expect(response.headers.get("access-control-allow-origin")).toEqual("*");
      expect(response.headers.get("access-control-allow-methods")).toEqual(
        "GET,HEAD,PUT,PATCH,POST,DELETE"
      );
    });
  });

  describe("when server cors is disabled", () => {
    beforeEach(async () => {
      server = await startServer("web-tutorial", {
        server: {
          cors: {
            enabled: false,
          },
        },
      });
      await waitForServer();
    });

    it("should add cors headers to admin api routes", async () => {
      const response = await doApiFetch("/about", { method: "OPTIONS" });

      expect(response.headers.get("access-control-allow-origin")).toEqual("*");
      expect(response.headers.get("access-control-allow-methods")).toEqual(
        "GET,HEAD,PUT,PATCH,POST,DELETE"
      );
    });

    it("should disable cors headers in mock routes", async () => {
      const response = await doFetch("/api/users/2", { method: "OPTIONS" });

      expect(response.headers.get("access-control-allow-origin")).toEqual(null);
      expect(response.headers.get("access-control-allow-methods")).toEqual(null);
    });
  });
});
