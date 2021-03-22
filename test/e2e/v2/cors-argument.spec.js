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
      cli = mocksRunner(["--path=multi-methods"]);
      await waitForServer();
    });

    afterEach(async () => {
      await cli.kill();
    });

    it("cors middleware should handle OPTIONS requests", async () => {
      const users = await fetch(`/api/users/1`, { method: "OPTIONS" });
      expect(users.status).toEqual(204);
      expect(users.body).toEqual(null);
    });
  });

  describe("when cors is disabled", () => {
    beforeAll(async () => {
      cli = mocksRunner(["--path=multi-methods", "--no-cors"]);
      await waitForServer();
    });

    afterAll(async () => {
      await cli.kill();
    });

    it("route middleware should handle OPTIONS request", async () => {
      const users = await fetch(`/api/users/1`, { method: "OPTIONS" });
      expect(users.status).toEqual(200);
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });
  });
});
