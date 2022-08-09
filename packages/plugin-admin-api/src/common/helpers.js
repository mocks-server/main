const fs = require("fs");

const ALL_HOSTS = "0.0.0.0";
const LOCALHOST = "localhost";
const HTTPS_PROTOCOL = "https";
const HTTP_PROTOCOL = "http";

function serverUrl({ host, port, protocol }) {
  const hostName = host === ALL_HOSTS ? LOCALHOST : host;
  return `${protocol}://${hostName}:${port}`;
}

function readFileSync(filePath) {
  return fs.readFileSync(filePath, "utf-8");
}

module.exports = {
  serverUrl,
  readFileSync,
  ALL_HOSTS,
  LOCALHOST,
  HTTPS_PROTOCOL,
  HTTP_PROTOCOL,
};
