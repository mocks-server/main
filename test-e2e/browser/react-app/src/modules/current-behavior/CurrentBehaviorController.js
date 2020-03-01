import { Selector } from "@data-provider/core";
import { withData } from "@data-provider/react";
import {
  settings,
  behaviorsModel,
  fixturesModel
} from "@mocks-server/admin-api-client-data-provider";

import CurrentBehaviorView from "./CurrentBehaviorView";

const currentBehavior = new Selector(
  settings,
  (query, prevResults) => {
    return behaviorsModel.queries.byName(prevResults[0].behavior);
  },
  (settingsResults, behaviorResult) => {
    return behaviorResult;
  },
  {
    initialState: {
      data: {}
    }
  }
);

const currentFixture = new Selector(
  currentBehavior,
  (query, prevResults) => {
    return fixturesModel.queries.byId(prevResults[0].fixtures[prevResults[0].fixtures.length - 1]);
  },
  (currentBehaviorResult, fixtureResult) => {
    return fixtureResult;
  },
  {
    initialState: {
      data: {}
    }
  }
);

const CurrentBehaviorController = withData(
  currentFixture,
  "fixture"
)(withData(currentBehavior, "behavior")(CurrentBehaviorView));

export default CurrentBehaviorController;
