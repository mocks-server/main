import sinon from "sinon";
import { providers } from "@data-provider/core";
import { BASE_PATH } from "@mocks-server/admin-api-paths";

import { configClient } from "../../src/config";
import TAG from "../../src/tag";

describe("configClient method", () => {
  const PORT = 3002;
  const HOST = "foo-host";

  let sandbox;
  beforeAll(() => {
    sandbox = sinon.createSandbox();
    sandbox.spy(providers.getByTag(TAG), "config");
  });

  afterAll(() => {
    sandbox.restore();
  });

  it("should set baseUrl in admin-api-client tagged providers", () => {
    configClient({
      host: HOST,
      port: PORT,
    });
    expect(providers.getByTag(TAG).config.getCall(0).args[0].baseUrl).toEqual(
      `http://${HOST}:${PORT}${BASE_PATH}`
    );
  });
});
