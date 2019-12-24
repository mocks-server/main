import { instances } from "@data-provider/core";
import TAG from "./tag";

const DEFAULT_OPTIONS = {
  apiPath: "/admin",
  baseUrl: "http://localhost:3100"
};

const config = options => {
  const finalOptions = {
    ...DEFAULT_OPTIONS,
    ...options
  };

  instances.getByTag(TAG).config({
    baseUrl: `${finalOptions.baseUrl}${finalOptions.apiPath}`
  });
};

config();

export default config;
