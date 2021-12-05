import { providers } from "@data-provider/core";
import { DEFAULT_BASE_PATH } from "@mocks-server/admin-api-paths";
import TAG from "./tag";

const DEFAULT_OPTIONS = {
  apiPath: DEFAULT_BASE_PATH,
  baseUrl: "http://127.0.0.1:3100",
};

export const config = (options) => {
  const finalOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  providers.getByTag(TAG).config({
    baseUrl: `${finalOptions.baseUrl}${finalOptions.apiPath}`,
  });
};

config();
