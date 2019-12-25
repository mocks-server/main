import { connect } from "@data-provider/connector-react";
import { fixtures } from "mocks-server-admin-api-client";

import FixturesView from "./FixturesView";

const FixturesController = connect(() => ({
  fixtures: fixtures.read.getters.value
}))(FixturesView);

export default FixturesController;
