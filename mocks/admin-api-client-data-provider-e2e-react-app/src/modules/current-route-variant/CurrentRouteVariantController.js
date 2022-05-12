import { Selector } from "@data-provider/core";
import { withData } from "@data-provider/react";
import {
  settings,
  mocksModel,
  mocks,
  routesVariantsModel,
} from "@mocks-server/admin-api-client-data-provider";

import CurrentRouteVariantView from "./CurrentRouteVariantView";

const currentMock = new Selector(
  settings,
  mocks,
  (_query, settingsResults, mocksResults) => {
    return mocksModel.queries.byId(settingsResults.mocks.selected || mocksResults[0].id);
  },
  {
    initialState: {
      data: {},
    },
  }
);

const currentRouteVariant = new Selector(
  currentMock,
  (_query, mockResults) => {
    return routesVariantsModel.queries.byId(mockResults.routesVariants[0]);
  },
  {
    initialState: {
      data: {},
    },
  }
);

const CurrentRouteVariantController = withData(
  currentRouteVariant,
  "routeVariant"
)(withData(currentMock, "mock")(CurrentRouteVariantView));

export default CurrentRouteVariantController;
