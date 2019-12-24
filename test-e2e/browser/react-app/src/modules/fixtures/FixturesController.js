import { connect } from "@data-provider/connector-react";
import { fixturesCollection } from "mocks-server-admin-api-client";

import FixturesView from "./FixturesView";

const FixturesController = connect(() => ({
  fixtures: fixturesCollection.read.getters.value
}))(FixturesView);

export default FixturesController;
