/*
Copyright 2022 Javier Brea

Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.
*/

const {
  mocksRunner,
  doFetch,
  waitForServer,
  removeConfigFile,
  removeCertFiles,
  wait,
} = require("./support/helpers");
const https = require("https");

const httpsAgent = new https.Agent({
  rejectUnauthorized: false,
});

describe("https option", () => {
  let cli;

  beforeAll(async () => {
    const generateCerts = mocksRunner(
      [
        "req",
        "-newkey",
        "rsa:4096",
        "-days",
        "1",
        "-nodes",
        "-x509",
        "-subj",
        "/C=US/ST=Denial/L=Springfield/O=Dis/CN=localhost",
        "-keyout",
        "localhost.key",
        "-out",
        "localhost.cert",
      ],
      {
        customBinary: "openssl",
      }
    );
    await generateCerts.hasExited();
    cli = mocksRunner([
      "--files.path=web-tutorial",
      "--server.https.enabled",
      "--server.https.cert=localhost.cert",
      "--server.https.key=localhost.key",
    ]);
    await waitForServer();
  });

  afterAll(async () => {
    removeConfigFile();
    removeCertFiles();
    await cli.kill();
    await wait(6000);
  });

  it("should set server protocol", async () => {
    const users = await doFetch("/api/users", {
      agent: httpsAgent,
      protocol: "https",
    });
    expect(users.body).toEqual([
      { id: 1, name: "John Doe" },
      { id: 2, name: "Jane Doe" },
    ]);
  });
});
