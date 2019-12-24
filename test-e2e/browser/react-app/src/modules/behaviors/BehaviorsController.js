import { connect } from "@data-provider/connector-react";
import { behaviorsCollection } from "mocks-server-admin-api-client";

import BehaviorsView from "./BehaviorsView";

const BehaviorsController = connect(() => ({
  behaviors: behaviorsCollection.read.getters.value
}))(BehaviorsView);

export default BehaviorsController;
