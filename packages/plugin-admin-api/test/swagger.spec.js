/*
Copyright 2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { startServer, wait, doServerFetch, waitForServer } = require("./support/helpers");

describe("swagger", () => {
  let server, hostOption, portOption;

  beforeAll(async () => {
    server = await startServer("web-tutorial", { log: "silly" });
    hostOption = server.config.namespace("plugins").namespace("adminApi").option("host");
    portOption = server.config.namespace("plugins").namespace("adminApi").option("port");
    await waitForServer();
  });

  afterAll(async () => {
    await server.stop();
  });

  describe("when server is started", () => {
    it("should return current API url", async () => {
      const response = await doServerFetch("/docs/openapi.json");
      expect(response.body.servers[0].url).toEqual(`http://localhost:${portOption.value}/api`);
    });
  });

  describe("when port is changed", () => {
    it("should return current API url", async () => {
      portOption.value = 3102;
      await waitForServer(3102);
      const response = await doServerFetch("/docs/openapi.json", {
        port: 3102,
      });
      expect(response.body.servers[0].url).toEqual(`http://localhost:3102/api`);
    });
  });

  describe("when host is changed", () => {
    it("should return current API url", async () => {
      hostOption.value = "127.0.0.1";
      portOption.value = 3110;
      await wait(1000);
      const response = await doServerFetch("/docs/openapi.json");
      expect(response.body.servers[0].url).toEqual(`http://127.0.0.1:3110/api`);
    });
  });

  describe("when root url is loaded", () => {
    it("should redirect to swagger", async () => {
      const response = await doServerFetch("/");
      expect(response.url).toEqual("http://127.0.0.1:3110/docs/");
    });
  });

  describe("when root index.html url is loaded", () => {
    it("should redirect to swagger", async () => {
      const response = await doServerFetch("/index.html");
      expect(response.url).toEqual("http://127.0.0.1:3110/docs/");
    });
  });

  describe("when root index.htm url is loaded", () => {
    it("should redirect to swagger", async () => {
      const response = await doServerFetch("/index.htm");
      expect(response.url).toEqual("http://127.0.0.1:3110/docs/");
    });
  });
});
