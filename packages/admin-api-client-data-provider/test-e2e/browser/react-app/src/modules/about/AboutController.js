import { withData } from "@data-provider/react";
import { about } from "@mocks-server/admin-api-client-data-provider";

import AboutView from "./AboutView";

const AboutController = withData(about, "about")(AboutView);

export default AboutController;
