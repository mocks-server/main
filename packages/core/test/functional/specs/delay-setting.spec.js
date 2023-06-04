/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const {
  startCore,
  doFetch,
  TimeCounter,
  waitForServer,
  removeConfigFile,
} = require("../support/helpers");

describe("delay setting", () => {
  let core;

  beforeAll(async () => {
    core = await startCore("delays");
    await waitForServer();
  });

  afterAll(async () => {
    removeConfigFile();
    await core.stop();
  });

  describe("When started", () => {
    it("should respond with no delay", async () => {
      const timeCounter = new TimeCounter();
      await doFetch("/api/users");
      timeCounter.stop();

      expect(timeCounter.total).toBeLessThan(400);
    });
  });

  describe("When delay setting is changed", () => {
    it("should respond after defined delay", async () => {
      core.config.namespace("mock").namespace("routes").option("delay").value = 1000;
      const timeCounter = new TimeCounter();
      await doFetch("/api/users");
      timeCounter.stop();

      expect(timeCounter.total).toBeGreaterThan(999);
    });
  });

  describe("When route variant has delay", () => {
    it("should respond after route variant defined delay", async () => {
      core.mock.useRouteVariant("get-users:delayed");
      const timeCounter = new TimeCounter();
      await doFetch("/api/users");
      timeCounter.stop();

      expect(timeCounter.total).toBeGreaterThan(1999);
    });

    it("should respond with same delay after setting delay to zero", async () => {
      core.config.namespace("mock").namespace("routes").option("delay").value = 0;
      const timeCounter = new TimeCounter();
      await doFetch("/api/users");
      timeCounter.stop();

      expect(timeCounter.total).toBeGreaterThan(1999);
    });

    it("should respond with same delay after setting delay to 4000", async () => {
      core.config.namespace("mock").namespace("routes").option("delay").value = 4000;
      const timeCounter = new TimeCounter();
      await doFetch("/api/users");
      timeCounter.stop();

      expect(timeCounter.total).toBeGreaterThan(1999);
    });
  });

  describe("When route has delay", () => {
    it("should respond after route defined delay", async () => {
      const timeCounter = new TimeCounter();
      await doFetch("/api/users/1");
      timeCounter.stop();

      expect(timeCounter.total).toBeGreaterThan(999);
    });

    it("should respond with same delay after setting delay to zero", async () => {
      core.config.namespace("mock").namespace("routes").option("delay").value = 0;
      const timeCounter = new TimeCounter();
      await doFetch("/api/users/1");
      timeCounter.stop();

      expect(timeCounter.total).toBeGreaterThan(999);
    });
  });

  describe("When route has delay and also route variant", () => {
    it("should respond after route variant defined delay", async () => {
      core.config.namespace("mock").namespace("collections").option("selected").value = "user-2";
      const timeCounter = new TimeCounter();
      await doFetch("/api/users/1");
      timeCounter.stop();

      expect(timeCounter.total).toBeGreaterThan(1999);
    });
  });

  describe("When route has delay and route variant has zero delay", () => {
    afterEach(() => {
      core.mock.restoreRouteVariants();
    });

    it("should respond with no delay", async () => {
      core.mock.useRouteVariant("get-user:zero-delay");
      const timeCounter = new TimeCounter();
      await doFetch("/api/users/1");
      timeCounter.stop();

      expect(timeCounter.total).toBeLessThan(500);
    });

    it("should have zero delay in plain route variant", async () => {
      expect(core.mock.routes.plainVariants[2]).toEqual({
        type: "json",
        id: "get-user:zero-delay",
        disabled: false,
        delay: 0,
        preview: {
          status: 200,
          body: {
            id: 1,
            name: "John Doe",
          },
        },
        route: "get-user",
      });
    });
  });

  describe("When route has delay and route variant has null delay", () => {
    afterEach(() => {
      core.mock.restoreRouteVariants();
    });

    it("should respond with global server delay", async () => {
      core.config.namespace("mock").namespace("routes").option("delay").value = 3000;
      core.mock.useRouteVariant("get-user:null-delay");
      const timeCounter = new TimeCounter();
      await doFetch("/api/users/1");
      timeCounter.stop();

      expect(timeCounter.total).toBeGreaterThan(2999);
    });

    it("should have null delay in plain route variant", async () => {
      expect(core.mock.routes.plainVariants[3]).toEqual({
        type: "json",
        id: "get-user:null-delay",
        disabled: false,
        delay: null,
        preview: {
          status: 200,
          body: {
            id: 1,
            name: "John Doe",
          },
        },
        route: "get-user",
      });
    });
  });
});
