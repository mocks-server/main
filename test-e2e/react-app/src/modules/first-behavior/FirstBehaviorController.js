import { Selector } from "@data-provider/core";
import { connect } from "@data-provider/connector-react";
import { behaviorsModel, behaviorsCollection } from "mocks-server-admin-api-client";

import FirstBehaviorView from "./FirstBehaviorView";

const firstBehavior = new Selector(
  behaviorsCollection,
  {
    provider: behaviorsModel,
    query: (query, prevResults) => {
      return {
        urlParams: {
          name: prevResults[0][0].name
        }
      };
    }
  },
  (behaviorsCollectionResults, firstBehaviorResult) => {
    return firstBehaviorResult;
  }
);

const Controller = connect(() => ({
  behavior: firstBehavior.read.getters.value
}))(FirstBehaviorView);

export default Controller;
