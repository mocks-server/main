import { Selector } from "@data-provider/core";
import { withData } from "@data-provider/react";
import {
  settings,
  behaviorsModel,
  fixturesModel,
} from "@mocks-server/admin-api-client-data-provider";

import CurrentBehaviorView from "./CurrentBehaviorView";

const currentBehavior = new Selector(
  settings,
  (query, settingsResults) => {
    return behaviorsModel.queries.byName(settingsResults.behavior);
  },
  (query, settingsResults, behaviorResult) => {
    return behaviorResult;
  },
  {
    initialState: {
      data: {},
    },
  }
);

const currentFixture = new Selector(
  currentBehavior,
  (query, currentBehaviorResults) => {
    return fixturesModel.queries.byId(
      currentBehaviorResults.fixtures[currentBehaviorResults.fixtures.length - 1]
    );
  },
  (query, currentBehaviorResult, fixtureResult) => {
    return fixtureResult;
  },
  {
    initialState: {
      data: {},
    },
  }
);

const CurrentBehaviorController = withData(
  currentFixture,
  "fixture"
)(withData(currentBehavior, "behavior")(CurrentBehaviorView));

export default CurrentBehaviorController;
