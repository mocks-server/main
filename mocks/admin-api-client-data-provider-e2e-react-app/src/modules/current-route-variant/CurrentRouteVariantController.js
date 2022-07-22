import { Selector } from "@data-provider/core";
import { withData } from "@data-provider/react";
import {
  config,
  collection,
  collections,
  variant,
} from "@mocks-server/admin-api-client-data-provider";

import CurrentRouteVariantView from "./CurrentRouteVariantView";

const currentCollection = new Selector(
  config,
  collections,
  (_query, configResults, collectionsResults) => {
    return collection.queries.byId(
      configResults.mock.collections.selected || collectionsResults[0].id
    );
  },
  {
    initialState: {
      data: {},
    },
  }
);

const currentRouteVariant = new Selector(
  currentCollection,
  (_query, mockResults) => {
    return variant.queries.byId(mockResults.routes[0]);
  },
  {
    initialState: {
      data: {},
    },
  }
);

const CurrentRouteVariantController = withData(
  currentRouteVariant,
  "variant"
)(withData(currentCollection, "collection")(CurrentRouteVariantView));

export default CurrentRouteVariantController;
