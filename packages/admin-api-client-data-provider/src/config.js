import { providers } from "@data-provider/core";
import { BASE_PATH } from "@mocks-server/admin-api-paths";

import TAG from "./tag";

const DEFAULT_OPTIONS = {
  port: 3110,
  host: "127.0.0.1",
};

export const configClient = (options) => {
  const finalOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  providers.getByTag(TAG).config({
    baseUrl: `http://${finalOptions.host}:${finalOptions.port}${BASE_PATH}`,
  });
};

configClient();
