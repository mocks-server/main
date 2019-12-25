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

export const behaviors = new Api(BEHAVIORS, {
  defaultValue: [],
  uuid: "behaviors",
  tags: [TAG]
});

export const behaviorsModel = new Api(`${BEHAVIORS}/:name`, {
  defaultValue: {},
  uuid: "behaviors-model",
  tags: [TAG]
});

behaviorsModel.addCustomQuery({
  byName: name => ({
    urlParams: {
      name
    }
  })
});

export const behavior = name => {
  return behaviorsModel.byName(name);
};

export const fixtures = new Api(FIXTURES, {
  defaultValue: [],
  uuid: "fixtures",
  tags: [TAG]
});

export const fixturesModel = new Api(`${FIXTURES}/:id`, {
  defaultValue: {},
  uuid: "fixtures-model",
  tags: [TAG]
});

fixturesModel.addCustomQuery({
  byId: id => ({
    urlParams: {
      id
    }
  })
});

export const fixture = id => {
  return fixturesModel.byId(id);
};
