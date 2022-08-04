/*
Copyright 2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const {
  startCore,
  doFetch,
  doTextFetch,
  waitForServer,
  waitForServerUrl,
  TimeCounter,
} = require("./support/helpers");

describe("file variant handler", () => {
  let core, changeMockAndWait;

  beforeAll(async () => {
    core = await startCore("file-handler", {
      log: "silly",
    });

    changeMockAndWait = async (collectionId) => {
      await core.mock.collections.select(collectionId);
    };
    await waitForServer();
  });

  afterAll(async () => {
    await core.stop();
  });

  describe("When variants of type file are loaded", () => {
    it("should serve users route", async () => {
      await changeMockAndWait("base");
      await waitForServerUrl("/api/users");

      const users = await doFetch("/api/users");
      expect(users.body).toEqual([{ id: 1, name: "John Doe" }]);
      expect(users.status).toEqual(200);
      expect(users.headers.get("Content-Type")).toEqual("application/json; charset=UTF-8");
    });

    it("should serve user route", async () => {
      const users = await doFetch("/api/users/1");
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
      expect(users.status).toEqual(200);
      expect(users.headers.get("Content-Type")).toEqual("application/json; charset=UTF-8");
      expect(users.headers.get("x-custom-header")).toEqual("foo-custom-header");
    });

    it("should serve web route", async () => {
      const users = await doTextFetch("/web");
      expect(users.body).toEqual("<div>Hello world</div>");
      expect(users.status).toEqual(200);
      expect(users.headers.get("Content-Type")).toEqual("text/html; charset=UTF-8");
      expect(users.headers.get("x-custom-header")).toEqual("web-custom-header");
    });
  });

  describe("When collection changes to users-error", () => {
    it("should return txt error in users route", async () => {
      await changeMockAndWait("users-error");

      const users = await doTextFetch("/api/users");
      expect(users.body).toEqual(expect.stringContaining("Error loaded from file"));
      expect(users.status).toEqual(400);
      expect(users.headers.get("Content-Type")).toEqual("text/plain; charset=UTF-8");
    });

    it("should return txt error in user route", async () => {
      const users = await doTextFetch("/api/users/1");
      expect(users.body).toEqual(expect.stringContaining("Error loaded from file"));
      expect(users.status).toEqual(400);
      expect(users.headers.get("Content-Type")).toEqual("text/plain; charset=UTF-8");
    });
  });

  describe("When collection changes to user-file-error", () => {
    beforeAll(async () => {
      await changeMockAndWait("user-file-error");
    });

    it("should serve users route", async () => {
      const users = await doFetch("/api/users");
      expect(users.body).toEqual([{ id: 1, name: "John Doe" }]);
      expect(users.status).toEqual(200);
    });

    it("should return 500 error in user route", async () => {
      const users = await doFetch("/api/users/1");
      expect(users.status).toEqual(500);
      expect(users.body.message).toEqual("An internal server error occurred");
    });
  });

  describe("When delay is set", () => {
    beforeAll(async () => {
      await changeMockAndWait("users-error");
      core.config.namespace("mock").namespace("routes").option("delay").value = 500;
    });

    it("should send response with delay", async () => {
      const timeCounter = new TimeCounter();
      const users = await doTextFetch("/api/users");
      timeCounter.stop();
      expect(timeCounter.total).toBeGreaterThan(400);
      expect(users.body).toEqual(expect.stringContaining("Error loaded from file"));
    });
  });
});
