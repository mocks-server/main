import { Selector } from "@data-provider/core";
import { connect } from "@data-provider/connector-react";
import { fixturesModel, fixturesCollection } from "mocks-server-admin-api-client";

import FirstFixtureView from "./FirstFixtureView";

const firstFixture = new Selector(
  fixturesCollection,
  {
    provider: fixturesModel,
    query: (query, prevResults) => {
      return {
        urlParams: {
          id: prevResults[0][0].id
        }
      };
    }
  },
  (fixturesCollectionResults, firstFixtureResult) => {
    return firstFixtureResult;
  }
);

const Controller = connect(() => ({
  fixture: firstFixture.read.getters.value
}))(FirstFixtureView);

export default Controller;
