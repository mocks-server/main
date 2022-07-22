const ALL_HOSTS = "0.0.0.0";
const LOCALHOST = "localhost";

function serverUrl({ host, port }) {
  const hostName = host === ALL_HOSTS ? LOCALHOST : host;
  return `http://${hostName}:${port}`;
}

module.exports = {
  serverUrl,
  ALL_HOSTS,
};
