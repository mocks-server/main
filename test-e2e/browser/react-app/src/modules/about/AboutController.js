import { connect } from "@data-provider/connector-react";
import { about } from "mocks-server-admin-api-client";

import AboutView from "./AboutView";

const AboutController = connect(() => ({
  about: about.read.getters.value
}))(AboutView);

export default AboutController;
