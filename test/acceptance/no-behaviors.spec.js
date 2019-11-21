/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { startServer, stopServer, request } = require("./utils");

describe.skip("with no behaviors", () => {
  let server;

  beforeAll(async () => {
    server = await startServer("no-behaviors");
  });

  afterAll(async () => {
    await stopServer(server);
  });

  it("should start server and return 404 to all requests", async () => {
    const usersResponse = await request("/api/users", {
      resolveWithFullResponse: true,
      simple: false
    });
    expect(usersResponse.statusCode).toEqual(404);
  });

  it("should have no behaviors", async () => {
    expect(server.behaviors.count).toEqual(0);
  });
});
