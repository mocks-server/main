/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const {
  createCore,
  startExistingCore,
  fetch,
  fixturesFolder,
  findTrace,
} = require("./support/helpers");

const RouteHandler = require("./fixtures/config-file-with-routes-handler/CustomRoutesHandler");

describe("when adding route handlers", () => {
  describe("When started", () => {
    let core;

    beforeAll(async () => {
      core = createCore();
      core.addRoutesHandler(RouteHandler);
      await startExistingCore(core, fixturesFolder("custom-routes-handler"), {
        mock: "custom-users",
      });
      core.tracer.set("debug", "store");
    });

    afterAll(async () => {
      await core.stop();
    });

    it("should serve users in /api/users path", async () => {
      const users = await fetch("/api/users");
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });

    it("custom handler should have traced", async () => {
      expect(
        findTrace(
          'Responding with custom route handler to route variant "get-users:custom-success"',
          core.tracer.store
        )
      ).toBeDefined();
      expect(findTrace("Custom request GET =>", core.tracer.store)).toBeDefined();
    });
  });
});
