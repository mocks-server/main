import { connect } from "@data-provider/connector-react";
import { fixturesCollection } from "mocks-server-admin-api-client";

import FixturesView from "./FixturesView";

const Controller = connect(() => ({
  fixtures: fixturesCollection.read.getters.value
}))(FixturesView);

export default Controller;
