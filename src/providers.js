import adminApiPaths from "@mocks-server/admin-api-paths";
import { Api } from "@data-provider/axios";

import TAG from "./tag";

export const about = new Api(adminApiPaths.ABOUT, {
  defaultValue: {},
  uuid: "about",
  tags: [TAG]
});

export const settings = new Api(adminApiPaths.SETTINGS, {
  defaultValue: {},
  uuid: "settings",
  updateMethod: "patch",
  tags: [TAG]
});

export const behaviorsCollection = new Api(adminApiPaths.BEHAVIORS, {
  defaultValue: [],
  uuid: "behaviors-collection",
  tags: [TAG]
});

export const behaviorsModel = new Api(`${adminApiPaths.BEHAVIORS}/:name`, {
  defaultValue: {},
  uuid: "behaviors-model",
  tags: [TAG]
});

behaviorsModel.onChangeAny(changeDetails => {
  if (
    [behaviorsModel.actions.delete.success, behaviorsModel.actions.update.success].includes(
      changeDetails.action
    )
  ) {
    behaviorsCollection.clean();
  }
});

export const fixturesCollection = new Api(adminApiPaths.FIXTURES, {
  defaultValue: [],
  uuid: "fixtures-collection",
  tags: [TAG]
});

export const fixturesModel = new Api(`${adminApiPaths.FIXTURES}/:id`, {
  defaultValue: {},
  uuid: "fixtures-model",
  tags: [TAG]
});

fixturesModel.onChangeAny(changeDetails => {
  if (
    [fixturesModel.actions.delete.success, fixturesModel.actions.update.success].includes(
      changeDetails.action
    )
  ) {
    fixturesCollection.clean();
  }
});
