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
} = require("../support/helpers");

describe("static variant handler", () => {
  let core, changeMockAndWait;

  beforeAll(async () => {
    core = await startCore("static");

    changeMockAndWait = async (collectionId) => {
      await core.mock.collections.select(collectionId);
    };
    await waitForServer();
  });

  afterAll(async () => {
    await core.stop();
  });

  describe("When variants of type static are loaded", () => {
    it("should serve other routes", async () => {
      await changeMockAndWait("base");
      await waitForServerUrl("/api/users");

      const users = await doFetch("/api/users");

      expect(users.body).toEqual([{ email: "foo@foo.com" }]);
    });

    it("should serve static files", async () => {
      const json = await doFetch("/web/subfolder/foo.json");

      expect(json.body).toEqual({ foo: "foo-value" });

      const humans = await doTextFetch("/web/humans.txt");

      expect(humans.body).toEqual(expect.stringContaining("Hello world from TXT"));
    });

    it("should serve index file", async () => {
      const index = await doTextFetch("/web");

      expect(index.body).toEqual(expect.stringContaining("Hello world from HTML"));
    });
  });

  describe("When variant has delay", () => {
    beforeAll(async () => {
      await changeMockAndWait("delayed");
    });

    it("should serve static files with delay", async () => {
      const timeCounter = new TimeCounter();
      const json = await doFetch("/web/subfolder/foo.json");
      timeCounter.stop();

      expect(timeCounter.total).toBeGreaterThan(400);
      expect(json.body).toEqual({ foo: "foo-value" });
    });

    it("should serve index file with delay", async () => {
      const timeCounter = new TimeCounter();
      const index = await doTextFetch("/web");
      timeCounter.stop();

      expect(timeCounter.total).toBeGreaterThan(400);
      expect(index.body).toEqual(expect.stringContaining("Hello world from HTML"));
    });
  });

  describe("When index option is set to false in variant", () => {
    beforeAll(async () => {
      await changeMockAndWait("no-index");
    });

    it("should serve static files", async () => {
      const json = await doFetch("/web/subfolder/foo.json");

      expect(json.body).toEqual({ foo: "foo-value" });

      const humans = await doTextFetch("/web/humans.txt");

      expect(humans.body).toEqual(expect.stringContaining("Hello world from TXT"));
    });

    it("should retun not found in folder", async () => {
      const response = await doTextFetch("/web");

      expect(response.status).toEqual(404);
    });

    it("should serve index file when route includes file name", async () => {
      const index = await doTextFetch("/web/index.html");

      expect(index.body).toEqual(expect.stringContaining("Hello world from HTML"));
    });
  });

  describe("When headers option is set in variant", () => {
    it("responses of static files should include headers", async () => {
      const json = await doFetch("/web/subfolder/foo.json");

      expect(json.headers.get("x-index-disabled")).toEqual("true");

      const humans = await doTextFetch("/web/humans.txt");

      expect(humans.headers.get("x-index-disabled")).toEqual("true");
    });

    it("response of index file should include headers", async () => {
      const index = await doTextFetch("/web/index.html");

      expect(index.headers.get("x-index-disabled")).toEqual("true");
    });
  });

  describe("When route is disabled and the web-error route is enabled", () => {
    beforeAll(async () => {
      await changeMockAndWait("web-error");
    });

    it("responses of static files should return error", async () => {
      const json = await doFetch("/web/subfolder/foo.json");

      expect(json.status).toEqual(400);
      expect(json.body).toEqual({ message: "Forced error" });

      const humans = await doFetch("/web/humans.txt");

      expect(humans.status).toEqual(400);
      expect(humans.body).toEqual({ message: "Forced error" });
    });

    it("response of index file should return error", async () => {
      const index = await doFetch("/web");

      expect(index.status).toEqual(400);
      expect(index.body).toEqual({ message: "Forced error" });
    });
  });
});
