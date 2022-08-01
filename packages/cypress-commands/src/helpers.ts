import type { CypressEnvVarValue, ArrayOfValues } from "./types";

export const ENABLED_ENVIRONMENT_VAR = "MOCKS_SERVER_ENABLED";
export const ADMIN_API_HOST_ENVIRONMENT_VAR = "MOCKS_SERVER_ADMIN_API_HOST";
export const ADMIN_API_PORT_ENVIRONMENT_VAR = "MOCKS_SERVER_ADMIN_API_PORT";

export const FALSY_VALUES = [false, "false", 0, "0"];

export function valueIsOneOf(
    value: CypressEnvVarValue,
    arrayOfValues: ArrayOfValues
  ): boolean {
  return arrayOfValues.includes(value);
}

export function isFalsy(value: CypressEnvVarValue) {
  return valueIsOneOf(value, FALSY_VALUES);
}
