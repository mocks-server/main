import type { CypressEnvVarValue, ArrayOfValues } from "./Helpers.types";

export const LOG_ENVIRONMENT_VAR = "MOCKS_SERVER_LOGS";
export const ENABLED_ENVIRONMENT_VAR = "MOCKS_SERVER_ENABLED";
export const ADMIN_API_HOST_ENVIRONMENT_VAR = "MOCKS_SERVER_ADMIN_API_HOST";
export const ADMIN_API_PORT_ENVIRONMENT_VAR = "MOCKS_SERVER_ADMIN_API_PORT";
export const ADMIN_API_HTTPS_ENVIRONMENT_VAR = "MOCKS_SERVER_ADMIN_API_HTTPS";

export const FALSY_VALUES = [false, "false", 0, "0"];
export const TRUTHY_VALUES = [true, "true", 1, "1"];

export function valueIsOneOf(value: CypressEnvVarValue, arrayOfValues: ArrayOfValues): boolean {
  return arrayOfValues.includes(value);
}

export function isFalsy(value: CypressEnvVarValue): boolean {
  return valueIsOneOf(value, FALSY_VALUES);
}

export function isTruthy(value: CypressEnvVarValue): boolean {
  return valueIsOneOf(value, TRUTHY_VALUES);
}

export function isUndefined(value: unknown): boolean {
  return typeof value === "undefined";
}
