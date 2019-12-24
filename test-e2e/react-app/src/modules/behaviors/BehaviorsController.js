import { connect } from "@data-provider/connector-react";
import { behaviorsCollection } from "mocks-server-admin-api-client";

import BehaviorsView from "./BehaviorsView";

const Controller = connect(() => ({
  behaviors: behaviorsCollection.read.getters.value
}))(BehaviorsView);

export default Controller;
