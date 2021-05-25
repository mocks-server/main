import {
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
import { Axios } from "@data-provider/axios";

import TAG from "./tag";

function addByIdQuery(model) {
  model.addQuery("byId", (id) => ({
    urlParams: {
      id,
    },
  }));
}

function initialState(data) {
  return {
    initialState: {
      data,
      loading: true,
    },
  };
}

function createRestEntityOrigins({ id, baseUrl }) {
  const collectionOrigin = new Axios({
    id,
    url: baseUrl,
    tags: [TAG],
    ...initialState([]),
  });

  const modelOrigin = new Axios({
    id: `${id}-model`,
    url: `${baseUrl}/:id`,
    tags: [TAG],
    ...initialState({}),
  });

  addByIdQuery(modelOrigin);

  const modelGetter = (modelId) => {
    return modelOrigin.queries.byId(modelId);
  };

  return [collectionOrigin, modelOrigin, modelGetter];
}

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

const alertsOrigins = createRestEntityOrigins({ id: "alerts", baseUrl: ALERTS });
export const alerts = alertsOrigins[0];
export const alertsModel = alertsOrigins[1];
export const alert = alertsOrigins[2];

const mocksOrigins = createRestEntityOrigins({ id: "mocks", baseUrl: MOCKS });
export const mocks = mocksOrigins[0];
export const mocksModel = mocksOrigins[1];
export const mock = mocksOrigins[2];

const routesOrigins = createRestEntityOrigins({ id: "routes", baseUrl: ROUTES });
export const routes = routesOrigins[0];
export const routesModel = routesOrigins[1];
export const route = routesOrigins[2];

const routesVariantsOrigins = createRestEntityOrigins({
  id: "routes-variants",
  baseUrl: ROUTES_VARIANTS,
});
export const routesVariants = routesVariantsOrigins[0];
export const routesVariantsModel = routesVariantsOrigins[1];
export const routeVariant = routesVariantsOrigins[2];

const customRoutesVariantsOrigins = createRestEntityOrigins({
  id: "custom-routes-variants",
  baseUrl: MOCK_CUSTOM_ROUTES_VARIANTS,
});
export const customRoutesVariants = customRoutesVariantsOrigins[0];

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
