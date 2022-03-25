import { withData } from "@data-provider/react";
import { settings } from "@mocks-server/admin-api-client-data-provider";

import SettingsView from "./SettingsView";

const SettingsController = withData(settings, "settings")(SettingsView);

export default SettingsController;
