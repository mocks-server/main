import { withData } from "@data-provider/react";
import { routes } from "@mocks-server/admin-api-client-data-provider";

import RoutesView from "./RoutesView";

const RoutesController = withData(routes, "routes")(RoutesView);

export default RoutesController;
