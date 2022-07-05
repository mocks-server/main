/*
Copyright 2020 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { startServer, doFetch, waitForServer, wait, fixturesFolder } = require("./support/helpers");

describe("alerts api", () => {
  let server;
  beforeAll(async () => {
    server = await startServer("web-tutorial", {
      mocks: {
        selected: "foo",
      },
    });
    await waitForServer();
  });

  afterAll(async () => {
    await server.stop();
  });

  describe("when started", () => {
    it("should return mock not found alert", async () => {
      const response = await doFetch("/admin/alerts");
      // one alert is caused by deprecated handler
      expect(response.body.length).toEqual(2);
    });

    it("should return specific alert when requested by id", async () => {
      const response = await doFetch("/admin/alerts/mocks%3Asettings");
      expect(response.body).toEqual({
        id: "mocks:settings",
        context: "mocks:settings",
        message: "Mock 'foo' was not found. Using the first one found",
        error: null,
      });
    });

    it("should serve users collection mock under the /api/users path", async () => {
      const users = await doFetch("/api/users");
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });
  });

  describe("when mock is modified", () => {
    beforeAll(async () => {
      await doFetch("/admin/settings", {
        method: "PATCH",
        body: {
          mocks: {
            selected: "base",
          },
        },
      });
      await wait();
    }, 10000);

    it("should return no alerts", async () => {
      const response = await doFetch("/admin/alerts");
      // one alert is caused by deprecated handler
      expect(response.body.length).toEqual(1);
    });
  });

  describe("when there is an error loading files", () => {
    beforeAll(async () => {
      await doFetch("/admin/settings", {
        method: "PATCH",
        body: {
          files: {
            path: fixturesFolder("files-error-routes"),
          },
        },
      });
      await wait();
    }, 10000);

    it("should return alert containing error", async () => {
      const response = await doFetch("/admin/alerts");
      expect(response.body.length).toEqual(4);
      expect(response.body[3].error.message).toEqual(
        expect.stringContaining("Cannot find module '../db/users'")
      );
    });
  });
});
