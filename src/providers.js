import { ABOUT, SETTINGS, BEHAVIORS, FIXTURES } from "@mocks-server/admin-api-paths";
import { Api } from "@data-provider/axios";

import TAG from "./tag";

export const about = new Api(ABOUT, {
  defaultValue: {},
  uuid: "about",
  tags: [TAG]
});

export const settings = new Api(SETTINGS, {
  defaultValue: {},
  uuid: "settings",
  updateMethod: "patch",
  tags: [TAG]
});

export const behaviorsCollection = new Api(BEHAVIORS, {
  defaultValue: [],
  uuid: "behaviors-collection",
  tags: [TAG]
});

export const behaviorsModel = new Api(`${BEHAVIORS}/:name`, {
  defaultValue: {},
  uuid: "behaviors-model",
  tags: [TAG]
});

behaviorsModel.addCustomQuery({
  findByName: name => ({
    urlParams: {
      name
    }
  })
});

export const fixturesCollection = new Api(FIXTURES, {
  defaultValue: [],
  uuid: "fixtures-collection",
  tags: [TAG]
});

export const fixturesModel = new Api(`${FIXTURES}/:id`, {
  defaultValue: {},
  uuid: "fixtures-model",
  tags: [TAG]
});

fixturesModel.addCustomQuery({
  findById: id => ({
    urlParams: {
      id
    }
  })
});
