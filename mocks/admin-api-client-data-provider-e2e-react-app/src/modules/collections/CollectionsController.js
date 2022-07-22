import { withData } from "@data-provider/react";
import { collections } from "@mocks-server/admin-api-client-data-provider";

import CollectionsView from "./CollectionsView";

const CollectionsController = withData(collections, "collections")(CollectionsView);

export default CollectionsController;
