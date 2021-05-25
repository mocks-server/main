import {
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
import { Axios } from "@data-provider/axios";

import TAG from "./tag";

function addByIdQuery(model) {
  model.addQuery("byId", (id) => ({
    urlParams: {
      id,
    },
  }));
}

const initialState = (data) => ({
  initialState: {
    data,
    loading: true,
  },
});

export const about = new Axios({
  id: "about",
  url: ABOUT,
  tags: [TAG],
  ...initialState({}),
});

export const settings = new Axios({
  id: "settings",
  url: SETTINGS,
  updateMethod: "patch",
  tags: [TAG],
  ...initialState({}),
});

export const alerts = new Axios({
  id: "alerts",
  url: ALERTS,
  tags: [TAG],
  ...initialState([]),
});

export const alertsModel = new Axios({
  id: "alerts-model",
  url: `${ALERTS}/:id`,
  tags: [TAG],
  ...initialState({}),
});

addByIdQuery(alertsModel);

export const alert = (id) => {
  return alertsModel.queries.byId(id);
};

// Legacy methods

export const behaviors = new Axios({
  id: "behaviors",
  url: `${LEGACY}/${BEHAVIORS}`,
  tags: [TAG],
  ...initialState([]),
});

export const behaviorsModel = new Axios({
  id: "behaviors-model",
  url: `${LEGACY}/${BEHAVIORS}/:name`,
  tags: [TAG],
  ...initialState({}),
});

behaviorsModel.addQuery("byName", (name) => ({
  urlParams: {
    name,
  },
}));

export const behavior = (name) => {
  return behaviorsModel.queries.byName(name);
};

export const fixtures = new Axios({
  id: "fixtures",
  url: `${LEGACY}/${FIXTURES}`,
  tags: [TAG],
  ...initialState([]),
});

export const fixturesModel = new Axios({
  id: "fixtures-model",
  url: `${LEGACY}/${FIXTURES}/:id`,
  tags: [TAG],
  ...initialState({}),
});

addByIdQuery(fixturesModel);

export const fixture = (id) => {
  return fixturesModel.queries.byId(id);
};
