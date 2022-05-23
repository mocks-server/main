import { withData } from "@data-provider/react";
import { mocks } from "@mocks-server/admin-api-client-data-provider";

import MocksView from "./MocksView";

const MocksController = withData(mocks, "mocks")(MocksView);

export default MocksController;
