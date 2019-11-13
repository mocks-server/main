/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { startServer, stopServer, request, changeDelay, TimeCounter } = require("./utils");

describe("delay setting", () => {
  let server;

  beforeAll(async () => {
    server = await startServer();

    return server.start();
  });

  afterAll(() => {
    stopServer(server);
  });

  describe("When started", () => {
    it("should respond with no delay", async () => {
      const timeCounter = new TimeCounter();
      await request("/api/users");
      timeCounter.stop();
      expect(timeCounter.total).toBeLessThan(200);
    });
  });

  describe("When delay is changed through admin-api", () => {
    it("should respond after defined delay", async () => {
      await changeDelay(1000);
      const timeCounter = new TimeCounter();
      await request("/api/users");
      timeCounter.stop();
      expect(timeCounter.total).toBeGreaterThan(999);
    });
  });
});
