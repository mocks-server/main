import { connect } from "@data-provider/connector-react";
import { behaviors } from "mocks-server-admin-api-client";

import BehaviorsView from "./BehaviorsView";

const BehaviorsController = connect(() => ({
  behaviors: behaviors.read.getters.value
}))(BehaviorsView);

export default BehaviorsController;
