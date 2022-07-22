import {
  CONFIG,
  ABOUT,
  ALERTS,
  COLLECTIONS,
  ROUTES,
  VARIANTS,
  CUSTOM_ROUTE_VARIANTS,
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
  return [collectionOrigin, modelOrigin];
}

export const about = new Axios({
  id: "about",
  url: ABOUT,
  tags: [TAG],
  ...initialState({}),
});

export const config = new Axios({
  id: "config",
  url: CONFIG,
  updateMethod: "patch",
  tags: [TAG],
  ...initialState({}),
});

const alertsOrigins = createRestEntityOrigins({ id: "alerts", baseUrl: ALERTS });
export const alerts = alertsOrigins[0];
export const alert = alertsOrigins[1];

const collectionsOrigins = createRestEntityOrigins({ id: "collections", baseUrl: COLLECTIONS });
export const collections = collectionsOrigins[0];
export const collection = collectionsOrigins[1];

const routesOrigins = createRestEntityOrigins({ id: "routes", baseUrl: ROUTES });
export const routes = routesOrigins[0];
export const route = routesOrigins[1];

const variantsOrigins = createRestEntityOrigins({
  id: "route-variants",
  baseUrl: VARIANTS,
});
export const variants = variantsOrigins[0];
export const variant = variantsOrigins[1];

export const customRouteVariants = createCollectionOrigin({
  id: "custom-routes-variants",
  url: CUSTOM_ROUTE_VARIANTS,
});
