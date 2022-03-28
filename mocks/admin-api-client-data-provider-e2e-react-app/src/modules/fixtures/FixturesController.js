import { withData } from "@data-provider/react";
import { fixtures } from "@mocks-server/admin-api-client-data-provider";

import FixturesView from "./FixturesView";

const FixturesController = withData(fixtures, "fixtures")(FixturesView);

export default FixturesController;
