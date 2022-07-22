import { withData } from "@data-provider/react";
import { config } from "@mocks-server/admin-api-client-data-provider";

import SettingsView from "./SettingsView";

const SettingsController = withData(config, "config")(SettingsView);

export default SettingsController;
