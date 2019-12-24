import { connect } from "@data-provider/connector-react";
import { settings } from "mocks-server-admin-api-client";

import SettingsView from "./SettingsView";

const Controller = connect(() => ({
  settings: settings.read.getters.value
}))(SettingsView);

export default Controller;
