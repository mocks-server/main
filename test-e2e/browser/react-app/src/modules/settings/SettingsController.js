import { connect } from "@data-provider/connector-react";
import { settings } from "mocks-server-admin-api-client";

import SettingsView from "./SettingsView";

const SettingsController = connect(() => ({
  settings: settings.read.getters.value
}))(SettingsView);

export default SettingsController;
