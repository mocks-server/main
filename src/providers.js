import { ABOUT, SETTINGS, BEHAVIORS, FIXTURES } from "@mocks-server/admin-api-paths";
import { Axios } from "@data-provider/axios";

import TAG from "./tag";

const initialState = data => ({
  initialState: {
    data,
    loading: true
  }
});

export const about = new Axios("about", {
  url: ABOUT,
  tags: [TAG],
  ...initialState({})
});

export const settings = new Axios("settings", {
  url: SETTINGS,
  updateMethod: "patch",
  tags: [TAG],
  ...initialState({})
});

export const behaviors = new Axios("behaviors", {
  url: BEHAVIORS,
  tags: [TAG],
  ...initialState([])
});

export const behaviorsModel = new Axios("behaviors-model", {
  url: `${BEHAVIORS}/:name`,
  tags: [TAG],
  ...initialState({})
});

behaviorsModel.addQuery("byName", name => ({
  urlParams: {
    name
  }
}));

export const behavior = name => {
  return behaviorsModel.queries.byName(name);
};

export const fixtures = new Axios("fixtures", {
  url: FIXTURES,
  tags: [TAG],
  ...initialState([])
});

export const fixturesModel = new Axios("fixtures-model", {
  url: `${FIXTURES}/:id`,
  tags: [TAG],
  ...initialState({})
});

fixturesModel.addQuery("byId", id => ({
  urlParams: {
    id
  }
}));

export const fixture = id => {
  return fixturesModel.queries.byId(id);
};
