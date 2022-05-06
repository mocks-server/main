/*
Copyright 2021 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const { mocksRunner, fetch, waitForServer } = require("./support/helpers");

describe("port command line argument", () => {
  let cli;

  beforeAll(async () => {
    cli = mocksRunner(["--plugins.filesLoader.path=web-tutorial", "--server.port=3005"]);
    await waitForServer(3005);
  });

  afterAll(async () => {
    await cli.kill();
  });

  it("should set server port", async () => {
    const users = await fetch("/api/users", {
      port: 3005,
    });
    expect(users.body).toEqual([
      { id: 1, name: "John Doe" },
      { id: 2, name: "Jane Doe" },
    ]);
  });
});
