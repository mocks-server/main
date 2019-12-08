/*
Copyright 2019 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const path = require("path");
const fsExtra = require("fs-extra");
const { CliRunner, request, fixturesFolder, wait } = require("./utils");

describe("with no path defined", () => {
  const binaryPath = "./starter";
  const cwdPath = path.resolve(__dirname, "fixtures");
  let cli;

  beforeAll(async () => {
    cli = new CliRunner([binaryPath, "--log=silly"], {
      cwd: cwdPath
    });
    await wait();
  });

  afterAll(async () => {
    await cli.kill();
  });

  it("should start server and return 404 to all requests", async () => {
    console.log(cli.logs);
    const usersResponse = await request("/api/users", {
      resolveWithFullResponse: true,
      simple: false
    });
    console.log(cli.logs);
    expect(usersResponse.statusCode).toEqual(404);
  });

  it("should have created a mocks folder", async () => {
    expect(fsExtra.existsSync(fixturesFolder("mocks"))).toEqual(true);
  });
});
