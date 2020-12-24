/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const routeParser = require("route-parser");
const md5 = require("md5");
const { startCore, stopCore, request, wait } = require("./support/helpers");

const isFunction = (response) => {
  return typeof response === "function";
};

class CustomParser {
  static recognize(fixture) {
    if (
      fixture.at &&
      fixture.with &&
      fixture.send &&
      (isFunction(fixture.send) || fixture.send.status)
    ) {
      return true;
    }
    return false;
  }

  static get displayName() {
    return "custom-parser-fixture";
  }

  constructor(fixture, core) {
    this._core = core;
    this._with = fixture.with;
    this._at = fixture.at;
    this._send = fixture.send;
    this._atRoute = routeParser(fixture.at);
    this._id = fixture.id || this._getId();
    this._matchId = this._getMatchId();
  }

  _getMatchId() {
    return md5(`${this._with}-${this._at}`);
  }

  _getId() {
    return md5(
      `${this._with}-${this._at}-${
        isFunction(this._send) ? this._send.toString() : JSON.stringify(this._send)
      }`
    );
  }

  requestMatch(req) {
    return req.method === this._with && this._atRoute.match(req.url);
  }

  handleRequest(req, res, next) {
    if (isFunction(this._send)) {
      this._core.tracer.debug(
        `CUSTOM PARSER: Fixture ${this.id} response is a function, executing response | req: ${req.id}`
      );
      req.params = this._atRoute.match(req.url);
      this._send(req, res, next);
    } else {
      this._core.tracer.debug(`CUSTOM PARSER: Sending fixture ${this.id} | req: ${req.id}`);
      res.status(this._send.status);
      res.send(this._send.body);
    }
  }

  get matchId() {
    return this._matchId;
  }

  get id() {
    return this._id;
  }
}

describe("when using a custom fixtures handler", () => {
  const plugin = {
    register: (serverCore) => {
      serverCore.addFixturesHandler(CustomParser);
    },
  };
  let core;

  describe("number of behaviors and fixtures", () => {
    beforeAll(async () => {
      core = await startCore("custom-parser", {
        plugins: [plugin],
      });
    });

    afterAll(async () => {
      await stopCore(core);
    });

    it("should have three behaviors", async () => {
      expect(core.behaviors.count).toEqual(3);
    });

    it("should have four fixtures", async () => {
      expect(core.fixtures.count).toEqual(4);
    });
  });

  describe('When started with "standard" behavior', () => {
    beforeAll(async () => {
      core = await startCore("custom-parser", {
        behavior: "standard",
        plugins: [plugin],
      });
    });

    afterAll(async () => {
      await stopCore(core);
    });

    it("should serve users collection mock under the /api/users path", async () => {
      const users = await request("/api/users");
      expect(users).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });

    it("should serve user 1 under the /api/users/1 path", async () => {
      const users = await request("/api/users/1");
      expect(users).toEqual({ id: 1, name: "John Doe" });
    });

    it("should serve user 1 under the /api/users/2 path", async () => {
      const users = await request("/api/users/2");
      expect(users).toEqual({ id: 1, name: "John Doe" });
    });
  });

  describe('When started with "user2" behavior', () => {
    beforeAll(async () => {
      core = await startCore("custom-parser", {
        behavior: "user2",
        plugins: [plugin],
      });
    });

    afterAll(async () => {
      await stopCore(core);
    });

    it("should serve users collection mock under the /api/users path", async () => {
      const users = await request("/api/users");
      expect(users).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });

    it("should serve user 2 under the /api/users/1 path", async () => {
      const users = await request("/api/users/1");
      expect(users).toEqual({ id: 2, name: "Jane Doe" });
    });

    it("should serve user 2 under the /api/users/2 path", async () => {
      const users = await request("/api/users/2");
      expect(users).toEqual({ id: 2, name: "Jane Doe" });
    });
  });

  describe('When started with "dynamic" behavior', () => {
    beforeAll(async () => {
      core = await startCore("custom-parser", {
        behavior: "dynamic",
        plugins: [plugin],
      });
      await wait();
    });

    afterAll(async () => {
      await stopCore(core);
    });

    it("should serve users collection mock under the /api/users path", async () => {
      const users = await request("/api/users");
      expect(users).toEqual([
        { id: 1, name: "John Doe" },
        { id: 2, name: "Jane Doe" },
      ]);
    });

    it("should serve user 1 under the /api/users/1 path", async () => {
      const users = await request("/api/users/1");
      expect(users).toEqual({ id: 1, name: "John Doe" });
    });

    it("should serve user 2 under the /api/users/2 path", async () => {
      const users = await request("/api/users/2");
      expect(users).toEqual({ id: 2, name: "Jane Doe" });
    });

    it("should return not found for /api/users/3 path", async () => {
      const usersResponse = await request("/api/users/3", {
        resolveWithFullResponse: true,
        simple: false,
      });
      expect(usersResponse.statusCode).toEqual(404);
    });
  });
});
