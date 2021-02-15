import fetch from "cross-fetch";

import {
  DEFAULT_BASE_PATH,
  SETTINGS,
  ABOUT,
  ALERTS,
  /* MOCKS,
  ROUTES,
  ROUTES_VARIANTS,
  MOCK_CUSTOM_ROUTES_VARIANTS, */
  LEGACY,
  BEHAVIORS,
  FIXTURES,
} from "@mocks-server/admin-api-paths";

const DEFAULT_OPTIONS = {
  apiPath: DEFAULT_BASE_PATH,
  baseUrl: "http://localhost:3100",
};

let configuration = {
  ...DEFAULT_OPTIONS,
};

export const config = (options) => {
  configuration = {
    ...configuration,
    ...options,
  };
};

class Fetcher {
  constructor(url, id) {
    this._url = url;
    this._id = id ? `/${encodeURIComponent(id)}` : "";
  }

  get url() {
    return `${configuration.baseUrl}${configuration.apiPath}${this._url}${this._id}`;
  }

  _read() {
    return fetch(this.url).then((res) => res.json());
  }

  _patch(data) {
    return fetch(this.url, {
      method: "PATCH",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  read() {
    return this._read();
  }

  update(data) {
    return this._patch(data);
  }
}

export const about = new Fetcher(ABOUT);

export const settings = new Fetcher(SETTINGS);

export const behaviors = new Fetcher(`${LEGACY}/${BEHAVIORS}`);

export const behavior = (name) => {
  return new Fetcher(`${LEGACY}/${BEHAVIORS}`, name);
};

export const fixtures = new Fetcher(`${LEGACY}/${FIXTURES}`);

export const fixture = (id) => {
  return new Fetcher(`${LEGACY}/${FIXTURES}`, id);
};

export const alerts = new Fetcher(ALERTS);

export const alert = (id) => {
  return new Fetcher(ALERTS, id);
};
