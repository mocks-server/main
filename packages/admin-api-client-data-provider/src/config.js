import { providers } from "@data-provider/core";
import {
  BASE_PATH,
  DEFAULT_PORT,
  DEFAULT_CLIENT_HOST,
  DEFAULT_PROTOCOL,
} from "@mocks-server/admin-api-paths";

import TAG from "./tag";

const DEFAULT_OPTIONS = {
  port: DEFAULT_PORT,
  host: DEFAULT_CLIENT_HOST,
  protocol: DEFAULT_PROTOCOL,
};

export const configClient = (options) => {
  const finalOptions = {
    ...DEFAULT_OPTIONS,
    ...options,
  };

  providers.getByTag(TAG).config({
    baseUrl: `${finalOptions.protocol}://${finalOptions.host}:${finalOptions.port}${BASE_PATH}`,
  });
};

configClient();
