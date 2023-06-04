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
  spawn,
  certFile,
  keyFile,
  removeCertFiles,
} = require("./support/helpers");
const { version } = require("../package.json");
const { version: coreVersion } = require("../../core/package.json");

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

describe("https", () => {
  let server;

  beforeAll(async () => {
    const generateCerts = spawn([
      "openssl",
      "req",
      "-newkey",
      "rsa:4096",
      "-days",
      "1",
      "-nodes",
      "-x509",
      "-subj",
      "/C=US/ST=Denial/L=Springfield/O=Dis/CN=localhost",
      "-keyout",
      "localhost.key",
      "-out",
      "localhost.cert",
    ]);
    await generateCerts.hasExited();
    server = await startServer("web-tutorial", {
      server: {
        https: {
          enabled: true,
          cert: certFile,
          key: keyFile,
        },
      },
      plugins: {
        adminApi: {
          https: {
            enabled: true,
            cert: certFile,
            key: keyFile,
          },
        },
      },
    });
    await waitForServer();
  });

  afterAll(async () => {
    removeCertFiles();
    await server.stop();
  });

  describe("get /about in admin API using https", () => {
    it("should return current version", async () => {
      const response = await doApiFetch("/about", {
        agent: httpsAgent,
        protocol: "https",
      });

      expect(response.body).toEqual({
        versions: {
          adminApi: version,
          core: coreVersion,
        },
      });
    });
  });

  describe("get /users in mock API using https", () => {
    it("should return users", async () => {
      await server._stopPlugins();
      const response = await doFetch("/api/users", {
        agent: httpsAgent,
        protocol: "https",
      });

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
