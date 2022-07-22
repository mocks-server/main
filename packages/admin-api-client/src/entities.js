import crossFetch from "cross-fetch";

import {
  BASE_PATH,
  CONFIG,
  ABOUT,
  ALERTS,
  COLLECTIONS,
  ROUTES,
  VARIANTS,
  CUSTOM_ROUTE_VARIANTS,
} from "@mocks-server/admin-api-paths";

const DEFAULT_OPTIONS = {
  port: 3110,
  host: "127.0.0.1",
};

let clientConfiguration = {
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

export function configClient(options) {
  clientConfiguration = {
    ...clientConfiguration,
    ...options,
  };
}

class Fetcher {
  constructor(url, id) {
    this._url = url;
    this._id = id ? `/${encodeURIComponent(id)}` : "";
  }

  get url() {
    return `http://${clientConfiguration.host}:${clientConfiguration.port}${BASE_PATH}${this._url}${this._id}`;
  }

  _read() {
    return crossFetch(this.url).then(handleResponse);
  }

  _patch(data) {
    return crossFetch(this.url, {
      method: "PATCH",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    }).then(handleResponse);
  }

  _delete() {
    return crossFetch(this.url, {
      method: "DELETE",
    }).then(handleResponse);
  }

  _create(data) {
    return crossFetch(this.url, {
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

export const config = new Fetcher(CONFIG);

export const alerts = new Fetcher(ALERTS);

export const alert = (id) => {
  return new Fetcher(ALERTS, id);
};

export const collections = new Fetcher(COLLECTIONS);

export const collection = (id) => {
  return new Fetcher(COLLECTIONS, id);
};

export const routes = new Fetcher(ROUTES);

export const route = (id) => {
  return new Fetcher(ROUTES, id);
};

export const variants = new Fetcher(VARIANTS);

export const variant = (id) => {
  return new Fetcher(VARIANTS, id);
};

export const customRouteVariants = new Fetcher(CUSTOM_ROUTE_VARIANTS);
