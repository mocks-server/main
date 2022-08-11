const path = require("path");

const CliRunner = require("@mocks-server/cli-runner");

async function generateCerts() {
  const runner = new CliRunner(
    [
      "openssl",
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
      cwd: path.resolve(__dirname, ".."),
    }
  );
  await runner.hasExited();
}

generateCerts();
