import path from "path";

import { Core } from "@mocks-server/core";
import crossFetch from "cross-fetch";
import deepMerge from "deepmerge";
import waitOn from "wait-on";

import { Plugin } from "../../src/index";

const DEFAULT_SERVER_PORT = 3100;

const defaultOptions = {
  server: {
    port: DEFAULT_SERVER_PORT,
  },
  log: "silent",
  files: {
    watch: false,
  },
  config: {
    allowUnknownArguments: true,
    readFile: false,
    readArguments: false,
    readEnvironment: false,
  },
  plugins: {
    register: [Plugin],
  },
};

export const defaultRequestOptions = {
  method: "get",
  headers: {
    "Content-Type": "application/json",
  },
};

export const FIXTURES_PATH = path.resolve(__dirname, "..", "fixtures");

export function fixturesPath(folderName) {
  return path.resolve(FIXTURES_PATH, folderName);
}

export function createCore(options) {
  return new Core(deepMerge.all([defaultOptions, options]));
}

export function serverUrl(port, protocol) {
  const protocolToUse = protocol || "http";
  return `${protocolToUse}://127.0.0.1:${port || DEFAULT_SERVER_PORT}`;
}

export async function startServer(fixturePath, options = {}) {
  const core = createCore(
    deepMerge.all([
      {
        files: {
          path: fixturesPath(fixturePath),
        },
      },
      options,
    ])
  );
  await core.start();
  return core;
}

export function doFetch(uri, options = {}) {
  const requestOptions = {
    ...defaultRequestOptions,
    ...options,
  };
  if (requestOptions.body) {
    requestOptions.body = JSON.stringify(requestOptions.body);
  }

  return crossFetch(`${serverUrl(options.port, options.protocol)}${uri}`, {
    ...requestOptions,
  }).then((res) => {
    return res[options.parser]()
      .then((processedRes) => ({
        body: processedRes,
        status: res.status,
        headers: res.headers,
        url: res.url,
      }))
      .catch(() => {
        return { status: res.status, headers: res.headers, url: res.url };
      });
  });
}

export function doServerFetch(uri, options = {}) {
  return doFetch(uri, {
    port: DEFAULT_SERVER_PORT,
    ...options,
  });
}

export function fetchJson(uri, options = {}) {
  return doServerFetch(uri, {
    parser: "json",
    ...options,
  });
}

export function fetchText(uri, options = {}) {
  return doServerFetch(uri, {
    parser: "text",
    ...options,
  });
}

export function waitForServer(port) {
  return waitOn({ resources: [`tcp:127.0.0.1:${port || DEFAULT_SERVER_PORT}`] });
}

export function waitForServerUrl(url, options = {}) {
  return waitOn({ resources: [`${serverUrl(options.port, options.protocol)}${url}`] });
}
