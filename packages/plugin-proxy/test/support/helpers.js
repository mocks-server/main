const path = require("path");

const deepMerge = require("deepmerge");
const crossFetch = require("cross-fetch");
const waitOn = require("wait-on");

const Core = require("@mocks-server/core");
const Plugin = require("../../index");

const SERVER_PORT = 3100;
const HOST_PORT = 3200;
const HOST_PORT_2 = 3300;

const defaultOptions = {
  server: {
    port: SERVER_PORT,
  },
  files: {
    watch: false,
  },
  log: "silly",
};

const defaultRequestOptions = {
  method: "GET",
  headers: {
    "Content-Type": "application/json",
  },
};

const fixturesFolder = (folderName) => {
  return path.resolve(__dirname, "..", "fixtures", folderName);
};

const createCore = ({ loadPlugin = true } = {}) => {
  return new Core({
    config: {
      readArguments: false,
      readFile: false,
      readEnvironment: false,
    },
    plugins: { register: loadPlugin ? [Plugin] : [] },
  });
};

const startExistingCore = (core, mocksPath, options = {}) => {
  const mocks = mocksPath || "docs-example";
  return core
    .init(
      deepMerge.all([
        defaultOptions,
        {
          files: {
            path: fixturesFolder(mocks),
          },
        },
        options,
      ])
    )
    .then(() => {
      return core.start().then(() => {
        return Promise.resolve(core);
      });
    });
};

const startHost = () => {
  return startExistingCore(createCore({ loadPlugin: false }), "host", {
    server: { port: HOST_PORT },
  });
};

const startHost2 = () => {
  return startExistingCore(createCore({ loadPlugin: false }), "host-2", {
    server: { port: HOST_PORT_2 },
  });
};

const startServer = (mocksPath, options = {}) => {
  return startExistingCore(createCore(), mocksPath, options);
};

const serverUrl = (port) => {
  return `http://127.0.0.1:${port || SERVER_PORT}`;
};

const fetch = (uri, options = {}) => {
  const requestOptions = {
    ...defaultRequestOptions,
    ...options,
  };
  if (requestOptions.body) {
    requestOptions.body = JSON.stringify(requestOptions.body);
  }

  return crossFetch(`${serverUrl(options.port)}${uri}`, {
    ...requestOptions,
  }).then((res) => {
    return res
      .json()
      .then((processedRes) => ({
        body: processedRes,
        status: res.status,
        headers: res.headers,
      }))
      .catch(() => {
        return { status: res.status, headers: res.headers };
      });
  });
};

class TimeCounter {
  constructor() {
    this._startTime = new Date();
  }

  _getMiliseconds() {
    this._miliseconds = this._endTime - this._startTime;
  }

  get total() {
    return this._miliseconds;
  }

  stop() {
    this._endTime = new Date();
    this._getMiliseconds();
  }
}

const wait = (time = 1000) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, time);
  });
};

const waitForServer = (port) => {
  return waitOn({ resources: [`tcp:127.0.0.1:${port || SERVER_PORT}`] });
};

const waitForHost = () => {
  return waitForServer(HOST_PORT);
};

const waitForHost2 = () => {
  return waitForServer(HOST_PORT_2);
};

const waitForServerUrl = (url) => {
  return waitOn({ resources: [`${serverUrl()}${url}`] });
};

const findAlert = (alertContextFragment, alerts) => {
  return alerts.find((alert) => alert.context.includes(alertContextFragment));
};

const findTrace = (traceFragment, traces) => {
  return traces.find((trace) => trace.includes(traceFragment));
};

module.exports = {
  createCore,
  startExistingCore,
  startServer,
  fetch,
  TimeCounter,
  wait,
  waitForServer,
  waitForServerUrl,
  fixturesFolder,
  findAlert,
  findTrace,
  startHost,
  startHost2,
  waitForHost,
  waitForHost2,
};
