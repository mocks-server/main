/*
Copyright 2021-2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const {
  mocksRunner,
  doFetch,
  waitForServerAndCli,
  wait,
  cleanScaffold,
  createCertFiles,
  removeCertFiles,
  certFile,
  keyFile,
} = require("./support/helpers");
const https = require("https");

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

describe("scaffold", () => {
  jest.setTimeout(15000);
  let mocks;

  beforeAll(async () => {
    await createCertFiles();
    await cleanScaffold();
    mocks = mocksRunner();
    await waitForServerAndCli();
  });

  afterAll(async () => {
    removeCertFiles();
    await mocks.kill();
  });

  describe("When started", () => {
    it("should have 4 mocks available", async () => {
      expect(mocks.currentScreen).toEqual(expect.stringContaining("Collections: 4"));
    });

    it("should serve users collection mock under the /api/users path", async () => {
      const users = await doFetch("/api/users");

      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });
  });

  describe("when mock server changes to https", () => {
    beforeAll(async () => {
      await doFetch("/api/config", {
        port: 3110,
        method: "PATCH",
        body: {
          server: {
            https: {
              enabled: true,
              cert: certFile,
              key: keyFile,
            },
          },
        },
      });
      await wait(5000);
    });

    it("should display new url", async () => {
      expect(mocks.currentScreen).toEqual(expect.stringContaining("https://localhost:3100"));
    });

    it("should serve users collection mock using https", async () => {
      const users = await doFetch("/api/users", {
        protocol: "https",
        agent: httpsAgent,
      });

      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });
  });

  describe("when admin API changes to https", () => {
    beforeAll(async () => {
      await doFetch("/api/config", {
        port: 3110,
        method: "PATCH",
        body: {
          plugins: {
            adminApi: {
              https: {
                enabled: true,
                cert: certFile,
                key: keyFile,
              },
            },
          },
        },
      });
      await wait(5000);
    });

    it("should serve about using https", async () => {
      const about = await doFetch("/api/about", {
        port: 3110,
        protocol: "https",
        agent: httpsAgent,
      });

      expect(about.body.versions.core).toBeDefined();
    });

    it("should serve users collection mock using https", async () => {
      const users = await doFetch("/api/users", {
        protocol: "https",
        agent: httpsAgent,
      });

      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });
  });

  describe("when admin API changes to http", () => {
    beforeAll(async () => {
      await doFetch("/api/config", {
        port: 3110,
        protocol: "https",
        agent: httpsAgent,
        method: "PATCH",
        body: {
          plugins: {
            adminApi: {
              https: {
                enabled: false,
              },
            },
          },
        },
      });
      await wait(5000);
    });

    it("should serve about using http", async () => {
      const about = await doFetch("/api/about", {
        port: 3110,
      });

      expect(about.body.versions.core).toBeDefined();
    });

    it("should serve users collection mock using https", async () => {
      const users = await doFetch("/api/users", {
        protocol: "https",
        agent: httpsAgent,
      });

      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });
  });

  describe("when mock server changes to http", () => {
    beforeAll(async () => {
      await doFetch("/api/config", {
        port: 3110,
        method: "PATCH",
        body: {
          server: {
            https: {
              enabled: false,
            },
          },
        },
      });
      await wait(5000);
    });

    it("should display new url", async () => {
      expect(mocks.currentScreen).toEqual(expect.stringContaining("http://localhost:3100"));
    });

    it("should serve users collection mock using http", async () => {
      const users = await doFetch("/api/users");

      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });
  });
});
