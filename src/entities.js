import fetch from "cross-fetch";

import {
  DEFAULT_BASE_PATH,
  SETTINGS,
  ABOUT,
  ALERTS,
  MOCKS,
  ROUTES,
  ROUTES_VARIANTS,
  MOCK_CUSTOM_ROUTES_VARIANTS,
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

function handleResponse(res) {
  if (res.status > 199 && res.status < 300) {
    return res.json().catch(() => Promise.resolve());
  }
  return res.json().then((data) => {
    return Promise.reject(new Error(data.message));
  });
}

export function config(options) {
  configuration = {
    ...configuration,
    ...options,
  };
}

class Fetcher {
  constructor(url, id) {
    this._url = url;
    this._id = id ? `/${encodeURIComponent(id)}` : "";
  }

  get url() {
    return `${configuration.baseUrl}${configuration.apiPath}${this._url}${this._id}`;
  }

  _read() {
    return fetch(this.url).then(handleResponse);
  }

  _patch(data) {
    return fetch(this.url, {
      method: "PATCH",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    }).then(handleResponse);
  }

  _delete() {
    return fetch(this.url, {
      method: "DELETE",
    }).then(handleResponse);
  }

  _create(data) {
    return fetch(this.url, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    }).then(handleResponse);
  }

  read() {
    return this._read();
  }

  update(data) {
    return this._patch(data);
  }

  delete() {
    return this._delete();
  }

  create(data) {
    return this._create(data);
  }
}

export const about = new Fetcher(ABOUT);

export const settings = new Fetcher(SETTINGS);

export const alerts = new Fetcher(ALERTS);

export const alert = (id) => {
  return new Fetcher(ALERTS, id);
};

export const mocks = new Fetcher(MOCKS);

export const mock = (id) => {
  return new Fetcher(MOCKS, id);
};

export const routes = new Fetcher(ROUTES);

export const route = (id) => {
  return new Fetcher(ROUTES, id);
};

export const routesVariants = new Fetcher(ROUTES_VARIANTS);

export const routeVariant = (id) => {
  return new Fetcher(ROUTES_VARIANTS, id);
};

export const mockCustomRoutesVariants = new Fetcher(MOCK_CUSTOM_ROUTES_VARIANTS);

// legacy methods

export const behaviors = new Fetcher(`${LEGACY}/${BEHAVIORS}`);

export const behavior = (name) => {
  return new Fetcher(`${LEGACY}/${BEHAVIORS}`, name);
};

export const fixtures = new Fetcher(`${LEGACY}/${FIXTURES}`);

export const fixture = (id) => {
  return new Fetcher(`${LEGACY}/${FIXTURES}`, id);
};
