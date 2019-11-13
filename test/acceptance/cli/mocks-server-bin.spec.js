/*
Copyright 2019 Javier Brea
Copyright 2019 XbyOrange

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const path = require("path");

const { CliRunner } = require("../../utils");

describe("when mocks-server binary is executed", () => {
  const binFile = path.resolve(__dirname, "..", "..", "..", "bin", "mocks-server");
  let cliRunner;

  it("should throw a controlled error if no behaviors folder is provided", async () => {
    cliRunner = new CliRunner([binFile]);
    await cliRunner.hasExit();
    expect(await cliRunner.logs).toEqual(
      expect.stringContaining("Please provide a path to a folder containing behaviors")
    );
  });
});
