/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { mocksRunner, fetch, waitForServerAndCli } = require("./support/helpers");

describe("web tutorial", () => {
  jest.setTimeout(15000);
  let mocks;

  beforeAll(async () => {
    mocks = mocksRunner(["--files.path=web-tutorial"]);
    await waitForServerAndCli();
  });

  afterAll(async () => {
    await mocks.kill();
  });

  describe("When started", () => {
    it("should have 3 mocks available", async () => {
      expect(mocks.currentScreen).toEqual(expect.stringContaining("Mocks: 3"));
    });

    it("should not display behaviors", async () => {
      expect(mocks.currentScreen).toEqual(expect.not.stringContaining("behaviors"));
    });

    it("should serve users collection mock under the /api/users path", async () => {
      const users = await fetch("/api/users");
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });

    it("should serve user 1 under the /api/users/1 path", async () => {
      const users = await fetch("/api/users/1");
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });

    it("should serve user 1 under the /api/users/2 path", async () => {
      const users = await fetch("/api/users/2");
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });
  });

  describe('When changing current mock to "user-2"', () => {
    it("should display new selected mock", async () => {
      await mocks.pressEnter();
      await mocks.cursorDown();
      const newScreen = await mocks.pressEnter();
      expect(newScreen).toEqual(expect.stringContaining("Current mock: user-2"));
    });

    it("should serve users collection mock under the /api/users path", async () => {
      const users = await fetch("/api/users");
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });

    it("should serve user 2 under the /api/users/1 path", async () => {
      const users = await fetch("/api/users/1");
      expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
    });

    it("should serve user 2 under the /api/users/2 path", async () => {
      const users = await fetch("/api/users/2");
      expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
    });
  });

  describe('When changing current mock to "user-real"', () => {
    it("should display new selected mock", async () => {
      await mocks.pressEnter();
      await mocks.cursorDown(2);
      const newScreen = await mocks.pressEnter();
      expect(newScreen).toEqual(expect.stringContaining("Current mock: user-real"));
    });

    it("should serve users collection mock under the /api/users path", async () => {
      const users = await fetch("/api/users");
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });

    it("should serve user 1 under the /api/users/1 path", async () => {
      const users = await fetch("/api/users/1");
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });

    it("should serve user 2 under the /api/users/2 path", async () => {
      const users = await fetch("/api/users/2");
      expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
    });

    it("should return not found for /api/users/3 path", async () => {
      const usersResponse = await fetch("/api/users/3");
      expect(usersResponse.status).toEqual(404);
    });
  });

  describe("When setting custom route variant", () => {
    it("should display custom route variant", async () => {
      await mocks.cursorDown();
      await mocks.pressEnter();
      await mocks.cursorDown();
      const newScreen = await mocks.pressEnter();
      expect(newScreen).toEqual(
        expect.stringContaining("Current mock: user-real (custom variants: get-user:2)")
      );
    });

    it("should serve users collection mock under the /api/users path", async () => {
      const users = await fetch("/api/users");
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });

    it("should serve user 2 under the /api/users/1 path", async () => {
      const users = await fetch("/api/users/1");
      expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
    });

    it("should serve user 2 under the /api/users/2 path", async () => {
      const users = await fetch("/api/users/2");
      expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
    });

    it("should return user 2 for /api/users/3 path", async () => {
      const users = await fetch("/api/users/3");
      expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
    });
  });

  describe("When restoring route variants", () => {
    it("should display mock", async () => {
      await mocks.cursorDown(2);
      await mocks.pressEnter();
      const newScreen = await mocks.pressEnter();
      expect(newScreen).toEqual(expect.stringContaining("Current mock: user-real"));
    });

    it("should serve users collection mock under the /api/users path", async () => {
      const users = await fetch("/api/users");
      expect(users.body).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });

    it("should serve user 1 under the /api/users/1 path", async () => {
      const users = await fetch("/api/users/1");
      expect(users.body).toEqual({ id: 1, name: "John Doe" });
    });

    it("should serve user 2 under the /api/users/2 path", async () => {
      const users = await fetch("/api/users/2");
      expect(users.body).toEqual({ id: 2, name: "Jane Doe" });
    });

    it("should return not found for /api/users/3 path", async () => {
      const usersResponse = await fetch("/api/users/3");
      expect(usersResponse.status).toEqual(404);
    });
  });
});
