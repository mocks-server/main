import { Selector } from "@data-provider/core";
import { connect } from "@data-provider/connector-react";
import { settings, behaviorsModel, fixturesModel } from "mocks-server-admin-api-client";

import CurrentBehaviorView from "./CurrentBehaviorView";

const currentBehavior = new Selector(
  settings,
  {
    provider: behaviorsModel,
    query: (query, prevResults) => {
      return behaviorsModel.customQueries.byName(prevResults[0].behavior);
    }
  },
  (settingsResults, behaviorResult) => {
    return behaviorResult;
  },
  {
    defaultValue: {}
  }
);

const currentFixture = new Selector(
  currentBehavior,
  {
    provider: fixturesModel,
    query: (query, prevResults) => {
      return fixturesModel.customQueries.byId(
        prevResults[0].fixtures[prevResults[0].fixtures.length - 1]
      );
    }
  },
  (currentBehaviorResult, fixtureResult) => {
    return fixtureResult;
  },
  {
    defaultValue: {}
  }
);

const CurrentBehaviorController = connect(() => ({
  behavior: currentBehavior.read.getters.value,
  fixture: currentFixture.read.getters.value
}))(CurrentBehaviorView);

export default CurrentBehaviorController;
