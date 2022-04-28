import {
  SETTINGS,
  ABOUT,
  ALERTS,
  MOCKS,
  ROUTES,
  ROUTES_VARIANTS,
  MOCK_CUSTOM_ROUTES_VARIANTS,
} from "@mocks-server/admin-api-paths";
import { Axios } from "@data-provider/axios";

import TAG from "./tag";

function getModelMethod(methodName) {
  return methodName || "byId";
}

function getModelParam(param) {
  return param || "id";
}

function addModelQuery(model, methodName, modelGetterParam) {
  const method = getModelMethod(methodName);
  const param = getModelParam(modelGetterParam);
  model.addQuery(method, (paramValue) => ({
    urlParams: {
      [param]: paramValue,
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

function createCollectionOrigin({ id, url }) {
  return new Axios({
    id,
    url: url,
    tags: [TAG],
    ...initialState([]),
  });
}

function createModelOrigin({ id, baseUrl, modelId }) {
  const modelUrlId = modelId || ":id";
  return new Axios({
    id: `${id}-model`,
    url: `${baseUrl}/${modelUrlId}`,
    tags: [TAG],
    ...initialState({}),
  });
}

function modelGetter(modelOrigin, methodName) {
  const method = getModelMethod(methodName);
  return (modelId) => {
    return modelOrigin.queries[method](modelId);
  };
}

function createRestEntityOrigins({ id, baseUrl, modelId, modelGetterMethod, modelGetterParam }) {
  const collectionOrigin = createCollectionOrigin({
    id,
    url: baseUrl,
  });

  const modelOrigin = createModelOrigin({
    id,
    baseUrl,
    modelId,
  });

  addModelQuery(modelOrigin, modelGetterMethod, modelGetterParam);
  return [collectionOrigin, modelOrigin, modelGetter(modelOrigin, modelGetterMethod)];
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

export const customRoutesVariants = createCollectionOrigin({
  id: "custom-routes-variants",
  url: MOCK_CUSTOM_ROUTES_VARIANTS,
});
