/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const express = require("express");

const { Core } = require("../../index");
const { stopCore, request, fixturesFolder } = require("./utils");

describe("when using custom router", () => {
  const customRouter = express.Router();
  customRouter.get("/", (req, res) => {
    res.status(200);
    res.send({
      customRouterListening: true
    });
  });
  let core;

  describe("and registering it before initializating the server", () => {
    beforeAll(async () => {
      core = new Core({
        onlyProgrammaticOptions: true
      });
      await core.addRouter("/api/custom", customRouter);
      await core.init({
        log: "silly",
        path: fixturesFolder("web-tutorial")
      });
      await core.start();
    });

    afterAll(async () => {
      await stopCore(core);
    });

    it("custom router should be listening", async () => {
      const response = await request("/api/custom");
      expect(response.customRouterListening).toEqual(true);
    });

    it("fixtures routers should be listening", async () => {
      const users = await request("/api/users");
      expect(users).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" }
      ]);
    });

    /*it("custom router should stop listening when is removed", async () => {
      await core.removeRouter("/api/custom", customRouter);
      const response = await request("/api/custom", {
        resolveWithFullResponse: true,
        simple: false
      });
      expect(response.statusCode).toEqual(404);
    });*/
  });

  /* describe("and registering it after server is started", () => {
    beforeAll(async () => {
      core = new Core({
        onlyProgrammaticOptions: true
      });
      await core.init({
        path: fixturesFolder("web-tutorial")
      });
      await core.start();
      await core.addRouter("/api/custom", customRouter);
    });

    afterAll(async () => {
      await stopCore(core);
    });

    it("custom router should be listening", async () => {
      const response = await request("/api/custom");
      expect(response.customRouterListening).toEqual(true);
    });

    it("fixtures routers should be listening", async () => {
      const users = await request("/api/users");
      expect(users).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" }
      ]);
    });

    it("custom router should stop listening when is removed", async () => {
      await core.removeRouter("/api/custom", customRouter);
      const response = await request("/api/custom", {
        resolveWithFullResponse: true,
        simple: false
      });
      expect(response.statusCode).toEqual(404);
    });
  }); */
});
