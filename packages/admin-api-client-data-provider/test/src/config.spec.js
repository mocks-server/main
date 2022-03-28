import sinon from "sinon";
import { providers } from "@data-provider/core";
import { DEFAULT_BASE_PATH } from "@mocks-server/admin-api-paths";

import { config } from "../../src/config";
import TAG from "../../src/tag";

describe("config method", () => {
  const BASE_URL = "http://127.0.0.1:3001";
  const API_PATH = "/foo-admin";

  let sandbox;
  beforeAll(() => {
    sandbox = sinon.createSandbox();
    sandbox.spy(providers.getByTag(TAG), "config");
  });

  afterAll(() => {
    sandbox.restore();
  });

  it("should set baseUrl in admin-api-client tagged providers", () => {
    config({
      baseUrl: BASE_URL,
    });
    expect(providers.getByTag(TAG).config.getCall(0).args[0].baseUrl).toEqual(
      `${BASE_URL}${DEFAULT_BASE_PATH}`
    );
  });

  it("should set apiPath in admin-api-client tagged providers", () => {
    config({
      baseUrl: BASE_URL,
      apiPath: API_PATH,
    });
    expect(providers.getByTag(TAG).config.getCall(1).args[0].baseUrl).toEqual(
      `${BASE_URL}${API_PATH}`
    );
  });
});
