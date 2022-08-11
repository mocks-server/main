/*
Copyright 2019-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const https = require("https");

const {
  startServer,
  doApiFetch,
  doFetch,
  waitForServer,
  waitForServerUrl,
} = require("./support/helpers");
const { version } = require("../package.json");
const { version: coreVersion } = require("../../core/package.json");

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

describe("https error handling", () => {
  let server;
  beforeAll(async () => {
    server = await startServer("web-tutorial", {
      plugins: {
        adminApi: {
          https: {
            enabled: true,
          },
        },
      },
      log: "silly",
    });
    await waitForServer();
  });

  afterAll(async () => {
    await server.stop();
  });

  describe("get /about in admin API using https", () => {
    it("should not work", async () => {
      const response = await doApiFetch("/about", {
        agent: httpsAgent,
        protocol: "https",
      }).catch((error) => {
        return Promise.resolve(error);
      });
      expect(response.message).toEqual(
        expect.stringContaining("https://127.0.0.1:3110/api/about")
      );
      expect(response.message).toEqual(expect.stringContaining("ECONNREFUSED"));
    });
  });

  describe("get /users in mock API using http", () => {
    it("should return users", async () => {
      const response = await doFetch("/api/users");
      expect(response.body).toEqual([
        {
          id: 1,
          name: "John Doe",
        },
        {
          id: 2,
          name: "Jane Doe",
        },
      ]);
    });
  });

  describe("when https is disabled in adminAPI", () => {
    beforeAll(async () => {
      server.config
        .namespace("plugins")
        .namespace("adminApi")
        .namespace("https")
        .option("enabled").value = false;
      await waitForServerUrl("/api/about", {
        port: 3110,
      });
    });

    it("/about API should work", async () => {
      const response = await doApiFetch("/about");
      expect(response.body).toEqual({
        versions: {
          adminApi: version,
          core: coreVersion,
        },
      });
    });

    it("users Mock should work", async () => {
      const response = await doFetch("/api/users");
      expect(response.body).toEqual([
        {
          id: 1,
          name: "John Doe",
        },
        {
          id: 2,
          name: "Jane Doe",
        },
      ]);
    });
  });
});
