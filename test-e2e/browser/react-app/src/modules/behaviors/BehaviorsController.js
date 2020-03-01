import { withData } from "@data-provider/react";
import { behaviors } from "@mocks-server/admin-api-client-data-provider";

import BehaviorsView from "./BehaviorsView";

const BehaviorsController = withData(behaviors, "behaviors")(BehaviorsView);

export default BehaviorsController;
